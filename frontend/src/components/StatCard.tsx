/**
 * Dashboard stats card
 */
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: string;
}

export default function StatCard({ title, value, icon, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className={`p-6 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        {icon && <span className="text-4xl">{icon}</span>}
      </div>
    </div>
  );
}
