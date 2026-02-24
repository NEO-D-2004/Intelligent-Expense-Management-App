import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Bot,
  User as UserIcon,
} from 'lucide-react';

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: Receipt, label: 'Transactions' },
    { path: '/analytics', icon: PieChart, label: 'Analytics' },
    { path: '/goals', icon: Target, label: 'Goals' },
    { path: '/assistant', icon: Bot, label: 'AI' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Expenzo</h1>
                  <p className="text-xs text-gray-500">Smart Finance</p>
                </div>
              </div>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            {/* Profile Link in Sidebar Footer */}
            <Link
              to="/profile"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${location.pathname === '/profile'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-gray-500">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">My Profile</p>
                <p className="text-xs text-gray-500">Manage account</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 flex items-center px-4 pt-[max(env(safe-area-inset-top),1.5rem)] h-[calc(4rem+max(env(safe-area-inset-top),1.5rem))]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg">ExpenseTracker</h1>
        </div>
        <div className="ml-auto">
          <Link to="/profile">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${location.pathname === '/profile' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <UserIcon className={`w-5 h-5 ${location.pathname === '/profile' ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:pl-64 w-full">
        {/* Desktop Top Header (for Profile Icon) */}
        <header className="hidden md:flex justify-end items-center h-16 bg-white border-b border-gray-200 px-8">
          <Link to="/profile">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors ${location.pathname === '/profile' ? 'bg-blue-50 ring-2 ring-blue-500 ring-offset-2' : 'bg-gray-100'}`}>
              <UserIcon className={`w-5 h-5 ${location.pathname === '/profile' ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
          </Link>
        </header>

        <main className="flex-1 pt-[calc(5rem+max(env(safe-area-inset-top),1.5rem))] pb-20 md:pt-6 md:pb-6 px-4 sm:px-6 lg:px-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <nav className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium truncate max-w-[60px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
