"use client";

import { useState } from "react";
import { GoalsList } from "@/components/goals/GoalsList";
import { AddGoalForm } from "@/components/goals/AddGoalForm";
import { Modal } from "@/components/ui/Modal";
import { Goal } from "@/lib/db/schema";

export default function GoalsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleAddGoal = () => {
    setEditingGoal(null);
    setShowAddModal(true);
  };

  const handleEditGoal = async (id: string) => {
    try {
      const response = await fetch(`/api/goals/${id}`);
      if (!response.ok) throw new Error("Failed to fetch goal");
      
      const data = await response.json();
      setEditingGoal(data.goal);
      setShowAddModal(true);
    } catch (error) {
      console.error("Error fetching goal:", error);
      alert("Failed to load goal");
    }
  };

  const handleSubmitGoal = async (goal: {
    category: string;
    targetAmount: number;
    month: string;
  }) => {
    try {
      let response;
      
      if (editingGoal) {
        // Update existing
        response = await fetch(`/api/goals/${editingGoal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetAmount: goal.targetAmount }),
        });
      } else {
        // Create new
        response = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goal),
        });
      }

      if (!response.ok) throw new Error("Failed to save goal");

      setShowAddModal(false);
      setEditingGoal(null);
      
      // Trigger a page refresh
      window.location.reload();
    } catch (error) {
      console.error("Error saving goal:", error);
      alert("Failed to save goal");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <GoalsList
          onAddGoal={handleAddGoal}
          onEditGoal={handleEditGoal}
        />

        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingGoal(null);
          }}
          title={editingGoal ? "Edit Goal" : "Add Budget Goal"}
        >
          <AddGoalForm
            onSubmit={handleSubmitGoal}
            onCancel={() => {
              setShowAddModal(false);
              setEditingGoal(null);
            }}
            initialData={
              editingGoal
                ? {
                    category: editingGoal.category,
                    targetAmount: editingGoal.targetAmount,
                    month: editingGoal.month,
                  }
                : undefined
            }
          />
        </Modal>
      </div>
    </div>
  );
}

