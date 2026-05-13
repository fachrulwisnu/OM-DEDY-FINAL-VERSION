import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  to: string;
  label: string;
  icon: LucideIcon;
  isOpen: boolean;
  isActive: boolean;
  badgeCount?: number;
  roles?: string[];
  userRole?: string;
  onClick?: () => void;
  showDot?: boolean;
}

export function SidebarItem({ 
  to, 
  label, 
  icon: Icon, 
  isOpen, 
  isActive, 
  badgeCount, 
  roles, 
  userRole, 
  onClick,
  showDot
}: SidebarItemProps) {
  // Role Access Check
  const hasAccess = roles ? roles.includes(userRole || '') : true;

  if (!hasAccess) return null;

  return (
    <NavLink
      to={to}
      onClick={(e) => {
        // e.preventDefault(); // FIXED: Removed to allow navigation
        if (onClick) onClick();
      }}
      className={({ isActive: navActive }) => cn(
        "w-full flex items-center py-3 px-4 transition-all relative group overflow-hidden",
        (navActive || isActive)
          ? "text-[var(--accent)] font-bold bg-[var(--accent)]/10" 
          : "text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--bg-page)]"
      )}
    >
      <Icon className={cn(
        "w-5 h-5 shrink-0 transition-colors z-10", 
        (isActive) ? "text-[var(--accent)]" : "text-[var(--text-sub)] group-hover:text-[var(--text-main)]"
      )} />
      
      {isOpen && (
        <span className="ml-4 text-[11px] uppercase tracking-widest truncate z-10 flex items-center gap-2 text-[var(--text-sub)] group-hover:text-[var(--text-main)]">
          {showDot && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />}
          {label}
        </span>
      )}

      {badgeCount !== undefined && badgeCount > 0 && (
        <span className={cn(
          "ml-auto bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-bounce shadow-lg ring-2 ring-white transition-all z-10",
          isOpen ? "w-5 h-5" : "w-4 h-4 absolute top-1 right-1"
        )}>
          {badgeCount}
        </span>
      )}

      {!isOpen && (
        <div className="absolute left-full ml-2 px-3 py-1 bg-[var(--bg-card)] text-[var(--text-main)] text-[10px] border border-[var(--border)] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-xl pointer-events-none z-50 transition-opacity">
          {label}
        </div>
      )}

      {(isActive) && (
        <div className="absolute right-0 top-2 bottom-2 w-1 bg-[var(--primary)] rounded-l-full" />
      )}
      
      {/* Subtle background on active - Handled in className now */}
      {/* (isActive) && (
        <div className="absolute inset-0 bg-[var(--primary)]/5" />
      ) */}
    </NavLink>
  );
}
