"use client";

import { useEffect, useState } from "react";
import { Goal } from "@/lib/db/schema";
import { GoalCard } from "./GoalCard";
import { Loading } from "../ui/Loading";
import { Button } from "../ui/Button";
import { Plus } from "lucide-react";
import { getCurrentMonth } from "@/lib/utils/format";

interface GoalsListProps {
  onAddGoal?: () => void;
  onEditGoal?: (id: string) => void;
  onDeleteGoal?: (id: string) => void;
}

export function GoalsList({
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
}: GoalsListProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(getCurrentMonth());

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/goals?month=${month}`);
      if (!response.ok) throw new Error("Failed to fetch goals");

      const data = await response.json();
      setGoals(data.goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [month]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete goal");
      
      fetchGoals();
      onDeleteGoal?.(id);
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Failed to delete goal");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Budget Goals
        </h2>
        {onAddGoal && (
          <Button onClick={onAddGoal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Month:
        </label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No goals set for this month
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={onEditGoal}
              onDelete={handleDelete}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

