import React from 'react';
import {
  LayoutDashboard,
  UserCircle,
  BookOpen,
  CalendarDays,
  LineChart,
  BrainCircuit,
  Lightbulb,
  FileSpreadsheet,
  Settings,
  LogOut,
  GraduationCap,
  Menu,
  X
} from 'lucide-react';
import { NavigationPage, UserProfile } from '../types';

interface NavigationProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const navItems: { id: NavigationPage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'planner', label: 'Study Planner', icon: CalendarDays },
    { id: 'tracker', label: 'Performance Tracker', icon: LineChart },
    { id: 'analyzer', label: 'AI Performance Analyzer', icon: BrainCircuit },
    { id: 'recommendations', label: 'AI Recommendations', icon: Lightbulb },
    { id: 'reports', label: 'Progress Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleNavClick = (page: NavigationPage) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-800 leading-tight">Study Planner AI</h1>
            <p className="text-[10px] text-slate-500">Performance Analyzer</p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-snug tracking-tight">Study Planner AI</h2>
            <p className="text-xs text-slate-500 font-normal">Performance Analyzer</p>
          </div>
        </div>

        {/* User Mini Card */}
        <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-purple-50/70 border border-purple-100">
          <p className="text-xs font-semibold text-purple-900 truncate">{currentUser.name}</p>
          <p className="text-[11px] text-purple-700/80 truncate">{currentUser.email}</p>
          {currentUser.course && (
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">{currentUser.course}</p>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-purple-100/80 text-purple-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-700' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
