import { getDB } from "@/lib/db/db";
import {
  parseTransaction,
  type ParsedEmail,
} from "@/lib/email/transaction-parser";

export async function POST(req: Request) {
  try {
    const { from, subject, body, date } = await req.json();

    // Convert received email data to ParsedEmail format
    const emailDate = date ? new Date(date) : new Date();
    const parsedEmail: ParsedEmail = {
      date: emailDate,
      subject: subject || "",
      from: from || "",
      text: body || "",
    };

    // Parse transaction from email body using robust parser
    const transaction = parseTransaction(parsedEmail);
    const db = getDB();

    if (!transaction) {
      console.log("Could not parse transaction from email:", { from, subject });
      return Response.json(
        { error: "Could not parse transaction" },
        { status: 400 }
      );
    }

    // Check for duplicate transactions (same date, amount, and merchant)
    const existing = db
      .prepare(
        `
        SELECT id FROM transactions 
        WHERE date = ? AND amount = ? AND merchant = ? AND source = 'email'
        LIMIT 1
      `
      )
      .get(transaction.date, transaction.amount, transaction.merchant);

    if (existing) {
      console.log("Duplicate transaction detected, skipping:", transaction);
      return Response.json(
        { success: true, message: "Duplicate transaction", transaction },
        { status: 200 }
      );
    }

    // Insert into database with all fields including category
    const insertStmt = db.prepare(
      `
      INSERT INTO transactions (id, date, amount, merchant, category, description, source)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    );

    insertStmt.run(
      `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transaction.date,
      transaction.amount,
      transaction.merchant,
      transaction.category,
      transaction.description || subject,
      "email"
    );

    console.log("Transaction inserted successfully:", transaction);
    return Response.json({ success: true, transaction });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
