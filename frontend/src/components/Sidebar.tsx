'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Map, BarChart3, Brain, Bell, LogIn, LogOut, Shield, Menu, X, BookOpen, Upload,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Crime Map', href: '/map', icon: Map },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Crime Stats', href: '/crime-stats', icon: BookOpen },
    { label: 'Predictions', href: '/predictions', icon: Brain },
    { label: 'Alerts', href: '/alerts', icon: Bell },
    ...(user ? [{ label: 'Upload Data', href: '/upload', icon: Upload }] : []),
    ...(user ? [] : [{ label: 'Login', href: '/login', icon: LogIn }]),
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center"
      >
        <Menu className="w-5 h-5 text-[var(--text-primary)]" />
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 z-50 flex flex-col glass-panel border-r border-[var(--border-color)] transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--gradient-primary)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">CrimeSense</h1>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">AI Intelligence Platform</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border border-[var(--accent-blue)]/20'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--accent-blue)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}`} />
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-[var(--border-color)] space-y-2">
          {user && (
            <div className="glass-card p-3 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-3.5 h-3.5 text-[var(--accent-green)]" />
                <span className="text-xs text-[var(--text-secondary)] truncate">{user.name}</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">{user.badge}</p>
            </div>
          )}
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="status-dot low animate-pulse-glow" />
              <span className="text-xs text-[var(--accent-green)] font-medium">SYSTEM ACTIVE</span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">AI Engine Online · v1.0</p>
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
