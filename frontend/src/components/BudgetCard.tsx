/**
 * Budget card component
 */
'use client';

interface BudgetCardProps {
  category: string;
  spent: number;
  limit: number;
  percentage: number;
  isExceeded: boolean;
}

export default function BudgetCard({
  category,
  spent,
  limit,
  percentage,
  isExceeded,
}: BudgetCardProps) {
  const getProgressColor = () => {
    if (isExceeded) return 'bg-red-600';
    if (percentage > 75) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{category}</h3>
        {isExceeded && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Over Budget</span>}
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>₹{spent.toFixed(2)}</span>
          <span>₹{limit.toFixed(2)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
      <p className="text-sm text-gray-600">{Math.round(percentage)}% of budget</p>
    </div>
  );
}
