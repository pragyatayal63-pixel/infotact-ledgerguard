import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Info,
  RotateCcw,
  LogOut,
  X,
  User,
} from 'lucide-react';
import type { DashboardTab, NotificationItem, Tenant, UserProfile } from '../../types/dashboard';
import type { CompanyProfile } from '../../api/types';

interface NavbarProps {
  currentTab: DashboardTab;
  user: UserProfile;
  company?: CompanyProfile | null;
  activeTenant: Tenant;
  notifications: NotificationItem[];
  onMarkNotificationsAsRead: () => void;
  onLogout: () => void;
  onOpenMobileSidebar: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  user,
  company,
  activeTenant,
  notifications,
  onMarkNotificationsAsRead,
  onLogout,
  onOpenMobileSidebar,
  searchTerm,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabTitles: Record<DashboardTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Overview',
      subtitle: 'Multi-tenant billing metrics, real-time consumption, and recent events',
    },
    ledger: {
      title: 'Billing Ledger',
      subtitle: 'Idempotent transactional event log and ACID state verification',
    },
    analytics: {
      title: 'Usage & Analytics',
      subtitle: 'Historical compute, API call distributions, and soft-cap budget alerts',
    },
    pools: {
      title: 'Database Pools',
      subtitle: 'Dynamic Mongoose tenant cluster routing and benchmark statistics',
    },
    audit: {
      title: 'Audit & Resiliency',
      subtitle: 'Zero-knowledge verification logs, timeout aborts, and state rollbacks',
    },
    settings: {
      title: 'Engine Configuration',
      subtitle: 'Redis lock TTL parameters, RSA-256 key rotation, and isolated pools',
    },
  };

  const { title } = tabTitles[currentTab] || {
    title: 'Dashboard',
    subtitle: 'Enterprise Billing & System Metrics',
  };

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 h-18 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8">
      <div className="h-full flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              {title}
            </h1>
          </div>
        </div>

        {/* Center: Read-only Tenant Organization Badge (No client-side switcher) */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
          <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
            <Building2 size={13} />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-semibold text-slate-900 block truncate max-w-[160px]">
              {company?.name || activeTenant.name}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block">
              tenant: {company?.tenantId || activeTenant.slug}
            </span>
          </div>
        </div>

        {/* Center-Right: Global Search */}
        <div className="flex-1 max-w-xs hidden md:block">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search events, services, references..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              aria-label="View notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-xs">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkNotificationsAsRead}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 sm:px-4 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                          !item.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {item.type === 'success' && (
                            <CheckCircle2 size={15} className="text-emerald-500" />
                          )}
                          {item.type === 'alert' && (
                            <AlertTriangle size={15} className="text-rose-500" />
                          )}
                          {item.type === 'rollback' && (
                            <RotateCcw size={15} className="text-amber-500" />
                          )}
                          {item.type === 'info' && (
                            <Info size={15} className="text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 leading-tight">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {item.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 inline-block">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center justify-center">
                {user.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {user.name ? user.name.split(' ')[0] : 'User'}
              </span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                    {company?.name || user.company}
                  </p>
                </div>

                <div className="py-1">
                  <div className="px-4 py-1.5 text-xs text-slate-600 flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <span>Role: {user.role}</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
