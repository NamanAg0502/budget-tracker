import { getDB } from "@/lib/db/db";
import { Transaction } from "@/lib/db/schema";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");
    const category = searchParams.get("category");
    const limit = searchParams.get("limit");

    const db = getDB();
    let query = "SELECT * FROM transactions WHERE 1=1";
    const params: any[] = [];

    if (fromDate) {
      query += " AND date >= ?";
      params.push(fromDate);
    }

    if (toDate) {
      query += " AND date <= ?";
      params.push(toDate);
    }

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    query += " ORDER BY date DESC, createdAt DESC";

    if (limit) {
      query += " LIMIT ?";
      params.push(parseInt(limit, 10));
    }

    const transactions = db.prepare(query).all(...params) as Transaction[];

    return Response.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, amount, merchant, category, description } = body;

    // Validate required fields
    if (!date || !amount || !merchant) {
      return Response.json(
        { error: "Missing required fields: date, amount, merchant" },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (typeof amount !== "number" || amount <= 0) {
      return Response.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const db = getDB();
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const insertStmt = db.prepare(
      `
      INSERT INTO transactions (id, date, amount, merchant, category, description, source)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    );

    insertStmt.run(
      transactionId,
      date,
      amount,
      merchant,
      category || "Uncategorized",
      description || "",
      "manual"
    );

    const transaction = db
      .prepare("SELECT * FROM transactions WHERE id = ?")
      .get(transactionId) as Transaction;

    return Response.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

