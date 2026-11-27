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

interface NavbarProps {
  currentTab: DashboardTab;
  user: UserProfile;
  tenants: Tenant[];
  activeTenant: Tenant;
  onSelectTenant: (tenant: Tenant) => void;
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
  tenants,
  activeTenant,
  onSelectTenant,
  notifications,
  onMarkNotificationsAsRead,
  onLogout,
  onOpenMobileSidebar,
  searchTerm,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const tenantRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabTitles: Record<DashboardTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Overview',
      subtitle: 'Multi-tenant billing metrics, real-time consumption, and recent events',
    },
    ledger: {
      title: 'Idempotent Ledger',
      subtitle: 'Audit log of all transactional events with idempotency tracking',
    },
    analytics: {
      title: 'Usage & Analytics',
      subtitle: 'Historical resource expenditures, invocations, and service distributions',
    },
    pools: {
      title: 'Dynamic DB Pools',
      subtitle: 'Multi-tenant database connection pools, health status, and query latencies',
    },
    audit: {
      title: 'Audit & Resiliency',
      subtitle: 'System activity logs, transaction rollback tracking, and health events',
    },
    settings: {
      title: 'Engine Settings',
      subtitle: 'Billing preferences, notification thresholds, and tenant options',
    },
  };

  const { title } = tabTitles[currentTab] || tabTitles.overview;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (tenantRef.current && !tenantRef.current.contains(event.target as Node)) {
        setShowTenantDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

        {/* Center: Tenant Switcher Dropdown */}
        <div className="relative" ref={tenantRef}>
          <button
            onClick={() => setShowTenantDropdown(!showTenantDropdown)}
            className="flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
          >
            <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              <Building2 size={13} />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-semibold text-slate-900">{activeTenant.name}</span>
            </div>
            <ChevronDown size={14} className="text-slate-400 ml-0.5" />
          </button>

          {showTenantDropdown && (
            <div className="absolute left-0 sm:right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 pb-2 border-b border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Select Tenant
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Switch organization to view tenant-specific data
                </p>
              </div>

              <div className="py-1">
                {tenants.map((t) => {
                  const isCurrent = t.id === activeTenant.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTenant(t);
                        setShowTenantDropdown(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{t.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {t.tier}
                        </p>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-600 shrink-0">
                        {t.queryLatencyMs}ms
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 hover:bg-slate-50 transition-colors flex gap-2.5 ${
                          !item.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {item.type === 'rollback' && (
                            <RotateCcw size={15} className="text-amber-500" />
                          )}
                          {item.type === 'success' && (
                            <CheckCircle2 size={15} className="text-emerald-500" />
                          )}
                          {item.type === 'alert' && (
                            <AlertTriangle size={15} className="text-rose-500" />
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
                {user.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {user.name.split(' ')[0]}
              </span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                    {user.company}
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
