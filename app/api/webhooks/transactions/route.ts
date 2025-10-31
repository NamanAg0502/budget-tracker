// app/api/webhook/transaction/route.ts
import { getDB } from "@/lib/db/db";

export async function POST(req: Request) {
  try {
    const { from, subject, body, date } = await req.json();

    // Parse transaction from email body
    const transaction = parseEmailTransaction({
      from,
      subject,
      body,
      date,
    });
    const db = getDB();

    if (!transaction) {
      return Response.json(
        { error: "Could not parse transaction" },
        { status: 400 }
      );
    }

    // Insert into database
    db.prepare(
      `
      INSERT INTO transactions (id, date, amount, merchant, description, source)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    ).run(
      `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transaction.date,
      transaction.amount,
      transaction.merchant,
      transaction.description,
      "email"
    );

    return Response.json({ success: true, transaction });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

function parseEmailTransaction(
  email: any
): { amount: number; merchant: string; description: string } | null {
  const { subject, body } = email;

  // HDFC: "Your account has been debited with Rs. 5,000 at XYZ Store"
  const hdfc = body.match(/Rs\.\s*([\d,]+(?:\.\d{2})?)/i);
  if (hdfc) {
    const merchant =
      body.match(/at\s+([^\s]+(?:\s+[^\s]+)*?)\s+on/i)?.[1] || "Unknown";
    return {
      amount: parseFloat(hdfc[1].replace(/,/g, "")),
      merchant: merchant.trim(),
      description: subject,
    };
  }

  // ICICI: "You have made a transaction of Rs. 3,000 at ABC Store"
  const icici = body.match(/Rs\.\s*([\d,]+(?:\.\d{2})?)/i);
  if (icici) {
    const merchant =
      body.match(/at\s+([^\s]+(?:\s+[^\s]+)*?)\s+(?:on|with)/i)?.[1] ||
      "Unknown";
    return {
      amount: parseFloat(icici[1].replace(/,/g, "")),
      merchant: merchant.trim(),
      description: subject,
    };
  }

  return null;
}
