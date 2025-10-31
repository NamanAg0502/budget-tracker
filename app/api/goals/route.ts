import { getDB } from "@/lib/db/db";
import { Goal } from "@/lib/db/schema";
import { getCurrentMonth } from "@/lib/utils/format";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || getCurrentMonth();

    const db = getDB();

    // Get all goals for the month
    const goals = db
      .prepare("SELECT * FROM goals WHERE month = ? ORDER BY category")
      .all(month) as Goal[];

    // Calculate spent amounts for each goal based on transactions
    const updatedGoals = goals.map((goal) => {
      const spentResult = db
        .prepare(
          `
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE category = ? AND date LIKE ?
      `
        )
        .get(goal.category, `${month}%`) as { total: number };

      return {
        ...goal,
        spent: spentResult.total,
      };
    });

    return Response.json({ goals: updatedGoals, month });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, targetAmount, month } = body;

    // Validate required fields
    if (!category || !targetAmount) {
      return Response.json(
        { error: "Missing required fields: category, targetAmount" },
        { status: 400 }
      );
    }

    // Validate targetAmount is a positive number
    if (typeof targetAmount !== "number" || targetAmount <= 0) {
      return Response.json(
        { error: "Target amount must be a positive number" },
        { status: 400 }
      );
    }

    const db = getDB();
    const goalMonth = month || getCurrentMonth();
    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if goal already exists for this category and month
    const existing = db
      .prepare("SELECT id FROM goals WHERE category = ? AND month = ?")
      .get(category, goalMonth);

    if (existing) {
      return Response.json(
        { error: "Goal already exists for this category and month" },
        { status: 409 }
      );
    }

    const insertStmt = db.prepare(
      `
      INSERT INTO goals (id, category, targetAmount, month, spent)
      VALUES (?, ?, ?, ?, 0)
    `
    );

    insertStmt.run(goalId, category, targetAmount, goalMonth);

    const goal = db
      .prepare("SELECT * FROM goals WHERE id = ?")
      .get(goalId) as Goal;

    return Response.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

