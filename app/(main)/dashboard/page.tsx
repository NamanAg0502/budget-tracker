"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Loading } from "@/components/ui/Loading";

interface DashboardStats {
  month: string;
  totalSpent: number;
  totalBudget: number;
  budgetUsedPercentage: number;
  categoryBreakdown: Array<{ category: string; total: number }>;
  dailyTrend: Array<{ date: string; total: number }>;
  topMerchants: Array<{ merchant: string; count: number; total: number }>;
  budgetProgress: Array<{
    category: string;
    target: number;
    spent: number;
    remaining: number;
    percentage: number;
    exceeded: boolean;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <Loading />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Failed to load dashboard statistics
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your spending for {new Date(stats.month + "-01").toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
          </p>
        </div>

        <div className="space-y-6">
          <StatsCards
            totalSpent={stats.totalSpent}
            totalBudget={stats.totalBudget}
            budgetUsedPercentage={stats.budgetUsedPercentage}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingChart dailyTrend={stats.dailyTrend} />
            <CategoryBreakdown categoryBreakdown={stats.categoryBreakdown} />
          </div>

          <RecentTransactions limit={5} />
        </div>
      </div>
    </div>
  );
}

