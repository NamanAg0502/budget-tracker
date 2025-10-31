import { getDB } from "@/lib/db/db";
import { getCurrentMonth } from "@/lib/utils/format";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || getCurrentMonth();
    const db = getDB();

    // Total spent this month
    const totalSpentResult = db
      .prepare(
        `
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE date LIKE ?
      `
      )
      .get(`${month}%`) as { total: number };
    const totalSpent = totalSpentResult.total;

    // Spending by category
    const categoryBreakdown = db
      .prepare(
        `
        SELECT category, COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE date LIKE ?
        GROUP BY category
        ORDER BY total DESC
      `
      )
      .all(`${month}%`) as Array<{ category: string; total: number }>;

    // Daily spending trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split("T")[0];

    const dailyTrend = db
      .prepare(
        `
        SELECT date, COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE date >= ?
        GROUP BY date
        ORDER BY date ASC
      `
      )
      .all(startDate) as Array<{ date: string; total: number }>;

    // Top merchants (this month)
    const topMerchants = db
      .prepare(
        `
        SELECT merchant, COUNT(*) as count, COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE date LIKE ?
        GROUP BY merchant
        ORDER BY total DESC
        LIMIT 10
      `
      )
      .all(`${month}%`) as Array<{ merchant: string; count: number; total: number }>;

    // Budget progress
    const goals = db
      .prepare("SELECT * FROM goals WHERE month = ?")
      .all(month) as Array<{ category: string; targetAmount: number }>;

    const budgetProgress = goals.map((goal) => {
      const spentResult = db
        .prepare(
          `
          SELECT COALESCE(SUM(amount), 0) as total
          FROM transactions
          WHERE category = ? AND date LIKE ?
        `
        )
        .get(goal.category, `${month}%`) as { total: number };

      const spent = spentResult.total;
      const percentage = goal.targetAmount > 0 
        ? (spent / goal.targetAmount) * 100 
        : 0;

      return {
        category: goal.category,
        target: goal.targetAmount,
        spent,
        remaining: Math.max(0, goal.targetAmount - spent),
        percentage: Math.min(100, percentage),
        exceeded: spent > goal.targetAmount,
      };
    });

    // Overall budget summary
    const totalBudget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const budgetUsedPercentage = totalBudget > 0 
      ? (totalSpent / totalBudget) * 100 
      : 0;

    return Response.json({
      month,
      totalSpent,
      totalBudget,
      budgetUsedPercentage: Math.min(100, budgetUsedPercentage),
      categoryBreakdown,
      dailyTrend,
      topMerchants,
      budgetProgress,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

