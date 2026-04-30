/**
 * Home page
 */
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">💰 Expense Tracker</h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage your finances with advanced analytics and budgeting tools
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 font-semibold"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
