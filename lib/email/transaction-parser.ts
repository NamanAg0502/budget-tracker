import { Transaction } from "@/lib/db/schema";

export interface ParsedEmail {
  date: Date;
  subject: string;
  from: string;
  text?: string;
  html?: string;
}

export function parseTransaction(email: ParsedEmail): Transaction | null {
  const text = email.text || "";

  // Indian bank transaction patterns
  const patterns = {
    // Debit patterns
    debit:
      /(?:debit|debited|withdrawn|spent|paid|transfer)\s*(?:of|:)?\s*(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)/gi,
    // Credit patterns
    credit:
      /(?:credit|credited|received|deposited)\s*(?:of|:)?\s*(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)/gi,
    // Merchant patterns
    merchant:
      /(?:merchant|at|from|to|shop|store|atm|account)[\s:]*([A-Z\s\-\.&\d]{3,})/i,
  };

  // Try to match amount (prioritize debit over credit)
  let amountMatch = text.match(patterns.debit);
  let amount = 0;

  if (amountMatch) {
    amount = parseFloat(amountMatch[0].replace(/[^\d.]/g, ""));
  } else {
    amountMatch = text.match(patterns.credit);
    if (amountMatch) {
      amount = parseFloat(amountMatch[0].replace(/[^\d.]/g, ""));
    }
  }

  if (amount === 0) {
    return null;
  }

  // Extract merchant
  const merchantMatch = text.match(patterns.merchant);
  const merchant = merchantMatch ? merchantMatch[1].trim() : "Unknown";

  // Extract category from merchant name
  const category = categorizeFromMerchant(merchant);

  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: email.date.toISOString().split("T")[0],
    amount,
    merchant: normalizeMerchantName(merchant),
    category,
    description: email.subject,
    source: "email",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeMerchantName(name: string): string {
  return name
    .replace(/[\d\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function categorizeFromMerchant(merchant: string): string {
  const merchantLower = merchant.toLowerCase();

  const categoryMap: Record<string, string[]> = {
    "food & dining": [
      "swiggy",
      "zomato",
      "restaurant",
      "cafe",
      "coffee",
      "pizza",
      "burger",
      "mcdonalds",
      "subway",
    ],
    transport: [
      "uber",
      "ola",
      "taxi",
      "metro",
      "fuel",
      "petrol",
      "gas station",
      "railways",
    ],
    shopping: [
      "amazon",
      "flipkart",
      "myntra",
      "uniqlo",
      "mall",
      "store",
      "mall",
      "shop",
    ],
    entertainment: [
      "netflix",
      "prime",
      "movie",
      "cinema",
      "games",
      "spotify",
      "youtube",
    ],
    utilities: [
      "electricity",
      "water",
      "gas",
      "internet",
      "mobile",
      "phone",
      "broadband",
    ],
    healthcare: [
      "hospital",
      "pharmacy",
      "doctor",
      "medical",
      "clinic",
      "health",
    ],
  };

  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some((kw) => merchantLower.includes(kw))) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }

  return "Uncategorized";
}

