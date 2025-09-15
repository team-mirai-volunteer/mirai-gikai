import { Home, FileText, BarChart3, Settings, User } from "lucide-react";
import { getCurrentSession } from "@/features/auth/lib/auth-server";
import { LogoutButton } from "@/features/auth/components/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  みらい議会 Admin
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="h-4 w-4" />
                <span>{session?.user.email}</span>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <a
              href="/dashboard"
              className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-blue-700"
            >
              <BarChart3 className="h-4 w-4" />
              <span>ダッシュボード</span>
            </a>
            <a
              href="/bills"
              className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-700"
            >
              <FileText className="h-4 w-4" />
              <span>議案管理</span>
            </a>
            <a
              href="/settings"
              className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-700"
            >
              <Settings className="h-4 w-4" />
              <span>設定</span>
            </a>
          </div>
        </nav>

        {/* Main content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
