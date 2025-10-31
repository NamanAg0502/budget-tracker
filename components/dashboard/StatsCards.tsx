"use client";

import { Card } from "../ui/Card";
import { formatCurrency } from "@/lib/utils/format";
import { Wallet, TrendingUp, Target, AlertCircle } from "lucide-react";

interface StatsCardsProps {
  totalSpent: number;
  totalBudget?: number;
  budgetUsedPercentage?: number;
}

export function StatsCards({
  totalSpent,
  totalBudget = 0,
  budgetUsedPercentage = 0,
}: StatsCardsProps) {
  const budgetRemaining = Math.max(0, totalBudget - totalSpent);
  const budgetExceeded = totalSpent > totalBudget;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </div>
      </Card>

      {totalBudget > 0 && (
        <>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Budget Remaining
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(budgetRemaining)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  budgetExceeded
                    ? "bg-red-100 dark:bg-red-900"
                    : "bg-purple-100 dark:bg-purple-900"
                }`}
              >
                <TrendingUp
                  className={`w-6 h-6 ${
                    budgetExceeded
                      ? "text-red-600 dark:text-red-400"
                      : "text-purple-600 dark:text-purple-400"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Budget Used
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {budgetUsedPercentage.toFixed(0)}%
                </p>
              </div>
            </div>
          </Card>

          {budgetExceeded && (
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Over Budget
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(totalSpent - totalBudget)}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

