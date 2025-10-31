import { getDB } from "@/lib/db/db";
import { Goal } from "@/lib/db/schema";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDB();
    const goal = db
      .prepare("SELECT * FROM goals WHERE id = ?")
      .get(id) as Goal | undefined;

    if (!goal) {
      return Response.json({ error: "Goal not found" }, { status: 404 });
    }

    // Calculate current spent amount from transactions
    const spentResult = db
      .prepare(
        `
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE category = ? AND date LIKE ?
      `
      )
      .get(goal.category, `${goal.month}%`) as { total: number };

    const updatedGoal = {
      ...goal,
      spent: spentResult.total,
    };

    return Response.json({ goal: updatedGoal });
  } catch (error) {
    console.error("Error fetching goal:", error);
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
    const { targetAmount } = body;

    const db = getDB();

    // Check if goal exists
    const existing = db
      .prepare("SELECT * FROM goals WHERE id = ?")
      .get(id) as Goal | undefined;

    if (!existing) {
      return Response.json({ error: "Goal not found" }, { status: 404 });
    }

    // Validate targetAmount
    if (targetAmount !== undefined) {
      if (typeof targetAmount !== "number" || targetAmount <= 0) {
        return Response.json(
          { error: "Target amount must be a positive number" },
          { status: 400 }
        );
      }

      db.prepare(
        "UPDATE goals SET targetAmount = ?, updatedAt = ? WHERE id = ?"
      ).run(targetAmount, new Date().toISOString(), id);
    }

    const updated = db
      .prepare("SELECT * FROM goals WHERE id = ?")
      .get(id) as Goal;

    // Calculate current spent amount
    const spentResult = db
      .prepare(
        `
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE category = ? AND date LIKE ?
      `
      )
      .get(updated.category, `${updated.month}%`) as { total: number };

    const result = {
      ...updated,
      spent: spentResult.total,
    };

    return Response.json({ goal: result });
  } catch (error) {
    console.error("Error updating goal:", error);
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

    // Check if goal exists
    const existing = db
      .prepare("SELECT id FROM goals WHERE id = ?")
      .get(id);

    if (!existing) {
      return Response.json({ error: "Goal not found" }, { status: 404 });
    }

    db.prepare("DELETE FROM goals WHERE id = ?").run(id);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

