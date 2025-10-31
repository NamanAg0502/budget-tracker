import { getDB } from "@/lib/db/db";
import { Transaction } from "@/lib/db/schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDB();
    const transaction = db
      .prepare("SELECT * FROM transactions WHERE id = ?")
      .get(id) as Transaction | undefined;

    if (!transaction) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    return Response.json({ transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { category, merchant, description, amount } = body;

    const db = getDB();

    // Check if transaction exists
    const existing = db
      .prepare("SELECT * FROM transactions WHERE id = ?")
      .get(id);

    if (!existing) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (category !== undefined) {
      updates.push("category = ?");
      values.push(category);
    }
    if (merchant !== undefined) {
      updates.push("merchant = ?");
      values.push(merchant);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    if (amount !== undefined) {
      if (typeof amount !== "number" || amount <= 0) {
        return Response.json(
          { error: "Amount must be a positive number" },
          { status: 400 }
        );
      }
      updates.push("amount = ?");
      values.push(amount);
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updatedAt = ?");
    values.push(new Date().toISOString());
    values.push(id);

    const updateQuery = `UPDATE transactions SET ${updates.join(", ")} WHERE id = ?`;

    db.prepare(updateQuery).run(...values);

    const updated = db
      .prepare("SELECT * FROM transactions WHERE id = ?")
      .get(id) as Transaction;

    return Response.json({ transaction: updated });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDB();

    // Check if transaction exists
    const existing = db
      .prepare("SELECT * FROM transactions WHERE id = ?")
      .get(id);

    if (!existing) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    db.prepare("DELETE FROM transactions WHERE id = ?").run(id);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

