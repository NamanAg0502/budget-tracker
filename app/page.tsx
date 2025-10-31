"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Wallet, TrendingUp, Target, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Budget Tracker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Track your spending, set goals, and take control of your finances
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/transactions">
              <Button variant="secondary" size="lg">
                View Transactions
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Track Expenses
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Automatically import transactions from your bank emails or add them manually
              </p>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Set Goals
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Create monthly budget goals and track your progress with visual indicators
              </p>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Analyze Spending
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                View detailed breakdowns and trends to understand where your money goes
              </p>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            New to Budget Tracker?
          </p>
          <div className="space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost">
                View Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/goals">
              <Button variant="ghost">
                Set Your First Goal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
