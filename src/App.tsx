import React, { useState, useMemo, useEffect, Component, ErrorInfo, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, Routes, Route, useLocation, useParams, Navigate } from 'react-router-dom';
import * as XLSX from 'xlsx-js-style';

const handleExcelExport = (data: any[], fileName: string, merges?: any[], cols?: any[]) => {
  const ws = XLSX.utils.json_to_sheet(data);
  if (merges) ws['!merges'] = merges;
  if (cols) ws['!cols'] = cols;
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SLA_Report");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

import { HOLIDAYS_2026, CUTI_BERSAMA_2026, PHASE_L1_OPTIONS, PHASE_ORDER } from './constants';
import { 
  Plus, 
  History,
  LayoutGrid,
  AlertTriangle,
  Cpu,
  LayoutDashboard,
  Users,
  ShieldAlert,
  FolderKanban,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
  Search,
  Trash2,
  ShieldCheck,
  ExternalLink,
  Edit3,
  Save,
  UserPlus,
  X,
  Menu,
  ArrowRight,
  User as UserIcon,
  Clock,
  ArrowLeft,
  ArrowDown,
  Rocket,
  Activity,
  Zap,
  BarChart3,
  Calendar,
  Layers,
  PlusSquare,
  Upload,
  Download,
  Filter,
  Copy,
  Database,
  FileText,
  Info,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Toaster, toast } from 'react-hot-toast';
import { 
  format, 
  addHours, 
  startOfDay, 
  endOfDay, 
  eachHourOfInterval, 
  isSameHour,
  differenceInHours,
  addDays,
  addWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  isSameDay,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  endOfYear,
  startOfYear,
  addYears,
  eachWeekOfInterval,
  isWithinInterval,
  addMonths,
  subMonths,
  subDays,
  isToday,
  isWeekend
} from 'date-fns';
import { calculateTimelineRange, calculateBarCoordinates, sanitizeDate, normalizeDate, calculateParentRange } from './utils/timelineEngine';
import { canEditTask } from './utils/permissionHelper';
import { Task, ViewScale, TaskStatus, ProjectStatus, Project, AppUser, AppView, AuditLog, Schedule, ProjectRescheduleLog, RescheduleRequest, MasterProject, MasterProjectAuditLog, HistoryEditProject } from './types';
import { cn, calculateTimeliness } from './lib/utils';
import { getSafeKey } from './utils/keyHelper';
import ProjectDetail from './components/ProjectDetail';

/**
 * ROBUST PERSISTENT ID GENERATOR
 * ONLY call this when creating NEW entities (Phase, Task, Project).
 * NEVER call this inside a render function or .map() logic.
 */
export const createPersistentId = () => {
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return `pers-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    } catch (e) {
      return `pers-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
};

import { useTasks } from './hooks/useTasks';
import { taskService } from './services/taskService';
import { supabase } from './lib/supabase';
import { calculateGlobalProjectStatus, torAutoSync } from './services/torMonitorService';

import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { MasterProject as MasterProjectHub } from './components/MasterProject';
import { TicketSelector } from './components/TicketSelector';
import { TorMonitor } from './components/TorMonitor';
import NotionMigrationBoard from './components/NotionMigrationBoard';
import { NotionMonitoring } from './components/NotionMonitoring';
import { NotionSyncDashboard } from './components/NotionSyncDashboard';
import KanbanNotionAPI from './components/KanbanNotionAPI';
import KaldevView from './components/KaldevView';
import SwaggerDocs from './components/SwaggerDocs';
import PmaIntegration from './components/PmaIntegration';
import { exportToExcel } from './utils/exportExcel';
import { CustomDatePicker } from './components/ui/CustomDatePicker';

const formatWorkday = (totalHours: number) => {
  if (!totalHours || totalHours <= 0) return '-';
  const days = Math.floor(totalHours / 9);
  const remainingHours = Math.floor(totalHours % 9);
  const remainingMinutes = Math.round((totalHours % 1) * 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days} Hari Kerja`);
  if (remainingHours > 0) parts.push(`${remainingHours} Jam`);
  if (remainingMinutes > 0) parts.push(`${remainingMinutes} Menit`);
  
  return parts.length > 0 ? parts.join(' ') : '-';
};

// Utils moved to ganttDateUtils.ts
const formatDateForDB = (dateInput: any) => {
    return sanitizeDate(dateInput);
};

// Use getSafeKey from utils/keyHelper.ts instead.

// --- Collision Engine ---
const getCollision = (currentTask: Task, allTasks: Task[], projects: Project[]) => {
  const overlap = allTasks.filter(task => {
    if (task.id === currentTask.id) return false;
    
    // Ignore parent-child relationship as they naturally overlap in time
    if (task.id === currentTask.parent_id || currentTask.id === task.parent_id) return false;
    
    if (!currentTask.start_time || !task.start_time) return false;
    
    const start1 = new Date(currentTask.start_time).getTime();
    const end1 = new Date(currentTask.end_time).getTime();
    const start2 = new Date(task.start_time).getTime();
    const end2 = new Date(task.end_time).getTime();

    const timeOverlap = start1 < end2 && end1 > start2;
    if (!timeOverlap) return false;

    const samePIC = currentTask.assignee && task.assignee && currentTask.assignee === task.assignee;
    const sameDev = currentTask.dev_name && task.dev_name && currentTask.dev_name === task.dev_name;
    const sameQA = currentTask.qa_name && task.qa_name && currentTask.qa_name === task.qa_name;

    return samePIC || sameDev || sameQA;
  });

  if (overlap.length === 0) return null;

  return overlap.map(collisionTask => {
    const project = projects.find(p => p.id === collisionTask.project_id);
    return {
      ...collisionTask,
      projectName: project?.project_name || 'Unknown Project'
    };
  });
};

const isWBSConflict = (parent: any, child: any) => {
  if (!parent || !child) return false;
  if (!parent.start_time || !parent.end_time || !child.start_time || !child.end_time) return false;
  
  const pStart = new Date(parent.start_time).getTime();
  const pEnd = new Date(parent.end_time).getTime();
  const cStart = new Date(child.start_time).getTime();
  const cEnd = new Date(child.end_time).getTime();

  // It is ONLY a conflict if child starts before parent OR ends after parent
  return (cStart < pStart || cEnd > pEnd);
};

// --- Components ---

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Wizard Critical Failure</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                The interface encountered a runtime error or missing asset. The component has been isolated for safety.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase text-xs tracking-widest rounded-xl transition-all"
            >
              Relational Reset (Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

const StatusBadge = ({ status, type = 'task' }: { status: string, type?: 'project' | 'task' }) => {
  const isOverdue = status.toLowerCase().includes('overdue');
  const isDone = status.toLowerCase() === 'done' || status.toLowerCase() === 'live';
  const isCancel = status.toLowerCase() === 'cancel' || status.toLowerCase() === 'canceled';

  const styles: Record<string, string> = {
    // Task Status (Task 3 Unification)
    'TODO': 'bg-slate-500/20 text-slate-400 border-slate-500/50',
    'IN PROGRESS': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    'ON QUEUE': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50',
    'DONE': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    'ON HOLD': 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    'CANCEL': 'bg-rose-500/20 text-rose-400 border-rose-500/50',
    
    // Project Status (Mapping to Uppercase Enums)
    'FSD ON PROGRESS': 'bg-blue-500/10 text-blue-400 border-blue-100',
    'DEVELOPMENT ON PROGRESS': 'bg-blue-500/10 text-blue-400 border-blue-100',
    'SIT ON PROGRESS': 'bg-indigo-500/10 text-indigo-400 border-indigo-100',
    'UAT ON PROGRESS': 'bg-violet-500/10 text-violet-400 border-violet-100',
    'LIVE': 'bg-emerald-500/10 text-emerald-500 border-emerald-100',
    'PROJECT LATE': 'bg-rose-500/10 text-rose-500 border-rose-500',
  };

  // Add logic for dynamic overdue labels like "Overdue 5 days"
  let appliedStyle = styles[status];
  if (!appliedStyle) {
    if (isOverdue) appliedStyle = styles['Overdue'];
    if (status.toLowerCase().includes('early')) appliedStyle = styles['Early'];
  }

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-widest whitespace-nowrap",
      appliedStyle || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    )}>
      {status || 'Unknown'}
    </span>
  );
};

const TaskStatusSelector = ({ status, onUpdate, disabled }: { status: any, onUpdate: (s: any) => void, disabled?: boolean }) => {
  const options = [
    'TODO',
    'IN PROGRESS',
    'ON QUEUE',
    'DONE',
    'ON HOLD',
    'CANCEL',
    'LIVE'
  ];
  if (disabled) return <StatusBadge status={status} />;
  
  const curStatus = status?.toUpperCase() || 'TODO';

  return (
    <select 
      value={curStatus}
      onChange={(e) => onUpdate(e.target.value)}
      disabled={disabled}
      className={cn(
        "bg-[#020437] border border-[var(--border)] rounded px-2 py-1 text-[9px] font-black uppercase outline-none transition-all cursor-pointer",
        curStatus === 'DONE' ? "text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30" : 
        curStatus === 'LIVE' ? "text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30" : 
        curStatus === 'ON HOLD' ? "text-amber-400 border-amber-500/50 hover:bg-amber-500/30" :
        curStatus === 'ON QUEUE' ? "text-indigo-400 border-indigo-500/50 hover:bg-indigo-500/30" :
        curStatus === 'IN PROGRESS' ? "text-blue-400 border-blue-500/50 hover:bg-blue-500/30" :
        curStatus === 'CANCEL' ? "text-rose-400 border-rose-500/50 hover:bg-rose-500/30" :
        "text-slate-400 border-slate-500/50 hover:bg-slate-500/30"
      )}
    >
      {options.map((opt, i) => <option key={getSafeKey({id: opt}, i, 'task-status-opt')} value={opt} className="bg-[#020437] text-white">{opt}</option>)}
    </select>
  );
};

const ProjectStatusSelector = ({ status, onUpdate, disabled }: { status: any, onUpdate: (s: any) => void, disabled?: boolean }) => {
  const options = [
    ProjectStatus.TODO,
    ProjectStatus.IN_PROGRESS,
    ProjectStatus.FSD_PROGRESS,
    ProjectStatus.DEV_PROGRESS,
    ProjectStatus.SIT_PROGRESS,
    ProjectStatus.UAT_PROGRESS,
    ProjectStatus.LIVE,
    ProjectStatus.HOLD,
    ProjectStatus.CANCEL,
    ProjectStatus.LATE
  ];
  if (disabled) return <StatusBadge status={status} />;
  return (
    <select 
      value={status || ProjectStatus.TODO}
      onChange={(e) => onUpdate(e.target.value)}
      disabled={disabled}
      className={cn(
        "bg-[#020437] border border-slate-800 rounded px-2 py-1 text-[9px] font-black uppercase outline-none transition-all cursor-pointer",
        status === ProjectStatus.LIVE ? "text-emerald-400" :
        (status === ProjectStatus.HOLD) ? "text-purple-400" :
        (status === ProjectStatus.CANCEL) ? "text-slate-500" :
        (status === ProjectStatus.LATE) ? "text-rose-400" :
        "text-indigo-400"
      )}
    >
      {options.map((opt, i) => <option key={getSafeKey({id: opt}, i, 'project-status-opt')} value={opt} className="bg-[#020437] text-white">{opt}</option>)}
    </select>
  );
};

const ApprovalBadge = ({ value, label, onUpdate, disabled }: { value: string | null, label: string, onUpdate: (val: string) => void, disabled?: boolean }) => {
  const options = ['Pending', 'Revise', 'OK'];
  const safeValue = options.includes(value || '') ? (value || 'Pending') : 'Pending';

  if (disabled) return <span className="text-[9px] font-black uppercase text-[var(--text-sub)]">{safeValue}</span>;

  return (
    <div className="flex flex-col gap-1 w-full max-w-[80px]">
      <select 
        value={safeValue}
        onChange={(e) => onUpdate(e.target.value)}
        disabled={disabled}
        className={cn(
          "bg-[var(--bg-page)] border border-[var(--border)] rounded px-1.5 py-1 text-[9px] font-black uppercase tracking-tighter outline-none focus:ring-1 focus:ring-[var(--accent)]/50 transition-all cursor-pointer w-full",
          safeValue === 'OK' ? "text-emerald-400 border-emerald-500/30" :
          safeValue === 'Revise' ? "text-rose-400 border-rose-500/30" :
          "text-[var(--text-sub)]"
        )}
      >
        {options.map((opt, i) => (
          <option 
            key={getSafeKey({id: opt}, i, 'approval-opt')} 
            value={opt} 
            className="bg-[var(--bg-page)]"
          >
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};


// --- Main App ---

// --- Health Engine ---

const getTaskHealth = (task: Task) => {
  if (task.status === TaskStatus.DONE) return 'Stable';
  
  const now = new Date();
  const end = new Date(task.end_time);
  
  if (now > end) return 'OVERDUE';
  
  if (task.target_sla_date) {
    const sla = new Date(task.target_sla_date);
    if (now > sla) return 'OVER SLA';
  }
  
  return 'Healthy';
};

const HealthBadge = ({ health }: { health: string }) => {
  if (health === 'Stable') return null;
  if (health === 'Healthy') return null;
  
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse shadow-lg",
      health === 'OVERDUE' ? "bg-rose-500 text-white shadow-rose-500/20" : "bg-amber-500 text-slate-900 shadow-amber-500/20"
    )}>
      {health}
    </span>
  );
};

// --- Custom UI Overlays ---

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = 'Hapus', 
  cancelText = 'Batal',
  variant = 'danger'
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  description: string,
  confirmText?: string,
  cancelText?: string,
  variant?: 'danger' | 'primary'
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden p-6"
        >
          <div className="flex flex-col items-center text-center">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-4",
              variant === 'primary' ? "bg-indigo-500/10" : "bg-red-500/10"
            )}>
              {variant === 'primary' ? (
                <ShieldCheck className="w-6 h-6 text-indigo-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">{description}</p>
          </div>
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => { onConfirm(); onClose(); }}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold",
                variant === 'primary' 
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white" 
                  : "bg-red-500/10 hover:bg-red-600 border border-red-500/20 text-red-500 hover:text-white"
              )}
            >
              {variant === 'danger' && <Trash2 className="w-4 h-4" />}
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const SuccessNotification = ({ show, message, onClose }: { show: boolean, message: string, onClose: () => void }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-8 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.4)] flex items-center gap-3 border border-emerald-400"
        >
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <Plus className="w-3 h-3 rotate-45" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Components ---

function EditableInput({ value, onSave, className, placeholder, type = 'text', min, max, disabled, debounceMs }: { 
  value: string | number, 
  onSave: (val: any) => void, 
  className?: string, 
  placeholder?: string,
  type?: 'text' | 'number',
  min?: string | number,
  max?: string | number,
  disabled?: boolean,
  debounceMs?: number
}) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const saveValue = (val: any) => {
    if (type === 'number') {
      let finalVal = parseFloat(String(val)) || 0;
      if (min !== undefined) finalVal = Math.max(Number(min), finalVal);
      if (max !== undefined) finalVal = Math.min(Number(max), finalVal);
      onSave(finalVal);
    } else {
      onSave(val);
    }
  };

  const handleBlur = () => {
    if (disabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (localValue !== value) {
      saveValue(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      (e.target as HTMLInputElement).blur();
    }
  };

  if (disabled) {
    return <span className={cn(className, "cursor-default opacity-80")}>{value || placeholder || '-'}</span>;
  }

  return (
    <input 
      type={type}
      min={min}
      value={localValue}
      onChange={(e) => {
        const val = e.target.value;
        setLocalValue(val);
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

const CollisionWarning = ({ collisions }: { collisions: any[] }) => {
  return (
    <div className="relative group inline-flex items-center justify-center ml-2">
      <button 
        className="text-rose-500 animate-pulse hover:scale-110 transition-transform"
      >
        <AlertTriangle className="w-4 h-4" />
      </button>
      
      <div className="absolute bottom-full mb-2 hidden group-hover:block w-max max-w-xs bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-md p-3 z-[100] shadow-xl pointer-events-none">
        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" /> External Conflict Detected
        </p>
        <div className="space-y-3">
          {(collisions || []).map((c, i) => {
            if (!c) return null;
            return (
              <div 
                key={getSafeKey(c, i, 'collision')} 
                className="text-[11px] leading-relaxed border-l-2 border-slate-800 pl-2"
              >
                <span className="text-slate-300 font-bold block mb-0.5">Project: {c.projectName || 'Unknown'}</span>
                <span className="text-slate-500 block">Task: <span className="text-indigo-400">"{c.title || 'Untitled'}"</span></span>
                <span className="text-slate-500 block">Conflict: {c.start_time ? format(new Date(c.start_time), 'MMM dd') : '??'} - {c.end_time ? format(new Date(c.end_time), 'MMM dd') : '??'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ProfileSettingsModal = ({ 
  isOpen, 
  onClose, 
  user,
  onUpdate
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  user: AppUser | null,
  onUpdate: (updated: AppUser) => void
}) => {
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || '');
  const [accessLevel, setAccessLevel] = useState(user?.access_level || 'PIC');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates = {
        name,
        role,
        access_level: accessLevel,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        onUpdate(data);
        onClose();
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      alert('Error updating profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const isPIC = user?.access_level === 'PIC';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800 bg-indigo-600/5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-indigo-500" />
              Profile Configuration
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Personnel Detail Node</p>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Full Identity Name</label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                placeholder="Ex: Fachrul Wisnu"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Organizational Role</label>
              <input 
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                placeholder="Ex: Senior Developer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Access Level Privilege</label>
              <select 
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                disabled={isPIC}
                className={cn(
                  "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-colors appearance-none",
                  isPIC && "opacity-50 cursor-not-allowed"
                )}
              >
                <option value="PIC">PIC / Standard Personnel</option>
                <option value="Admin">Administrator</option>
                <option value="Superadmin">Super Administrator</option>
              </select>
              {isPIC && (
                <p className="text-[9px] text-rose-500/70 font-bold uppercase italic mt-1 ml-1 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Promotion Restricted for PIC role
                </p>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all"
              >
                Abort
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? "Syncing..." : "Commit Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default function App() {
  const { user: authUser, currentUser, loading: authLoading, signOut: realSignOut, setCurrentUser } = useAuth();
  
  // No longer use mock user as primary, use currentUser from context
  const user = useMemo(() => currentUser || (authUser ? ({
    id: authUser.id,
    name: authUser.email?.split('@')[0] || 'Unknown',
    email: authUser.email || '',
    access_level: 'PIC',
    role: 'Viewer'
  } as AppUser) : null), [authUser, currentUser]);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const isSyncingRef = React.useRef(false);

  const handleOpenReschedule = (p: Project) => {
    setReschedulingProject(p);
  };

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return user.access_level === 'Superadmin' || user.access_level === 'Admin';
  }, [user]);

  const isSuperadmin = useMemo(() => {
    if (!user) return false;
    return user.access_level === 'Superadmin' || user.email?.toLowerCase().includes('wisnu');
  }, [user]);

  const canAccessReschedule = useMemo(() => {
    if (!user) return false;
    return isAdmin || user.access_level === 'Developer' || user.access_level === 'QA';
  }, [user, isAdmin]);

  const signOut = () => {
    realSignOut();
    navigate('/login');
  };

  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [pendingRescheduleCount, setPendingRescheduleCount] = useState(0);

  const [viewState, setViewState] = useState<AppView>('PROJECTS');
  
  // Explicitly map URL to View for legacy support and cleaner routing
  const activeView = useMemo(() => {
    const path = location.pathname;
    if (path === '/timeline') return 'TIMELINE';
    if (path === '/' || path === '/portofolio' || path === '/portfolio' || path === '/projects') return 'PROJECTS';
    if (path.startsWith('/detail-timeline')) return 'GANTT_DETAIL';
    if (path === '/kanban') return 'KANBAN';
    if (path === '/schedule') return 'SCHEDULE';
    if (path === '/audit') return 'AUDIT';
    if (path === '/personnel') return 'PERSONEL';
    if (path === '/reschedule') return 'RESCHEDULE';
    if (path === '/approvals') return 'RESCHEDULE';
    if (path === '/master-project') return 'MASTER_PROJECT';
    if (path === '/tor-monitor') return 'TOR_MONITOR';
    if (path === '/notion-migrate') return 'NOTION_MIGRATE';
    if (path === '/notion-monitoring') return 'NOTION_MONITORING';
    if (path === '/notion-api-results') return 'NOTION_API_RESULTS';
    if (path === '/kaldev') return 'OM_DEDY_KALDEV';
    if (path === '/api-docs') return 'API_DOCS';
    if (path === '/login') return 'LOGIN';
    if (path.startsWith('/project/')) return 'GANTT_DETAIL';
    return viewState;
  }, [location.pathname, viewState]);

  const setActiveView = (view: AppView) => {
    const executeAction = () => {
      setViewState(view);
      switch(view) {
        case 'PROJECTS': navigate('/portofolio'); break;
        case 'KANBAN': navigate('/kanban'); break;
        case 'SCHEDULE': navigate('/schedule'); break;
        case 'AUDIT': navigate('/audit'); break;
        case 'PERSONEL': navigate('/personnel'); break;
        case 'RESCHEDULE': navigate('/approvals'); break;
        case 'MASTER_PROJECT': navigate('/master-project'); break;
        case 'TOR_MONITOR': navigate('/tor-monitor'); break;
        case 'NOTION_MIGRATE': navigate('/notion-migrate'); break;
        case 'NOTION_MONITORING': navigate('/notion-monitoring'); break;
        case 'NOTION_API_RESULTS': navigate('/notion-api-results'); break;
        case 'TIMELINE': navigate('/timeline'); break;
        case 'OM_DEDY_KALDEV': navigate('/kaldev'); break;
        case 'API_DOCS': navigate('/api-docs'); break;
        case 'GANTT_DETAIL': 
          if (selectedProjectId) navigate(`/detail-timeline/${selectedProjectId}`);
          else navigate('/portofolio');
          break;
      }
    };

    if (hasUnsavedChanges) {
      setPendingAction(() => executeAction);
      setShowGlobalUnsavedModal(true);
      return;
    }
    executeAction();
  };

  // RBAC Redirect Protection
  useEffect(() => {
    if (!authLoading && user) {
      const path = location.pathname;
      const isRestrictedPath = path === '/personnel' || path === '/approvals' || path === '/audit';
      if (isRestrictedPath && !isAdmin) {
        navigate('/portofolio');
      }
    }
  }, [location.pathname, isAdmin, user, authLoading]);

  // Sync selectedProjectId from URL
  useEffect(() => {
    const projectMatch = location.pathname.match(/\/project\/(.+)/);
    const detailMatch = location.pathname.match(/\/detail-timeline\/(.+)/);
    const match = projectMatch || detailMatch;
    
    if (match) {
      if (match[1] === 'global') {
        setSelectedProjectId(null);
      } else {
        setSelectedProjectId(match[1]);
      }
    } else {
      setSelectedProjectId(null);
    }
  }, [location.pathname]);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showGlobalUnsavedModal, setShowGlobalUnsavedModal] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const [notif, setNotif] = useState<string | null>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allAuditLogs, setAllAuditLogs] = useState<AuditLog[]>([]);
  const [allHistoryEditLogs, setAllHistoryEditLogs] = useState<HistoryEditProject[]>([]);



  
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeAuditTab, setActiveAuditTab] = useState<'LOG_SYSTEM' | 'HISTORY_EDIT'>('HISTORY_EDIT');
  
  const [loading, setLoading] = useState(true);
  const [isSilentSync, setIsSilentSync] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProjectsMobileExpanded, setIsProjectsMobileExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const [scale, setScale] = useState<ViewScale>('DAY');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
  const [rescheduleRequests, setRescheduleRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const fetchRescheduleRequests = async () => {
    if (!canAccessReschedule) return;
    setRequestsLoading(true);
    try {
      const data = await taskService.getRescheduleRequests();
      setRescheduleRequests(data || []);
      // BUG FIX: Count only pending requests for the badge
      const pendingCount = (data || []).filter(r => r.status === 'Pending').length;
      setPendingRescheduleCount(pendingCount);
    } catch (err) {
      console.error("Failed to fetch reschedule requests:", err);
    } finally {
      setRequestsLoading(false);
    }
  };
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isEditWBSModalOpen, setIsEditWBSModalOpen] = useState(false);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [reschedulingProject, setReschedulingProject] = useState<Project | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'task' | 'project' | 'user' | 'phase' | 'subtask', phaseIdx?: number, subIdx?: number} | null>(null);

  const requestDeleteTask = (id: string) => {
    setItemToDelete({ id, type: 'task' });
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    const { id, type, phaseIdx, subIdx } = itemToDelete;
    
    if (type === 'task') handleDeleteTask(id);
    else if (type === 'project') handleDeleteProject(id);
    else if (type === 'user') handleDeleteUser(id);
    
    setItemToDelete(null);
  };

  // Automatic "Project Late" Detection (Optimized to avoid loops)
  useEffect(() => {
    const checkLateProjects = async () => {
      const lateProjects = projects.filter(p => {
        if (p.status === ProjectStatus.LATE || p.status === ProjectStatus.LIVE || p.status === ProjectStatus.CANCEL) return false;
        const projectTasks = tasks.filter(t => t.project_id === p.id);
        if (projectTasks.length === 0) return false;
        
        const latestEnd = Math.max(...projectTasks.map(t => new Date(t.end_time).getTime()));
        return latestEnd < new Date().getTime();
      });

      if (lateProjects.length === 0) return;

      for (const p of lateProjects) {
        try {
          // Update project to 'Project Late'
          const updated = await taskService.updateProject(p.id, { status: ProjectStatus.LATE }, 'System Late Detector');
          // Update local state without triggering refetch
          setProjects(prev => prev.map(item => item.id === p.id ? updated : item));
        } catch (err) {
          console.error("Failed to update late project status:", err);
        }
      }
    };

    const timer = setTimeout(() => {
      if (!loading && projects.length > 0 && tasks.length > 0) {
        checkLateProjects();
      }
    }, 5000); // Check every 5s instead of every render

    return () => clearTimeout(timer);
  }, [projects.length, tasks.length, loading]);

  // Auth guard temporarily disabled for setup purposes
  // if (authLoading) return (
  //   <div className="min-h-screen bg-[#020617] flex items-center justify-center">
  //     <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
  //   </div>
  // );

  // if (!user) return <LoginPage />;

  const isInitialFetch = useRef(true);

  const fetchData = useCallback(async () => {
    // If we are already loading or already fetched, skip unless forced (refreshKey)
    if (!isInitialFetch.current && refreshKey === 0) return;
    
    try {
      if (!isSilentSync) setLoading(true);
      const [p, u, t, a, h] = await Promise.all([
        taskService.getProjects(),
        taskService.getUsers(),
        taskService.getAllTasks(),
        taskService.getAuditLogs(),
        taskService.getHistoryEditProjects()
      ]);
      const processedTasks = (t || []).map(task => ({
        ...task,
        level: task.parent_id ? 2 : 1
      })).sort((a, b) => {
        if (!a.parent_id && !b.parent_id) {
           const getOrder = (title: string) => {
              const str = (title || '').toUpperCase();
              for (const key in PHASE_ORDER) {
                 if (str.includes(key)) return (PHASE_ORDER as any)[key];
              }
              return 99;
           };
           const orderA = getOrder(a.title);
           const orderB = getOrder(b.title);
           if (orderA !== orderB) return orderA - orderB;
        }
        const dateA = a.start_time ? new Date(a.start_time).getTime() : 0;
        const dateB = b.start_time ? new Date(b.start_time).getTime() : 0;
        return dateA - dateB;
      });
      setProjects(p || []);
      setUsers(u || []);
      setTasks(processedTasks);
      setAllAuditLogs(a || []);
      setAllHistoryEditLogs(h || []);
      isInitialFetch.current = false;
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
      setIsSilentSync(false);
    }
  }, [refreshKey, isSilentSync]);

  useEffect(() => {
    fetchData();

    // OPTIMIZED REALTIME: Update local state instead of full refetch
    const projectSub = supabase
      .channel('projects_realtime_optimized')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProjects(prev => [payload.new as Project, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setProjects(prev => prev.map(p => p.id === payload.new.id ? payload.new as Project : p));
        } else if (payload.eventType === 'DELETE') {
          setProjects(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    const taskSub = supabase
      .channel('tasks_realtime_optimized')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newTask = { ...payload.new as Task, level: payload.new.parent_id ? 2 : 1 };
          setTasks(prev => [...prev, newTask]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => t.id === payload.new.id ? { ...payload.new as Task, level: payload.new.parent_id ? 2 : 1 } : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    const historySub = supabase
      .channel('history_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'history_edit_project' }, (payload) => {
        setAllHistoryEditLogs(prev => [payload.new as HistoryEditProject, ...prev]);
      })
      .subscribe();

    const auditSub = supabase
      .channel('audit_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
        setAllAuditLogs(prev => [payload.new as AuditLog, ...prev]);
      })
      .subscribe();

    const requestChannel = supabase.channel('reschedule_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reschedule_requests' }, () => fetchRescheduleRequests())
      .subscribe();

    fetchRescheduleRequests();

    return () => {
      supabase.removeChannel(projectSub);
      supabase.removeChannel(taskSub);
      supabase.removeChannel(historySub);
      supabase.removeChannel(auditSub);
      supabase.removeChannel(requestChannel);
    };
  }, [refreshKey, fetchData]);

  // Bootstrap Superadmin "fachrul wisnu"
  useEffect(() => {
    const bootstrap = async () => {
      if (loading || users.length === 0) return;
      const targetEmail = 'fachrulwisnunovianto@gmail.com';
      const exists = users.some(u => u.email?.toLowerCase() === targetEmail.toLowerCase());
      
      if (!exists) {
        console.log("Bootstrapping Superadmin: fachrul wisnu");
        try {
          await taskService.createUser({
            name: 'fachrul wisnu',
            email: targetEmail,
            access_level: 'Superadmin',
            role: 'Product Manager',
            password: 'bosskubabi'
          }, 'System Bootstrap');
          setRefreshKey(prev => prev + 1);
        } catch (err) {
          console.error("Bootstrap failed:", err);
        }
      }
    };
    bootstrap();
  }, [loading, users.length]);

  const projectHeaderStats = useMemo(() => {
    if (!selectedProjectId) return { totalHours: 0, project: null };
    const p = (projects || []).find(prj => prj.id === selectedProjectId);
    const pTasks = (tasks || []).filter(t => t.project_id === selectedProjectId);
    const totalHours = pTasks
      .filter(t => t.level === 1)
      .reduce((sum, t) => sum + (Number(t.man_hours) || 0), 0);
    return { totalHours, project: p };
  }, [tasks, projects, selectedProjectId]);

  const currentProject = projectHeaderStats.project;

  const currentUserProfile = useMemo(() => {
    if (!user || !user.email || (users || []).length === 0) return null;
    return (users || []).find(u => u.email?.toLowerCase() === user.email?.toLowerCase());
  }, [user, users]);

  const filteredTasks = useMemo(() => 
    selectedProjectId 
      ? (tasks || []).filter(t => t.project_id === selectedProjectId)
      : (tasks || []),
  [tasks, selectedProjectId]);

  const hierarchicalTasks = useMemo(() => {
    const map = new Map<string, Task[]>();
    const roots: Task[] = [];
    
    (filteredTasks || []).forEach(t => {
      if (t.parent_id) {
        const children = map.get(t.parent_id) || [];
        children.push(t);
        map.set(t.parent_id, children);
      } else {
        roots.push(t);
      }
    });

    return { roots, map };
  }, [filteredTasks]);

  const [revertCount, setRevertCount] = useState(0);

  const [ownershipModal, setOwnershipModal] = useState<{
    isOpen: boolean;
    picName: string;
    onConfirm: () => void;
    onCancel: () => void;
    itemName: string;
    type: 'task' | 'schedule' | 'project';
  }>({
    isOpen: false,
    picName: '',
    onConfirm: () => {},
    onCancel: () => {},
    itemName: '',
    type: 'task'
  });

  const handleUpdateTask = async (id: string, field: keyof Task, value: any) => {
    // Get existing task for audit/date check
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const oldValue = task[field];

    const project = projects.find(p => p.id === task.project_id);
    const projectPic = project?.pic_name || task.assignee || 'PIC';

    // Ownership check: If current user name doesn't match Project PIC Name, show warning
    const isOwner = canEditTask(user?.name || '', projectPic);
    
    if (user && !isOwner && !isAdmin && !isSuperadmin) {
      setOwnershipModal({
        isOpen: true,
        picName: projectPic,
        itemName: task.title,
        type: 'task',
        onCancel: () => {
          setOwnershipModal(prev => ({ ...prev, isOpen: false }));
          setRevertCount(c => c + 1); // Trigger UI Revert
          fetchData(); // Revert local state
        },
        onConfirm: async () => {
          setOwnershipModal(prev => ({ ...prev, isOpen: false }));
          await executeTaskUpdate(id, field, value, task, oldValue);
        }
      });
      return;
    }

    await executeTaskUpdate(id, field, value, task, oldValue);
  };

  const executeTaskUpdate = async (id: string, field: keyof Task, value: any, task: any, oldValue: any) => {
    // --- UNIFIED BI-DIRECTIONAL SYNC ENGINE (Mathematical Precision) ---
    if (field === 'start_time' || field === 'end_time') {
      const newValueStr = sanitizeDate(value); 
      if (value !== null && newValueStr === null && value !== '') return;

      const proj = projects.find(p => p.id === task.project_id);
      
      // 1. PROJECT LEVEL AUTO-EXPANSION (Bottom-Up)
      if (proj && newValueStr) {
        const pStartStr = proj.start_date || '';
        const pEndStr = proj.end_date || '';
        let needsProjectUpdate = false;
        let projectUpdatePayload: any = {};

        if (field === 'start_time' && (!pStartStr || newValueStr < pStartStr)) {
          projectUpdatePayload.start_date = newValueStr;
          needsProjectUpdate = true;
        } else if (field === 'end_time' && (!pEndStr || newValueStr > pEndStr)) {
          projectUpdatePayload.end_date = newValueStr;
          needsProjectUpdate = true;
        }

        if (needsProjectUpdate) {
          try {
            const actorName = currentUser?.name || user?.name || user?.email || 'User';
            const updatedProj = await taskService.updateProject(proj.id, projectUpdatePayload, `${actorName} (System Expansion)`, { isAutoSync: true });
            setProjects(prev => prev.map(p => p.id === proj.id ? updatedProj : p));
          } catch (err) {
            console.error('Project expansion failed:', err);
          }
        }
      }

      // 2. BI-DIRECTIONAL BIAS: PARENT L1 AUTO-SYNC
      if (task.parent_id) {
        // L2 -> L1 Bottom-Up Expansion
        const parent = tasks.find(t => t.id === task.parent_id);
        if (parent) {
          const l1Start = parent.start_time;
          const l1End = parent.end_time;
          let needsL1Update = false;
          let l1UpdatePayload: any = {};

          if (field === 'start_time' && (!l1Start || newValueStr < l1Start)) {
            l1UpdatePayload.start_time = newValueStr;
            needsL1Update = true;
          } else if (field === 'end_time' && (!l1End || newValueStr > l1End)) {
            l1UpdatePayload.end_time = newValueStr;
            needsL1Update = true;
          }

          if (needsL1Update) {
            try {
              const actorName = currentUser?.name || user?.name || user?.email || 'User';
              const updatedL1 = await taskService.updateTask(parent.id, l1UpdatePayload, `${actorName} (System L1 Expansion)`, { isAutoSync: true });
              setTasks(prev => prev.map(t => t.id === parent.id ? updatedL1 : t));
            } catch (err) {
              console.error('L1 expansion failed:', err);
            }
          }
        }
      } else {
        // L1 -> L2 Top-Down Push (Enforce boundaries on children)
        const children = tasks.filter(t => t.parent_id === id);
        if (children.length > 0 && newValueStr) {
          const isStart = field === 'start_time';
          const outOfBoundsChildren = children.filter(c => {
            const cDate = isStart ? c.start_time : c.end_time;
            if (!cDate) return false;
            return isStart ? cDate < newValueStr : cDate > newValueStr;
          });

          const actorName = currentUser?.name || user?.name || user?.email || 'User';
          for (const child of outOfBoundsChildren) {
             const childField = isStart ? 'start_time' : 'end_time';
             try {
                const updatedChild = await taskService.updateTask(
                  child.id, 
                  { [childField]: newValueStr }, 
                  `${actorName} (System Boundary Sync)`, 
                  { isAutoSync: true }
                );
                if (updatedChild) {
                  setTasks(prev => prev.map(t => t.id === child.id ? updatedChild : t));
                }
             } catch (e) {
                console.error("Top-down sync failed for child:", child.id);
             }
          }
        }
      }
    }

    // --- EXECUTE PRIMARY UPDATE ---
    try {
       const actorName = currentUser?.name || user?.name || user?.email || 'User';
       const sanitizedVal = (field === 'start_time' || field === 'end_time' || field === 'target_sla_date') 
         ? sanitizeDate(value) 
         : value;

       // --- FIX L2 MAN-HOUR VALIDATION LEAK ---
       if (field === 'man_hours' && task.parent_id) {
          const phase = tasks.find(t => t.id === task.parent_id);
          if (phase) {
             const phaseLimit = Number(phase.man_hours || 0);
             const otherSubtasksSum = tasks
                .filter(t => t.parent_id === task.parent_id && t.id !== id)
                .reduce((sum, t) => sum + Number(t.man_hours || 0), 0);
             
             const newTotal = otherSubtasksSum + Number(sanitizedVal || 0);
             if (newTotal > phaseLimit) {
                alert(`Validation Error: Total Man-Hours L2 (${newTotal} Jam) melebihi batas Phase L1 (${phaseLimit} Jam).`);
                return; // Block submission
             }
          }
       }

       // --- PHASE LOGIC ENFORCEMENT ---
       if (field === 'status' && sanitizedVal === TaskStatus.DONE) {
          if (!task.realized_finish_date) {
             alert("VALIDATION ERROR: Status 'Done' wajib mengisi 'Realized Finish Date'.");
             return;
          }
       }

       if (field === 'status' && sanitizedVal === TaskStatus.IN_PROGRESS) {
          const projectTasks = tasks.filter(t => t.project_id === task.project_id);
          const l1Phases = projectTasks.filter(t => !t.parent_id).sort((a,b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
          
          const taskToCheck = task.parent_id ? tasks.find(t => t.id === task.parent_id) : task;
          const phaseTitle = taskToCheck?.title || '';

          if (phaseTitle.includes('DEV')) {
             const fsd = l1Phases.find(p => p.title.includes('FSD'));
             if (fsd && !fsd.realized_finish_date) {
                alert("OPERATIONAL BLOCK: Development can only be 'ON PROGRESS' if FSD is finished (Realized Finish Date filled).");
                return;
             }
          } else if (phaseTitle.includes('SIT') || phaseTitle.includes('UAT')) {
             const fsd = l1Phases.find(p => p.title.includes('FSD'));
             const dev = l1Phases.find(p => p.title.includes('DEV'));
             if ((fsd && !fsd.realized_finish_date) || (dev && !dev.realized_finish_date)) {
                alert("OPERATIONAL BLOCK: SIT/UAT can only be 'ON PROGRESS' if both FSD & Development are finished.");
                return;
             }
          }
       }

       let finalVal = sanitizedVal;
       if (field === 'status' && typeof sanitizedVal === 'string') {
          finalVal = sanitizedVal.toUpperCase();
          if (finalVal === 'DRAFT') finalVal = 'TODO';
       }

       // Handle empty string as null for nullable fields (Dev, QA, Feedbacks, etc.)
       const nullableFields: (keyof Task)[] = [
        'dev_name', 
        'qa_name', 
        'suggestion_fachrul', 
        'suggestion_barra', 
        'realized_finish_date',
        'detail_task'
      ];
      if (nullableFields.includes(field as any) && finalVal === "") {
         finalVal = null;
       }

       const updatePayload: any = { [field]: finalVal };
       if (field === 'status') {
          updatePayload.is_manual_override = true;
       }

       const updatedTask = await taskService.updateTask(id, updatePayload, actorName);
       
       if (updatedTask) {
         setTasks((prev: Task[]) => prev.map((t: any) => t.id === id ? updatedTask : t));
         
         // Task 3: Real-time UI refresh (Auto re-fetch history if sidebar is open)
         if (showAuditLog && selectedTask?.id === id) {
           const [sysLogs, histLogs] = await Promise.all([
             taskService.getAuditLogs({ taskId: id }),
             taskService.getHistoryEditProjects(updatedTask.project_id || undefined, id)
           ]).catch(e => {
             console.error("Refresh audit error:", e);
             return [[], []];
           });
           setAuditLogs(sysLogs);
           setTaskHistoryLogs(histLogs);
         }
         
         setIsSilentSync(true);
         setRefreshKey(prev => prev + 1);

         // --- TOR Monitor Auto-Status Sync ---
         if (field === 'status' || field === 'realized_finish_date') {
            try {
               const currentProjects = projects;
               const currentTasks = (tasks as any[]).map(t => t.id === id ? updatedTask : t);
               const newGlobalStatus = await torAutoSync(updatedTask.project_id!, currentTasks, currentProjects, actorName);
               if (newGlobalStatus) {
                  setProjects(prev => prev.map(p => p.id === updatedTask.project_id ? { ...p, status: newGlobalStatus as any } : p));
               }
            } catch (err) {
               console.error("TOR Auto-Sync failed:", err);
            }
         }

         // --- L1 STATUS SYNC to MasterProject ---
         if (field === 'title' && !updatedTask.parent_id) {
            const proj = projects.find(p => p.id === updatedTask.project_id);
            if (proj && proj.ticket_id) {
               try {
                  const { data: master } = await supabase.from('master_projects').select('id').eq('ticket_id', proj.ticket_id).maybeSingle();
                  if (master) {
                     await taskService.updateMasterProject(master.id, {
                        status: String(value)
                     }, actorName);
                  }
               } catch (err) {
                  console.error("L1 Phase to Master sync failed:", err);
               }
            }
         }
       }
       
       if (['start_time', 'end_time', 'status', 'dev_name', 'qa_name', 'suggestion_fachrul', 'suggestion_barra', 'man_hours', 'detail_task'].includes(field as string)) {
         setNotif(`Task "${task.title}" updated: ${String(field).replace('_', ' ')} saved.`);
       }
    } catch (err: any) {
       console.error('Update failed:', err);
       fetchData(); 
       alert('CRUD Failed (Update Task): ' + err.message);
    }
  };

  const [taskHistoryLogs, setTaskHistoryLogs] = useState<any[]>([]);

  const handleOpenAudit = async (task: Task) => {
    setSelectedTask(task);
    setShowAuditLog(true);
    try {
      const [sysLogs, histLogs] = await Promise.all([
        taskService.getAuditLogs({ taskId: task.id }),
        taskService.getHistoryEditProjects(task.project_id || undefined, task.id)
      ]);
      setAuditLogs(sysLogs);
      setTaskHistoryLogs(histLogs);
    } catch (err) {
      console.error('Audit fetch failed:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    // Optimistic Delete - disappear instantly from UI
    // Cascade removal: filter out the task itself AND any tasks that have it as parent_id
    setTasks(prevTasks => prevTasks.filter(t => t.id !== id && t.parent_id !== id));
    
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;

      // Also log audit via service for traceability
      await taskService.logAudit({ 
        task_id: id, 
        actor: user?.email || 'Administrator', 
        action: 'DELETED' 
      });
      
    } catch (err: any) {
      console.error("Delete failed:", err);
      // Revert if failed to ensure data integrity
      fetchData(); 
      setNotif("Gagal menghapus task: " + err.message);
    }
  };

  const handleAddUser = async () => {
    try {
      await taskService.createUser({ 
        name: 'New Personnel...', 
        access_level: 'PIC', 
        role: 'Staff' 
      }, 'User');
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error("Failed to add user:", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await taskService.deleteUser(id, 'User');
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleUpdateUser = async (id: string, field: keyof AppUser, value: any) => {
    try {
      await taskService.updateUser(id, { [field]: value }, 'User');
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error("Failed to update user:", err);
    }
  };

  // --- GLOBAL STATUS CALCULATION ENGINE ---
  useEffect(() => {
    if (loading || tasks.length === 0 || projects.length === 0) return;

    // Run this for the active project to ensure UI is snappy
    const currentSelected = projects.find(p => p.id === selectedProjectId);
    if (!currentSelected) return;

    const projectTasks = tasks.filter(t => t.project_id === selectedProjectId);
    const newStatus = calculateGlobalProjectStatus(projectTasks, currentSelected.status || '');
    
    if (newStatus && currentSelected.status !== newStatus) {
      setProjects(prev => prev.map(p => p.id === selectedProjectId ? { ...p, status: newStatus as any } : p));
    }
  }, [tasks, selectedProjectId]);

  // --- SYNC GLOBAL STATUS TO MASTER_PROJECTS ---
  useEffect(() => {
    const syncGlobalStatusToMaster = async () => {
      const currentSelected = projects.find(p => p.id === selectedProjectId);
      if (!currentSelected || !currentSelected.ticket_id || !currentSelected.status) return;
      
      const { error } = await supabase
        .from('master_projects')
        .update({ global_status: currentSelected.status })
        .eq('ticket_id', currentSelected.ticket_id);
        
      if (error) console.error("Gagal sync ke Master Card:", error);
    };

    if (!loading && projects.length > 0) {
       syncGlobalStatusToMaster();
    }
  }, [projects, selectedProjectId, loading]);

  // --- Auto-Sync Level 1 Tasks to Project Header (Optimized to avoid loops) ---
  useEffect(() => {
    if (loading || projects.length === 0 || tasks.length === 0 || isSyncingRef.current) return;

    const syncProjects = async () => {
      isSyncingRef.current = true;
      try {
        for (const project of projects) {
          const l1Tasks = tasks.filter(t => t.project_id === project.id && !t.parent_id);
          if (l1Tasks.length === 0) continue;

          const startDates = l1Tasks.filter(t => t.start_time).map(t => new Date(t.start_time).getTime());
          const endDates = l1Tasks.filter(t => t.end_time).map(t => new Date(t.end_time).getTime());
          
          if (startDates.length === 0 || endDates.length === 0) continue;

          const minStart = formatDateForDB(new Date(Math.min(...startDates))) || '';
          const maxEnd = formatDateForDB(new Date(Math.max(...endDates))) || '';

          const currentStart = project.start_date || '';
          const currentEnd = project.end_date || '';

          // ONE-WAY EXPANSION ONLY:
          const needsStartUpdate = currentStart && minStart < currentStart;
          const needsEndUpdate = currentEnd && maxEnd > currentEnd;
          const isInitial = !currentStart || !currentEnd;

          if (needsStartUpdate || needsEndUpdate || isInitial) {
             const updatePayload: any = {};
             let logOldStart = currentStart;
             let logOldEnd = currentEnd;
             
             if (needsStartUpdate || (!currentStart && minStart)) updatePayload.start_date = minStart;
             if (needsEndUpdate || (!currentEnd && maxEnd)) updatePayload.end_date = maxEnd;
             
             if (Object.keys(updatePayload).length > 0) {
               console.log(`Syncing project ${project.project_name} timeline (Expansion Only):`, updatePayload);
               const updated = await taskService.updateProject(project.id, updatePayload, 'System Logic (Sync)');
               
               // Update local state directly to skip refetch
               setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
               
               await taskService.createProjectRescheduleLog({
                 project_id: project.id,
                 changed_by: 'System Logic (Sync)',
                 old_start_date: logOldStart,
                 old_end_date: logOldEnd,
                 new_start_date: updatePayload.start_date || logOldStart,
                 new_end_date: updatePayload.end_date || logOldEnd,
                 reason: 'Auto-Expansion: One-way sync from WBS boundaries.'
               });
             }
          }
        }
      } finally {
        isSyncingRef.current = false;
      }
    };

    const timer = setTimeout(() => {
      syncProjects();
    }, 3000); // 3s debounce for expansion sync

    return () => clearTimeout(timer);
  }, [tasks.length, projects.length, loading]);
  
  const handleUpdateProject = async (id: string, updates: Partial<Project>, options?: { onRevert?: () => void, bypassWarning?: boolean }) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    const isOwner = canEditTask(user?.name || '', project.pic_name || '');
    const bypassWarning = options?.bypassWarning;
    const onRevert = options?.onRevert;

    if (user && !isOwner && !isAdmin && !isSuperadmin && !bypassWarning) {
      // Intercept with warning modal
      setOwnershipModal({
        isOpen: true,
        picName: project.pic_name || 'PIC',
        itemName: project.project_name,
        type: 'project',
        onCancel: () => {
          setOwnershipModal(prev => ({ ...prev, isOpen: false }));
          onRevert?.();
          fetchData(); // Rollback local state
        },
        onConfirm: async () => {
          setOwnershipModal(prev => ({ ...prev, isOpen: false }));
          await executeProjectUpdate(id, updates);
        }
      });
      return;
    }

    await executeProjectUpdate(id, updates);
  };

  const executeProjectUpdate = async (id: string, updates: Partial<Project>) => {
    // Optimistic Update
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    
    try {
      const actorName = user?.name || user?.email || 'System';
      const updated = await taskService.updateProject(id, updates, actorName);
      
      // Immediate state sync with server data
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
      
    } catch (err: any) {
      console.error('Project Update failed:', err);
      // Revert optimistic update by refetching
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (data) setProjects(data);
      alert('CRUD Failed (Update Project): ' + err.message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    // Optimistic Delete - disappear instantly
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProjectId === id) setSelectedProjectId(null);

    try {
      // 1. Delete all tasks from this project first (WBS items)
      await supabase.from('tasks').delete().eq('project_id', id);
      
      // 2. Delete the project itself
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;

      // 3. ISOLATED DELETION: Do NOT delete from master_projects as per Task 2
      // Previously, we deleted from master_projects here if ticket_id existed.
      // Now we keep master_projects as an immutable global registry.

      setNotif('Project berhasil dihapus');
    } catch (err: any) {
      console.error("Failed to delete project:", err);
      setNotif('Gagal menghapus project');
      fetchData(); // Rollback
    }
  };

  const handleToggleExpand = (id: string) => {
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRows(next);
  };

  const menuItems = useMemo(() => {
    const base = [
      { id: 'PROJECTS', label: 'Project List', icon: LayoutDashboard },
      { id: 'TIMELINE', label: 'OM DEDY - TIMELINE', icon: BarChart3 },
      ...(selectedProjectId ? [{ id: 'GANTT_DETAIL', label: 'OM DEDY - DETAIL TIMELINE', icon: Activity }] : []),
      { id: 'KANBAN', label: 'Status Monitoring', icon: LayoutGrid },
      { id: 'SCHEDULE', label: 'Om Dedy Schedule', icon: Calendar },
      { id: 'RESCHEDULE', label: 'APPROVALS', icon: History },
      { id: 'PERSONEL', label: 'Personel OM DEDY', icon: Users },
      { id: 'MASTER_PROJECT', label: 'Om Dedy Master Project', icon: FolderKanban },
      { id: 'TOR_MONITOR', label: 'Om Dedy Tor Monitor', icon: ShieldCheck },
      { id: 'NOTION_MIGRATE', label: 'Om Dedy Migrate Notion', icon: Database },
      { id: 'AUDIT', label: 'System Audit Logs', icon: ShieldAlert },
    ];

    const filtered = base.filter(item => {
      // Only Admin/Superadmin can see Personnel, Master Project, and Reschedule menus
      if (item.id === 'PERSONEL' || item.id === 'RESCHEDULE' || item.id === 'AUDIT' || item.id === 'MASTER_PROJECT' || item.id === 'TOR_MONITOR') return isAdmin;
      return true;
    });

    return filtered;
  }, [isAdmin, selectedProjectId]);

  if (loading && projects.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#0B1120] flex flex-col items-center justify-center z-[9999] transition-colors">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          {/* Logo with Glow */}
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(79,70,229,0.4)] relative overflow-hidden group">
             <span className="text-3xl font-black text-white relative z-10">OD</span>
             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
          </div>

          {/* Branded Text */}
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 transition-colors">
            OM <span className="text-indigo-500">DEDY</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
            Operational Monitoring Dashboard
          </p>
          <p className="text-slate-500 text-[10px] mt-1 font-bold tracking-[0.2em] uppercase">
            FOR EFFICIENT DELIVERY
          </p>

          {/* Modern Progress Bar */}
          <div className="w-48 h-1 bg-slate-800 rounded-full mt-10 overflow-hidden relative">
             <div 
               className="h-full bg-indigo-500 absolute top-0 left-0 animate-[loading_1.5s_infinite] w-1/3 shadow-[0_0_10px_#6366f1]" 
             />
          </div>
          
          <p className="text-[9px] text-slate-600 mt-6 font-mono uppercase tracking-widest animate-pulse">
            Synchronizing Critical Systems...
          </p>
        </motion.div>
      </div>
    );
  }

  const ganttProps = {
    user,
    users,
    projectId: selectedProjectId,
    setFocusedProjectId: (id: string) => navigate(`/detail-timeline/${id}`),
    projects,
    setProjects,
    tasks,
    hierarchicalTasks,
    expandedRows,
    scale,
    revertCount,
    setRefreshKey,
    handleToggleExpand,
    handleUpdateTask,
    handleUpdateProject,
    handleOpenAudit,
    handleDeleteTask: requestDeleteTask,
    setScale,
    onReschedule: handleOpenReschedule,
    onNotif: setNotif,
    setIsEditWBSModalOpen,
    setTasks,
    auditLogs: allAuditLogs,
    historyEditLogs: allHistoryEditLogs,
    isMobile,
    isAdmin,
    isSuperadmin,
    authLoading
  };

  if (activeView === 'LOGIN') {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex flex-col lg:flex-row overflow-hidden transition-colors duration-300">
      {/* Mobile Top Header */}
      {isMobile && (
        <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-between px-4 shrink-0 z-50 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-sm font-black text-white">OD</span>
            </div>
            <h1 className="font-black text-[var(--text-main)] uppercase italic tracking-tighter text-lg leading-none transition-colors">OM <span className="text-indigo-500">DEDY</span></h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-[var(--text-sub)] hover:text-indigo-600 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>
      )}

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[var(--bg-card)] z-[100] flex flex-col transition-colors duration-300"
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border)] transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-black text-white">OD</span>
                </div>
                <h1 className="font-black text-[var(--text-main)] uppercase italic tracking-tighter text-lg transition-colors">OM <span className="text-indigo-500">DEDY</span></h1>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[var(--text-sub)] hover:text-indigo-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-6">
              {/* Project List Group (Synced with Desktop) */}
              <div className="mb-2">
                <button
                  onClick={() => {
                    setIsProjectsMobileExpanded(!isProjectsMobileExpanded);
                    setActiveView('PROJECTS');
                    setSelectedProjectId(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between py-4 px-6 transition-all",
                    (activeView === 'PROJECTS' || activeView === 'TIMELINE' || activeView === 'GANTT_DETAIL' || activeView === 'TOR_MONITOR')
                      ? "text-indigo-600 bg-indigo-600/10 border-r-4 border-indigo-500" 
                      : "text-[var(--text-sub)] hover:bg-[var(--bg-page)]"
                  )}
                >
                  <div className="flex items-center">
                    <LayoutDashboard className={cn("w-6 h-6 shrink-0", (activeView === 'PROJECTS') ? "text-indigo-400" : "text-[var(--text-sub)]")} />
                    <span className="ml-4 font-bold text-sm uppercase tracking-widest text-left">Project List</span>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 text-[var(--text-sub)] transition-transform", !isProjectsMobileExpanded && "-rotate-90")} />
                </button>

                {isProjectsMobileExpanded && (
                  <div className="mt-1 ml-6 border-l border-[var(--border)] space-y-1">
                    <button
                      onClick={() => { setActiveView('TIMELINE'); setSelectedProjectId(null); setIsMobileMenuOpen(false); }}
                      className={cn(
                        "w-full flex items-center py-3 px-6 transition-all text-[11px] font-bold uppercase tracking-widest",
                        activeView === 'TIMELINE' ? "text-indigo-500" : "text-[var(--text-sub)]"
                      )}
                    >
                      <BarChart3 className="w-4 h-4 mr-3" />
                      Om Dedy Timeline
                    </button>
                    {selectedProjectId && (
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); navigate(`/detail-timeline/${selectedProjectId}`); }}
                        className={cn(
                          "w-full flex items-center py-3 px-6 transition-all text-[11px] font-bold uppercase tracking-widest",
                          activeView === 'GANTT_DETAIL' ? "text-indigo-500" : "text-[var(--text-sub)]"
                        )}
                      >
                        <Activity className="w-4 h-4 mr-3" />
                        Detail Timeline
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => { setActiveView('TOR_MONITOR'); setIsMobileMenuOpen(false); }}
                        className={cn(
                          "w-full flex items-center py-3 px-6 transition-all text-[11px] font-bold uppercase tracking-widest",
                          activeView === 'TOR_MONITOR' ? "text-indigo-500" : "text-[var(--text-sub)]"
                        )}
                      >
                        <ShieldCheck className="w-4 h-4 mr-3" />
                        Tor Monitor
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Remaining items */}
              {menuItems.filter(item => !['PROJECTS', 'TIMELINE', 'GANTT_DETAIL', 'TOR_MONITOR'].includes(item.id)).map((item, i) => (
                <button
                  key={getSafeKey({id: item.id}, i, 'mobile-nav-item')}
                  onClick={() => { 
                    setActiveView(item.id as AppView); 
                    setSelectedProjectId(null); 
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center py-4 px-6 transition-all",
                    (activeView === item.id && !selectedProjectId)
                      ? "text-indigo-600 bg-indigo-600/10 border-r-4 border-indigo-500" 
                      : "text-[var(--text-sub)] hover:bg-[var(--bg-page)]"
                  )}
                >
                  <item.icon className={cn("w-6 h-6 shrink-0", (activeView === item.id && !selectedProjectId) ? "text-indigo-400" : "text-[var(--text-sub)]")} />
                  <span className="ml-4 font-bold text-sm uppercase tracking-widest">{item.label}</span>
                  {item.id === 'RESCHEDULE' && pendingRescheduleCount > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingRescheduleCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="p-6 border-t border-[var(--border)] mt-8 shrink-0">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-[var(--bg-page)]/50 rounded-2xl border border-[var(--border)] shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-indigo-500/30 flex items-center justify-center">
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase">{user.email?.charAt(0) || '?'}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-main)] italic">{user.email}</p>
                      <p className="text-[10px] text-[var(--text-sub)] uppercase tracking-widest font-bold">{user.access_level || 'PIC'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                    className="w-full py-4 bg-[var(--bg-page)] text-rose-500 font-bold uppercase text-xs tracking-widest rounded-xl border border-[var(--border)]"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                  className="w-full py-4 bg-indigo-600 text-white font-bold uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  Personnel Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          user={user}
          activeView={activeView}
          onLogout={signOut}
          pendingRescheduleCount={pendingRescheduleCount}
          selectedProjectId={selectedProjectId}
        />
      )}

      {/* Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[var(--bg-page)] transition-colors duration-300">
        {loading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px] z-[100] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Syncing Node</span>
                <p className="text-[9px] text-[var(--text-sub)] font-bold uppercase tracking-widest mt-1">Operational Monitoring Active</p>
              </div>
            </div>
          </div>
        )}
        <header className={cn("h-20 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card)]/80 backdrop-blur-md z-30 shrink-0 transition-colors duration-300 pointer-events-auto", isMobile ? "px-4" : "px-8")}>
          <div className="flex items-center gap-4 pointer-events-auto">
             {isMobile && (
               <button 
                 onClick={() => setIsMobileMenuOpen(true)}
                 className="p-2 -ml-2 text-[var(--text-sub)] hover:text-[var(--accent)] pointer-events-auto z-40"
               >
                 <Menu className="w-6 h-6" />
               </button>
             )}
             {activeView === 'GANTT_DETAIL' && selectedProjectId && (
               <button 
                 onClick={() => { setActiveView('PROJECTS'); setSelectedProjectId(null); }}
                 className="p-2 hover:bg-[var(--bg-page)] rounded-lg transition-colors text-[var(--text-sub)] hover:text-[var(--accent)] border border-[var(--border)] pointer-events-auto"
               >
                 <ArrowLeft className="w-5 h-5" />
               </button>
             )}
             <div>
               <h2 className="text-xl font-black text-[var(--text-main)] tracking-tighter flex items-center gap-3 uppercase italic transition-colors">
                 {activeView === 'PROJECTS' && <span>OM <span className="text-[var(--accent)]">DEDY</span></span>}
                 {activeView === 'KANBAN' && 'Project Status Monitoring'}
                 {activeView === 'PERSONEL' && 'Personel OM DEDY'}
                 {activeView === 'RESCHEDULE' && 'Reschedule Om Dedy'}
                 {activeView === 'SCHEDULE' && 'Om Dedy Schedule'}
                 {activeView === 'MASTER_PROJECT' && 'Master Project Om Dedy'}
                 {activeView === 'TOR_MONITOR' && 'Om Dedy Tor Monitor'}
                 {activeView === 'AUDIT' && 'System Audit Rails'}
                 {activeView === 'NOTION_MIGRATE' && 'Om Dedy Migrate Notion'}
                 {activeView === 'GANTT_DETAIL' && (
                    selectedProjectId ? (
                      <div className="flex items-center gap-3">
                        <span>{currentProject?.project_name}</span>
                        <div className="flex items-center gap-2 not-italic">
                          {(() => {
                            const { totalHours, project: p } = projectHeaderStats;
                            return (
                              <>
                                <div className="bg-[var(--bg-page)] px-2 py-1 rounded-md border border-[var(--border)] flex items-center gap-1.5 shadow-sm transition-colors">
                                  <Clock className="w-3 h-3 text-[var(--accent)]" />
                                  <span className="text-[10px] font-black text-[var(--text-main)] tracking-wider uppercase">
                                    ⏱️ {totalHours.toFixed(1)} HOURS
                                  </span>
                                </div>
                                <div className={cn(
                                  "px-2 py-1 rounded-md border text-[10px] font-black tracking-widest uppercase transition-colors",
                                  p?.status === ProjectStatus.LIVE ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" :
                                  (p?.status || "").includes('PROGRESS') ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400" :
                                  "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-sub)]"
                                )}>
                                  {p?.status || 'UNKNOWN'}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    ) : 'Om Dedy Timeline'
                  )}
               </h2>
               <p className="text-[9px] text-[var(--text-sub)] font-black uppercase tracking-[0.3em] transition-colors">WITH OM DEDY EVERYTHING WILL BE DELIVERED</p>
             </div>
          </div>

             <div className="flex items-center gap-4">
              {activeView === 'GANTT_DETAIL' && (
                <div className="flex bg-[var(--bg-page)] p-1 rounded-lg border border-[var(--border)] scale-90 sm:scale-100 origin-right">
                  {isMobile ? (
                    <button
                      onClick={() => setScale(scale === 'DAY' ? 'WEEK' : scale === 'WEEK' ? 'MONTH' : 'DAY')}
                      className="px-4 py-1.5 rounded-md text-[10px] font-black tracking-widest bg-[var(--bg-card)] text-[var(--accent)] capitalize shadow-sm transition-all"
                    >
                      {scale}
                    </button>
                  ) : (
                    (['MONTH', 'WEEK', 'DAY'] as ViewScale[]).map((s, si) => (
                      <button
                        key={`header-scale-${s}-${si}`}
                        onClick={() => setScale(s)}
                        className={cn(
                          "px-3 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all",
                          scale === s 
                            ? "bg-[var(--bg-card)] text-[var(--accent)] shadow-sm" 
                            : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
                        )}
                      >
                        {s}
                      </button>
                    ))
                  )}
                </div>
              )}

              {(activeView === 'GANTT_DETAIL' || activeView === 'PROJECTS') && (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setNotif("🔗 Public Link Copied to Clipboard");
                  }}
                  className="flex items-center gap-2 bg-[var(--bg-card)] hover:bg-[var(--bg-page)] text-[var(--text-main)] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-[var(--border)] transition-all group shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--accent)] group-hover:scale-110 transition-transform" />
                  Copy Public Link
                </button>
              )}

            {user && (
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="p-2 text-[var(--text-sub)] hover:text-[var(--accent)] transition-colors"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            )}
               <div className="pl-4 border-l border-[var(--border)] ml-2">
                 <ThemeToggle />
               </div>
             </div>
        </header>

        <section className={cn("flex-1 overflow-auto scrollbar-hide", activeView === 'GANTT_DETAIL' ? 'p-4' : 'p-8')}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Navigate to="/portofolio" replace />} />
              <Route path="/portofolio" element={
                <PortfolioDashboard 
                  user={user}
                  projects={projects} 
                  tasks={tasks}
                  loading={loading}
                  onOpenProject={(id) => { setSelectedProjectId(id); navigate(`/detail-timeline/${id}`); }} 
                  onDeleteProject={handleDeleteProject}
                  onUpdateProject={handleUpdateProject}
                  onCreateRequested={() => {
                    if (hasUnsavedChanges) {
                      setPendingAction(() => () => setIsCreateProjectModalOpen(true));
                      setShowGlobalUnsavedModal(true);
                    } else {
                      setIsCreateProjectModalOpen(true);
                    }
                  }}
                  onReschedule={(p) => setReschedulingProject(p)}
                  setEditingProject={(p) => {
                    if (hasUnsavedChanges) {
                      setPendingAction(() => () => {
                        setEditingProject(p);
                        setIsProjectDetailOpen(true);
                      });
                      setShowGlobalUnsavedModal(true);
                    } else {
                      setEditingProject(p);
                      setIsProjectDetailOpen(true);
                    }
                  }}
                  setIsProjectDetailOpen={setIsProjectDetailOpen}
                  isMobile={isMobile}
                />
              } />
              <Route path="/projects" element={<Navigate to="/portofolio" replace />} />
              <Route path="/schedule" element={
                <OmDedySchedule 
                  user={user} 
                  users={users} 
                  setActiveView={setActiveView} 
                  isAdmin={isAdmin}
                  isSuperadmin={isSuperadmin}
                  setOwnershipModal={setOwnershipModal}
                  onNotif={setNotif}
                  isMobile={isMobile}
                />
              } />
              <Route path="/kanban" element={
                <KanbanView 
                  projects={projects} 
                  tasks={tasks}
                  onOpenGantt={(id) => { setSelectedProjectId(id); navigate(`/detail-timeline/${id}`); }}
                  onUpdateProject={handleUpdateProject}
                  isMobile={isMobile}
                />
              } />
              <Route path="/personnel" element={
                <PersonelManagement isAdmin={isAdmin} 
                  users={users} 
                  projects={projects}
                  currentUser={user}
                  onRefresh={() => setRefreshKey(prev => prev + 1)}
                  isMobile={isMobile}
                />
              } />
              <Route path="/approvals" element={
                <RescheduleRequestsView 
                  requests={rescheduleRequests}
                  isLoading={requestsLoading}
                  onRefresh={() => {
                    fetchRescheduleRequests();
                    setRefreshKey(prev => prev + 1);
                  }}
                  user={user}
                  isMobile={isMobile}
                />
              } />
              <Route path="/master-project" element={
                <MasterProjectHub 
                  user={user}
                  isMobile={isMobile}
                />
              } />
              <Route path="/tor-monitor" element={
                <TorMonitor user={user} />
              } />
              <Route path="/audit" element={
                <AuditLogView logs={allAuditLogs} projects={projects} users={users} isMobile={isMobile} />
              } />
              <Route path="/notion-migrate" element={<NotionMigrationBoard />} />
              <Route path="/notion-monitoring" element={<NotionMonitoring />} />
              <Route path="/notion-api" element={<NotionSyncDashboard />} />
              <Route path="/notion-api-results" element={<KanbanNotionAPI />} />
              <Route path="/kaldev" element={<KaldevView />} />
              <Route path="/api-docs" element={<SwaggerDocs />} />
              <Route path="/pma-integration" element={<PmaIntegration />} />
              <Route path="/timeline" element={<GanttDetailView {...ganttProps} projectId={null} />} />
              <Route path="/detail-timeline" element={<Navigate to="/portofolio" replace />} />
              <Route path="/detail-timeline/:projectId" element={<GanttDetailView {...ganttProps} />} />
              <Route path="/project/:projectId" element={<ProjectRedirect />} />
              <Route path="/project/:id" element={
                <ProjectDetailWrapper 
                  user={user}
                  setProjects={setProjects}
                  projects={projects}
                  tasks={tasks}
                  hierarchicalTasks={hierarchicalTasks}
                  expandedRows={expandedRows}
                  scale={scale}
                  setRefreshKey={setRefreshKey}
                  handleToggleExpand={handleToggleExpand}
                  handleUpdateTask={handleUpdateTask}
                  handleOpenAudit={handleOpenAudit}
                  handleDeleteTask={requestDeleteTask}
                  setScale={setScale}
                  onReschedule={handleOpenReschedule}
                  onNotif={setNotif}
                  users={users}
                  setTasks={setTasks}
                  isMobile={isMobile}
                />
              } />
            </Routes>
          </ErrorBoundary>
        </section>
        <UnsavedChangesModal 
          isOpen={showGlobalUnsavedModal}
          onClose={() => {
            setShowGlobalUnsavedModal(false);
            setPendingAction(null);
          }}
          onDiscard={() => {
            setShowGlobalUnsavedModal(false);
            setHasUnsavedChanges(false);
            if (pendingAction) {
              pendingAction();
              setPendingAction(null);
            }
          }}
        />
      </main>

      <AnimatePresence>
        {isCreateProjectModalOpen && user && (
          <ErrorBoundary key="create-project-wizard-error-boundary">
            <CreateProjectModal 
              key="create-project-wizard-modal"
              user={user}
              users={users}
              isMobile={isMobile}
              onClose={() => {
                setIsCreateProjectModalOpen(false);
                setHasUnsavedChanges(false);
              }} 
              onSuccess={() => {
                setNotif("Project Created Successfully!");
                setHasUnsavedChanges(false);
              }} 
              setProjects={setProjects}
              setTasks={setTasks}
              setHasUnsavedChanges={setHasUnsavedChanges}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </ErrorBoundary>
        )}

        {isEditWBSModalOpen && currentProject && user && (
          <ErrorBoundary key="edit-project-wbs-error-boundary">
            <EditProjectWBSModal 
              key="edit-project-wbs-modal"
              project={currentProject}
              tasks={tasks.filter(t => t.project_id === currentProject.id)}
              user={user}
              users={users}
              isMobile={isMobile}
              onClose={() => {
                setIsEditWBSModalOpen(false);
                setHasUnsavedChanges(false);
              }}
              onSuccess={() => {
                setNotif("Project Timeline Updated Successfully!");
                setHasUnsavedChanges(false);
              }}
              setProjects={setProjects}
              setTasks={setTasks}
              setHasUnsavedChanges={setHasUnsavedChanges}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </ErrorBoundary>
        )}

        {isProjectDetailOpen && editingProject && (
          <ErrorBoundary key="project-detail-modal-error-boundary">
             <ProjectDetail 
               project={editingProject}
               isOpen={isProjectDetailOpen}
               user={user}
               onClose={() => {
                 setIsProjectDetailOpen(false);
                 setEditingProject(null);
                 setOwnershipModal(prev => ({ ...prev, isOpen: false }));
                 setRevertCount(c => c + 1);
               }}
               onUpdate={async (id, updates, onRevert) => {
                 await handleUpdateProject(id, updates, { onRevert });
                 setNotif("Project details updated successfully");
               }}
               isMobile={isMobile}
             />
          </ErrorBoundary>
        )}
        {showAuditLog && selectedTask && (
          <React.Fragment key="audit-trail-fragment">
            <motion.div 
              key="audit-trail-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuditLog(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              key="audit-trail-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-[450px] bg-[var(--bg-card)] border-l border-[var(--border)] shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-0 flex flex-col h-full">
                <div className="p-6 pb-4 border-b border-[var(--border)]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                        <History className="w-5 h-5 text-[var(--accent)]" />
                        Audit Trail
                      </h2>
                      <p className="text-xs text-[var(--text-sub)] mt-1">Governance Layer for {selectedTask.title}</p>
                    </div>
                    <button onClick={() => setShowAuditLog(false)} className="text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors">
                      <Plus className="w-6 h-6 rotate-45" />
                    </button>
                  </div>

                  {/* Tabs Header */}
                  <div className="flex gap-2 mb-6">
                    <button 
                      onClick={() => setActiveAuditTab('LOG_SYSTEM')}
                      className={cn(
                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-md",
                        activeAuditTab === 'LOG_SYSTEM' 
                          ? "bg-[var(--accent)] text-white shadow-lg shadow-indigo-600/20" 
                          : "bg-[var(--bg-page)] text-[var(--text-sub)] hover:bg-[var(--bg-page)]/80"
                      )}
                    >
                      LOG SYSTEM
                    </button>
                    <button 
                      onClick={() => setActiveAuditTab('HISTORY_EDIT')}
                      className={cn(
                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-md",
                        activeAuditTab === 'HISTORY_EDIT' 
                          ? "bg-[var(--accent)] text-white shadow-lg shadow-indigo-600/20" 
                          : "bg-[var(--bg-page)] text-[var(--text-sub)] hover:bg-[var(--bg-page)]/80"
                      )}
                    >
                      HISTORY EDIT
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-6">
                  {(() => {
                    const systemLogs = auditLogs.filter(log => 
                      (log.actor || '').toLowerCase().includes('system') || 
                      (log.authorized_by || '').toLowerCase().includes('system') ||
                      (log.log_type || '').includes('SYSTEM')
                    );
                    const historyLogs = auditLogs.filter(log => 
                      !(log.actor || '').toLowerCase().includes('system') && 
                      !(log.authorized_by || '').toLowerCase().includes('system') &&
                      !(log.log_type || '').includes('SYSTEM')
                    );

                    if (activeAuditTab === 'HISTORY_EDIT') {
                      return (
                        <div className="overflow-x-auto bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm">
                          <table className="w-full text-left text-[10px] text-[var(--text-main)]">
                            <thead className="bg-[var(--bg-page)] text-[var(--text-sub)] uppercase font-black tracking-widest border-b border-[var(--border)]">
                              <tr>
                                <th className="px-4 py-3">PIC Name</th>
                                <th className="px-4 py-3">Date Editing</th>
                                <th className="px-4 py-3">Field</th>
                                <th className="px-4 py-3">Before</th>
                                <th className="px-4 py-3">After</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                              {taskHistoryLogs.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="px-4 py-12 text-center text-[var(--text-sub)] italic">
                                    Belum ada riwayat edit dari PIC untuk task ini.
                                  </td>
                                </tr>
                              ) : (
                                taskHistoryLogs.map((log, i) => (
                                  <tr key={log.id || i} className="hover:bg-[var(--bg-page)] transition-colors group">
                                    <td className="px-4 py-3 text-indigo-400 font-bold">{log.pic_name}</td>
                                    <td className="px-4 py-3 font-mono text-[var(--text-sub)]">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-[var(--text-sub)]">{log.field_name}</td>
                                    <td className="px-4 py-3 line-through text-rose-500/70">{log.before_value}</td>
                                    <td className="px-4 py-3 text-emerald-400">{log.after_value}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      );
                    }

                    // Log System View (Default)
                    if (systemLogs.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <History className="w-12 h-12 text-[var(--text-sub)] opacity-20 mb-4" />
                          <p className="text-[var(--text-sub)] text-sm italic">Belum ada riwayat aktivitas sistem.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6">
                        {systemLogs.map((log, i) => {
                          const logId = getSafeKey(log, i, 'audit-log');
                          return (
                            <div key={logId} className="relative pl-8 pb-6 group">
                              {i !== systemLogs.length - 1 && (
                                <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-[var(--border)] group-last:hidden" />
                              )}
                              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[var(--bg-page)] border-2 border-[var(--border)] flex items-center justify-center z-10 transition-colors group-hover:border-[var(--accent)]/50">
                                <div className="w-2 h-2 rounded-full bg-[var(--accent)] group-hover:scale-125 transition-transform" />
                              </div>
                              
                              <div className="bg-[var(--bg-page)]/50 border border-[var(--border)] p-4 rounded-xl hover:bg-[var(--bg-page)]/80 transition-colors shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest">{log.actor || 'System'}</span>
                                  <span className="text-[9px] text-[var(--text-sub)] font-mono">{log.created_at ? format(new Date(log.created_at), 'MM/dd HH:mm:ss') : 'N/A'}</span>
                                </div>
                                <p className="text-xs font-bold text-[var(--text-main)] mb-2">{log.action || 'Unknown Action'}</p>
                                
                                {log.old_payload && log.new_payload && (
                                  <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
                                    <p className="text-[9px] text-[var(--text-sub)] font-bold uppercase tracking-widest mb-2 opacity-50">Auto-Log Details</p>
                                    {(() => {
                                      const oldP = log.old_payload as any;
                                      const newP = log.new_payload as any;
                                      const allKeys = Array.from(new Set([...Object.keys(oldP), ...Object.keys(newP)]));
                                      
                                      return allKeys.map((key, ki) => {
                                        if (key === 'updated_at' || key === 'id' || key === 'created_at') return null;
                                        if (JSON.stringify(oldP[key]) === JSON.stringify(newP[key])) return null;
                                        
                                        const diffKey = getSafeKey({id: key}, ki, 'payload-diff');
                                        return (
                                          <div key={diffKey} className="flex flex-col gap-1 pb-1 border-b border-[var(--border)] last:border-0">
                                            <span className="text-[9px] font-mono text-indigo-400/70">{key}</span>
                                            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
                                              <div className="text-[8px] text-rose-400 truncate opacity-60">
                                                {String(oldP[key] ?? 'null')}
                                              </div>
                                              <ArrowRight className="w-2 h-2 text-[var(--text-sub)]" />
                                              <div className="text-[8px] text-emerald-400 font-bold italic truncate">
                                                {String(newP[key] ?? 'null')}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      });
                                    })()}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        )}
        {reschedulingProject && (
          <ProjectRescheduleModal 
            project={reschedulingProject}
            user={user}
            onClose={() => setReschedulingProject(null)}
            onSuccess={() => {
              setRefreshKey(prev => prev + 1);
              fetchData();
              setNotif("Timeline berhasil digeser dan disinkronkan!");
            }}
          />
        )}
        <ConfirmModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={confirmDelete}
          title="Konfirmasi Hapus"
          description="Apakah Anda yakin ingin menghapus data ini? Semua rincian di dalamnya juga akan ikut terhapus secara permanen. Aksi ini tidak dapat dibatalkan."
        />
        {isProfileModalOpen && user && (
          <ProfileSettingsModal 
            key="profile-settings-modal"
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={user}
            onUpdate={() => fetchData()}
          />
        )}
        <AnimatePresence>
          {ownershipModal.isOpen && (
            <OwnershipWarningModal 
              key="ownership-warning-modal"
              picName={ownershipModal.picName}
              itemName={ownershipModal.itemName}
              type={ownershipModal.type}
              onCancel={ownershipModal.onCancel}
              onConfirm={ownershipModal.onConfirm}
            />
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {notif && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-10 left-10 z-[200] bg-indigo-600 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-indigo-600/40 flex items-center gap-4 border border-white/20 backdrop-blur-xl"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <Info className="w-4 h-4" />
              </div>
              <span className="font-black uppercase text-xs tracking-widest">{notif}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Toaster position="top-right" reverseOrder={false} />
      </AnimatePresence>
    </div>
  );
}

function OwnershipWarningModal({ picName, itemName, type, onConfirm, onCancel }: {
  picName: string;
  itemName: string;
  type: 'task' | 'schedule' | 'project',
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const getEntityLabel = () => {
    if (type === 'project') return 'proyek';
    if (type === 'task') return 'tugas';
    return 'jadwal';
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[var(--bg-card)] border border-amber-500/30 rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative text-center">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 mx-auto mb-6 shadow-xl">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          
          <h2 className="text-2xl font-black text-[var(--text-main)] italic tracking-tighter uppercase mb-4">⚠️ Peringatan Kepemilikan</h2>
          
          <p className="text-[var(--text-sub)] text-sm leading-relaxed mb-8 text-center px-4">
            Anda sedang mengedit {getEntityLabel()} milik <span className="text-amber-400 font-bold">{picName}</span>. 
            Tindakan ini akan dicatat dalam <span className="text-indigo-400 font-bold underline decoration-indigo-500/30">Audit Log</span> sebagai bukti (evidence) untuk akuntabilitas.
            <br/><br/>
            Apakah Anda yakin ingin melanjutkan update pada <span className="italic">"{itemName}"</span>?
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={onCancel}
              className="flex-1 bg-[var(--bg-page)] hover:bg-[var(--bg-page)]/80 text-[var(--text-sub)] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-[var(--border)]"
            >
              Batal
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-900/20 transition-all active:scale-95"
            >
              Lanjutkan Update
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- Modals ---

function ProjectRescheduleModal({ project, user, onClose, onSuccess }: { project: Project, user: any, onClose: () => void, onSuccess: () => void }) {
  const [newStart, setNewStart] = useState(formatDateForDB(project.start_date) || formatDateForDB(new Date()) || '');
  const [newEnd, setNewEnd] = useState(formatDateForDB(project.end_date) || formatDateForDB(addDays(new Date(), 30)) || '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    try {
      // 1. Log the change
      await taskService.createProjectRescheduleLog({
        project_id: project.id,
        changed_by: user?.name || user?.email || 'Admin',
        old_start_date: project.start_date || 'N/A',
        old_end_date: project.end_date || 'N/A',
        new_start_date: newStart,
        new_end_date: newEnd,
        reason: reason
      });

      // 2. Update project
      await taskService.updateProject(project.id, {
        start_date: newStart,
        end_date: newEnd
      }, user?.email || 'Admin');

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to reschedule project:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg w-[95%] mx-auto bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8 border-b border-white/5 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Reschedule Project</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Timeline Governance Layer</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 mt-6">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Target Infrastructure</h4>
            <p className="text-sm font-bold text-slate-200">{project.project_name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4 opacity-50 grayscale pointer-events-none hidden sm:block">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Current Timeline</label>
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5 p-3 bg-slate-950/50 rounded-xl border border-white/5">
                  <span className="text-[8px] font-bold text-slate-600 uppercase">Start Date</span>
                  <span className="text-xs text-slate-400 font-mono italic">{project.start_date || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1.5 p-3 bg-slate-950/50 rounded-xl border border-white/5">
                  <span className="text-[8px] font-bold text-slate-600 uppercase">End Date</span>
                  <span className="text-xs text-slate-400 font-mono italic">{project.end_date || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">New Timeline Configuration</label>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                   <label className="text-[8px] font-bold text-slate-500 uppercase ml-1">Start Date</label>
                   <CustomDatePicker 
                     selectedDate={newStart || null}
                     onChange={setNewStart}
                   />
                </div>
                <div className="flex flex-col gap-1.5">
                   <label className="text-[8px] font-bold text-slate-500 uppercase ml-1">End Date</label>
                   <CustomDatePicker 
                     selectedDate={newEnd || null}
                     onChange={setNewEnd}
                   />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Justification / Reason</label>
            <textarea 
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700 min-h-[100px]"
              placeholder="Provide context for this schedule shift..."
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5"
            >
              Abrupty Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Committing Changes...' : 'Execute Timeline Shift'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}




function L1PhaseSelector({ value, onChange, className, disabled }: { value: string, onChange: (v: string) => void, className?: string, disabled?: boolean }) {
  if (disabled) {
    return <span className={cn(className, "cursor-default whitespace-normal break-words")}>{value || 'SELECT PHASE...'}</span>;
  }
  return (
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "bg-[var(--bg-page)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-main)] focus:border-[var(--accent)] outline-none transition-all font-bold appearance-none",
        className
      )}
    >
      <option value="" disabled>SELECT PHASE...</option>
      {PHASE_L1_OPTIONS.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function CreateProjectModal({ onClose, onSuccess, user, users, isMobile, setProjects, setTasks, setHasUnsavedChanges, hasUnsavedChanges }: { onClose: () => void, onSuccess: () => void, user: any, users: AppUser[], isMobile?: boolean, setProjects: React.Dispatch<React.SetStateAction<Project[]>>, setTasks: React.Dispatch<React.SetStateAction<Task[]>>, setHasUnsavedChanges: (val: boolean) => void, hasUnsavedChanges: boolean }) {
  const [showDeddyModal, setShowDeddyModal] = useState(false);

  const handleAttemptClose = () => {
    if (hasUnsavedChanges) {
      setShowDeddyModal(true);
    } else {
      onClose();
    }
  };
  const [title, setTitle] = useState('');
  const [pic, setPic] = useState(user?.name || user?.email || '');
  const [ticketId, setTicketId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [divOwner, setDivOwner] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectDiajukan, setProjectDiajukan] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [phases, setPhases] = useState<any[]>([{ 
    id: createPersistentId(),
    custom_id: `#PH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    title: PHASE_L1_OPTIONS[0], 
    assignee: user?.name || user?.email || '',
    status: TaskStatus.TODO,
    start_date: '',
    end_date: '',
    duration_hours: 0,
    man_hours: 0,
    detail_task: '',
    subtasks: [{ 
      id: createPersistentId(), 
      custom_id: `#TS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      title: '', 
      assignee: user?.name || user?.email || '',
      status: TaskStatus.TODO,
      task_type: 'New Feature' as const,
      components: [] as string[],
      detail_task: '',
      start_date: '',
      end_date: '',
      duration_hours: 0,
      man_hours: 0
    }]
  }]);
  const [loading, setLoading] = useState(false);
  
  const selectMasterProject = (master: MasterProject) => {
    setIsSyncing(true);
    setTicketId(master.ticket_id);
    setTitle(master.project_name);
    setPic(master.pic_name?.trim() || '');
    setOwnerName(master.owner_name?.trim() || '');
    setDivOwner(master.div_owner?.trim() || '');
    setTimeout(() => setIsSyncing(false), 500);
  };

  // Auto-Sync Level 1 to Project Header (Truly Automatic Master Dates)
  useEffect(() => {
    const validFromDates = phases.map(p => {
      const dates = [p.start_date, ...(p.subtasks?.map(s => s.start_date) || [])].filter(Boolean);
      return dates.length > 0 ? dates.reduce((a, b) => a < b ? a : b) : '';
    }).filter(Boolean);

    const validToDates = phases.map(p => {
      const dates = [p.end_date, ...(p.subtasks?.map(s => s.end_date) || [])].filter(Boolean);
      return dates.length > 0 ? dates.reduce((a, b) => a > b ? a : b) : '';
    }).filter(Boolean);

    if (validFromDates.length > 0) {
       const minDate = validFromDates.reduce((a, b) => a < b ? a : b);
       setStartDate(minDate);
    }
    if (validToDates.length > 0) {
       const maxDate = validToDates.reduce((a, b) => a > b ? a : b);
       setEndDate(maxDate);
    }
  }, [phases]);

  // Allocation Validation
  const allocationStats = useMemo(() => {
    return phases.map(phase => {
      const capacity = phase.man_hours || 0;
      const used = phase.subtasks.reduce((sum, sub) => sum + (sub.man_hours || 0), 0);
      return { 
        capacity, 
        used, 
        isOver: used > capacity, 
        isUnder: used < capacity,
        isPerfect: Math.abs(used - capacity) < 0.01 && capacity > 0,
        remaining: capacity - used
      };
    });
  }, [phases]);

  const totalManHours = useMemo(() => {
    return phases.reduce((acc, phase) => acc + (phase.man_hours || 0), 0);
  }, [phases]);

  const isAnyOverAllocated = allocationStats.some(s => s.isOver);

  const addPhase = () => {
    setHasUnsavedChanges(true);
    setPhases([...phases, { 
      id: createPersistentId(),
      custom_id: `#PH-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      title: PHASE_L1_OPTIONS[0], 
      assignee: pic || user?.name || user?.email || '',
      status: TaskStatus.TODO,
      detail_task: '',
      start_date: '',
      end_date: '',
      duration_hours: 0,
      man_hours: 0,
      subtasks: [{ 
        id: createPersistentId(), 
        custom_id: `#TS-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        title: '', 
        assignee: pic || user?.name || user?.email || '',
        status: TaskStatus.TODO,
        task_type: 'New Feature' as const,
        components: [] as string[],
        detail_task: '',
        start_date: '',
        end_date: '',
        duration_hours: 0,
        man_hours: 0
      }]
    }]);
  };

  const addSubtask = (phaseIndex: number) => {
    setHasUnsavedChanges(true);
    setPhases(prev => {
      const next = [...prev];
      const phase = { ...next[phaseIndex] };
      phase.subtasks = [...phase.subtasks, { 
        id: createPersistentId(), 
        custom_id: `#TS-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        title: '', 
        assignee: pic || user?.name || user?.email || '',
        status: TaskStatus.TODO,
        task_type: 'New Feature' as const,
        components: [] as string[],
        detail_task: '',
        start_date: '',
        end_date: '',
        duration_hours: 0,
        man_hours: 0
      }];
      next[phaseIndex] = phase;
      return next;
    });
  };

  const handleCreate = async () => {
    if (!title || isAnyOverAllocated) return;
    setLoading(true);
    try {
      const finalPic = (pic || user?.name || user?.email || 'Administrator').trim();
      const actorName = user?.name || 'Fachrul Wisnu Novianto';
      const actorEmail = user?.email || 'Administrator';

      // Calculate dynamic project start and end dates from phases and subtasks
      const allDates: number[] = [];
      phases.forEach(p => {
        if (p.start_date) allDates.push(new Date(`${p.start_date}T08:00:00`).getTime());
        if (p.end_date) allDates.push(new Date(`${p.end_date}T17:00:00`).getTime());
        p.subtasks?.forEach(s => {
          if (s.start_date) allDates.push(new Date(`${s.start_date}T08:00:00`).getTime());
          if (s.end_date) allDates.push(new Date(`${s.end_date}T17:00:00`).getTime());
        });
      });

      const pStart = allDates.length > 0 ? format(new Date(Math.min(...allDates)), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      const pEnd = allDates.length > 0 ? format(new Date(Math.max(...allDates)), 'yyyy-MM-dd') : format(addDays(new Date(), 7), 'yyyy-MM-dd');

      // 🔥 STRICT TODO DEFAULTING
      let initialProjectStatus = 'TODO' as any;

      // Step 1: Create Project Table entry
      const prj = await taskService.createProject({ 
        ticket_id: ticketId,
        project_name: title.trim(), 
        status: initialProjectStatus,
        leader_email: user?.email || actorEmail,
        pic_name: finalPic,
        owner_name: ownerName.trim(),
        owner_div: divOwner.trim() || undefined,
        div_owner: divOwner.trim(),
        project_diajukan: projectDiajukan.trim(),
        start_date: pStart || undefined,
        end_date: pEnd || undefined
      }, actorEmail);
      
      if (!prj || !prj.id) throw new Error("Project production failed (No primary ID returned)");
      
      // Update local state manually to prevent loop or unnecessary refetch
      setProjects(prev => [prj, ...prev]);

      // --- TASK 1: FIX PROJECT WIZARD L1 GROUPING ---
      // Group phases by their title to prevent duplicate L1 entries
      const groupedPhases = new Map<string, any[]>();
      phases.forEach(p => {
        const pTitle = (p.title || 'Untitled Phase').trim();
        if (!groupedPhases.has(pTitle)) groupedPhases.set(pTitle, []);
        groupedPhases.get(pTitle)!.push(p);
      });

      for (const [l1Title, pList] of groupedPhases.entries()) {
        try {
          // Calculate aggregate metrics for this L1 Group
          const totalMH = pList.reduce((sum, p) => sum + (parseFloat(String(p.man_hours ?? 0)) || 0), 0);
          
          const groupDates: number[] = [];
          pList.forEach(p => {
            if (p.start_date) groupDates.push(new Date(`${p.start_date}T00:00:00`).getTime());
            if (p.end_date) groupDates.push(new Date(`${p.end_date}T23:59:59`).getTime());
            p.subtasks?.forEach((s: any) => {
              if (s.start_date) groupDates.push(new Date(`${s.start_date}T00:00:00`).getTime());
              if (s.end_date) groupDates.push(new Date(`${s.end_date}T23:59:59`).getTime());
            });
          });

          const groupStart = groupDates.length > 0 ? format(new Date(Math.min(...groupDates)), 'yyyy-MM-dd') : pStart;
          const groupEnd = groupDates.length > 0 ? format(new Date(Math.max(...groupDates)), 'yyyy-MM-dd') : pEnd;

          // Step 1: Provision the Unified L1 Phase
          const l1 = await taskService.createTask({
            title: l1Title,
            status: 'TODO' as any,
            project_id: prj.id,
            assignee: pList[0].assignee || finalPic,
            start_time: new Date(`${groupStart}T08:00:00`).toISOString(),
            end_time: new Date(`${groupEnd}T17:00:00`).toISOString(),
            man_hours: totalMH,
            duration_hours: totalMH,
            created_by_name: user?.name || actorName
          }, actorEmail);
          
          setTasks(prev => [...prev, { ...l1, level: 1 }]);

          // Step 2: Provision all L2 Subtasks for this group
          for (const p of pList) {
            for (const sub of p.subtasks) {
              const subMH = parseFloat(String(sub.man_hours ?? 0)) || 0;
              const subStartStr = sub.start_date || p.start_date || groupStart;
              const subEndStr = sub.end_date || subStartStr || p.end_date || groupEnd;

              const s = await taskService.createTask({
                title: sub.title || 'Untitled Sub-task',
                status: 'TODO' as any,
                task_type: (sub as any).task_type || 'New Feature',
                project_id: prj.id,
                parent_id: l1.id, // Linked to the grouped parent
                assignee: (sub as any).assignee || p.assignee || finalPic,
                start_time: new Date(`${subStartStr}T08:00:00`).toISOString(),
                end_time: new Date(`${subEndStr}T17:00:00`).toISOString(),
                man_hours: subMH,
                duration_hours: subMH,
                created_by_name: user?.name || actorName
              }, actorEmail);
              
              setTasks(prev => [...prev, { ...s, level: 2 }]);
            }
          }
        } catch (l1Error: any) {
          console.error(`Grouped Phase Creation Failure [${l1Title}]:`, l1Error);
          throw new Error(`Failed to provision grouped phase "${l1Title}": ${l1Error.message || 'Unknown error'}`);
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Project Creation Wizard failed:", err);
      const dbError = err?.message || err?.details || "Failed to create project infrastructure.";
      alert(`Critical Creation Error: ${dbError}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-[0_0_50px_rgba(67,24,255,0.2)] flex flex-col"
      >
        <div className="p-6 border-b border-[var(--border)] bg-[var(--accent)]/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-[var(--text-main)] tracking-tighter uppercase italic">
              Project <span className="text-[var(--accent)]">Wizard</span>
            </h2>
            <p className="text-[10px] text-[var(--text-sub)] mt-1 font-bold uppercase tracking-widest">Multi-Level Batch Provisioning</p>
          </div>
          <button onClick={handleAttemptClose} className="p-2 hover:bg-[var(--bg-page)] rounded-full transition-colors">
            <Plus className="w-5 h-5 text-[var(--text-sub)] rotate-45" />
          </button>
        </div>

        <div className="p-4 sm:p-8 flex-1 overflow-x-auto overflow-y-auto space-y-8 scrollbar-hide">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Row 1: Ticket ID, Lead PIC, Start Date, End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest px-1">Ticket ID</label>
                <TicketSelector 
                  value={ticketId}
                  onChange={(val) => {
                    setTicketId(val);
                    setHasUnsavedChanges(true);
                  }}
                  onSelectMaster={selectMasterProject}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest px-1">Lead PIC</label>
                <LocalInput 
                  value={pic}
                  onChange={v => {
                    setPic(v);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Lead PIC Name..."
                  className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest px-1">Start Date</label>
                <CustomDatePicker 
                  selectedDate={startDate}
                  onChange={setStartDate}
                  className="!min-w-[160px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest px-1">End Date</label>
                <CustomDatePicker 
                  selectedDate={endDate}
                  onChange={setEndDate}
                  className="!min-w-[160px]"
                />
              </div>
            </div>

            {/* Row 2: Project Name (Full Width Textarea) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest px-1">Project Name</label>
              <textarea 
                rows={2}
                autoFocus={!ticketId}
                value={title}
                onChange={e => {
                  setTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Ex Detail: Pengembangan Fitur Automated Reporting..."
                className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors font-bold text-sm resize-none"
              />
            </div>
            
            {/* Row 3: Owner Name & Division */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest px-1">Owner Name</label>
                <LocalInput 
                  value={ownerName}
                  onChange={v => {
                    setOwnerName(v);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Enter Owner Name..."
                  className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-4 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)] font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest px-1">Division</label>
                <LocalInput 
                  value={divOwner}
                  onChange={v => {
                    setDivOwner(v);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Enter Division Name..."
                  className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-4 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)] font-bold"
                />
              </div>
            </div>

            {/* Row 4: Project Diajukan */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest px-1">Project Diajukan (Short Summary)</label>
              <textarea 
                rows={4}
                value={projectDiajukan}
                onChange={e => {
                  setProjectDiajukan(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Ringkasan pengajuan project..."
                className="w-full bg-[#111C44] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-[var(--accent)] transition-colors font-bold text-sm resize-none"
              />
            </div>

          </div>

          <div className={cn("space-y-6", !isMobile && "min-w-[1100px]")}>
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black text-[var(--accent)] uppercase tracking-widest">Work Breakdown Structure (WBS)</label>
              <button 
                onClick={addPhase}
                className="text-[9px] font-black uppercase text-[var(--accent)] hover:text-[var(--accent)] transition-colors bg-[var(--accent)]/10 px-4 py-2 rounded-lg border border-[var(--accent)]/20"
              >
                + Add Phase (L1)
              </button>
            </div>

            {/* Header Labels (Desktop Only) */}
            {!isMobile && (
              <div className="grid grid-cols-[1fr_130px_130px_80px_150px_80px] gap-4 px-6 mb-[-16px]">
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest pl-2">Phase / Task Name</label>
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest text-center">From Date</label>
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest text-center">To Date</label>
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest text-center">Man-Hours</label>
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest text-center">PIC</label>
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest text-center">Actions</label>
              </div>
            )}

            {phases.map((phase, pIdx) => {
              const stats = allocationStats[pIdx];
              return (
                <div key={getSafeKey(phase, pIdx, 'wizard-phase')} className="bg-[var(--bg-page)]/40 border border-[var(--border)] rounded-2xl p-6 space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--accent)]/30 group-hover:bg-[var(--accent)] transition-colors" />
                  
                  {/* L1 Header & Inputs */}
                  <div className={cn(
                    "items-center gap-4 bg-[var(--bg-card)]/50 p-4 rounded-xl border border-[var(--border)] shadow-sm transition-all hover:bg-[var(--bg-card)]/70",
                    isMobile ? "flex flex-col" : "grid grid-cols-[1fr_130px_130px_80px_150px_80px]"
                  )}>
                    <div className="flex items-center gap-2 w-full">
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-[var(--bg-page)] border border-[var(--accent)]/30 text-[8px] font-black text-[var(--accent)] font-mono tracking-wider shadow-inner">
                        {phase.custom_id}
                      </span>
                      <L1PhaseSelector 
                        value={phase.title}
                        onChange={(v) => {
                          const newPhases = [...phases];
                          newPhases[pIdx].title = v;
                          setPhases(newPhases);
                        }}
                        className="w-full"
                      />
                      <textarea 
                        rows={1}
                        value={(phase as any).detail_task || ''}
                        placeholder="Phase Description / Detail Breakdown..."
                        onChange={(e) => {
                          const newPhases = [...phases];
                          (newPhases[pIdx] as any).detail_task = e.target.value;
                          setPhases(newPhases);
                        }}
                        className="w-full bg-[#111C44] border border-white/10 text-white rounded-lg px-2 py-1.5 text-[10px] outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all mt-1 resize-none overflow-hidden hover:bg-white/10 focus:bg-white/10"
                      />
                    </div>

                    <div className={cn("flex flex-col gap-1", isMobile && "w-full")}>
                      {isMobile && <label className="text-[8px] font-black text-[var(--text-sub)] uppercase ml-1">From Date</label>}
                      <CustomDatePicker 
                        selectedDate={phase.start_date}
                        onChange={date => {
                          const newPhases = [...phases];
                          newPhases[pIdx].start_date = date || '';
                          setPhases(newPhases);
                        }}
                      />
                    </div>

                    <div className={cn("flex flex-col gap-1", isMobile && "w-full")}>
                      {isMobile && <label className="text-[8px] font-black text-[var(--text-sub)] uppercase ml-1">To Date</label>}
                      <CustomDatePicker 
                        selectedDate={phase.end_date}
                        onChange={date => {
                          const newPhases = [...phases];
                          newPhases[pIdx].end_date = date || '';
                          setPhases(newPhases);
                        }}
                      />
                    </div>

                    <div className={cn("flex flex-col items-center gap-1", isMobile && "w-full")}>
                      {isMobile && <label className="text-[8px] font-black text-[var(--text-sub)] uppercase ml-1 w-full text-left">Man-Hours</label>}
                      <input 
                        type="number" min="0" step="0.5"
                        value={phase.man_hours}
                        onChange={(e) => {
                          const newPhases = [...phases];
                          newPhases[pIdx].man_hours = Math.max(0, parseFloat(e.target.value) || 0);
                          setPhases(newPhases);
                        }}
                        className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-lg px-2 py-2.5 text-xs text-[var(--accent)] text-center font-black outline-none focus:border-[var(--accent)]"
                      />
                      <span className="text-[8px] font-black text-[var(--text-sub)] uppercase tracking-tight h-3">
                         {phase.man_hours > 0 ? `≈ ${formatWorkday(phase.man_hours)}` : ''}
                      </span>
                    </div>

                    <div className={cn("flex flex-col", isMobile && "w-full")}>
                      {isMobile && <label className="text-[8px] font-black text-[var(--text-sub)] uppercase ml-1 block mb-1">PIC Name</label>}
                      <LocalInput 
                        value={(phase as any).assignee}
                        onChange={(v) => {
                          const newPhases = [...phases];
                          (newPhases[pIdx] as any).assignee = v;
                          setPhases(newPhases);
                        }}
                        className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[10px] text-[var(--text-sub)] text-center outline-none focus:border-[var(--accent)]"
                        placeholder="PIC Name"
                      />
                    </div>

                    <div className={cn("flex justify-center gap-4", isMobile && "w-full pt-4 border-t border-[var(--border)]")}>
                      <button 
                        onClick={() => addSubtask(pIdx)}
                        className={cn("p-2.5 hover:bg-[var(--accent)]/10 text-[var(--accent)]/40 hover:text-[var(--accent)] rounded-xl transition-all", isMobile && "flex-1 border border-[var(--accent)]/20 bg-[var(--accent)]/5")}
                        title="Add Breakdown"
                      >
                        {isMobile ? <span className="flex items-center justify-center gap-2 text-[10px] font-black uppercase"><Plus className="w-4 h-4" /> Add Sub-task</span> : <Plus className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => {
                          const newPhases = [...phases];
                          newPhases.splice(pIdx, 1);
                          setPhases(newPhases);
                        }}
                        className={cn("p-2.5 hover:bg-[var(--danger)]/10 text-[var(--text-sub)] hover:text-[var(--danger)] rounded-xl transition-all", isMobile && "flex-1 border border-[var(--danger)]/20 bg-[var(--danger)]/5")}
                        title="Delete Phase"
                      >
                        {isMobile ? <span className="flex items-center justify-center gap-2 text-[10px] font-black uppercase"><Trash2 className="w-4 h-4" /> Delete</span> : <Trash2 className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Allocation Validation Message */}
                  <div className="px-4">
                    {stats.isOver && (
                      <p key={`over-${phase.id}`} className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 bg-rose-500/10 py-2 px-3 rounded-lg border border-rose-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        ⚠️ Over-Allocated: Breakdown melebihi durasi Task Utama! (Kekurangan {formatWorkday(Math.abs(stats.remaining))})
                      </p>
                    )}
                    {stats.isUnder && (
                      <p key={`under-${phase.id}`} className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 bg-amber-500/10 py-2 px-3 rounded-lg border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        ⚠️ Under-Allocated: Sisa waktu {formatWorkday(stats.remaining)} belum dialokasikan
                      </p>
                    )}
                    {stats.isPerfect && (
                      <p key={`perfect-${phase.id}`} className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 bg-emerald-500/5 py-2 px-3 rounded-lg border border-emerald-500/20">
                        <Plus className="w-3 h-3 text-emerald-500" />
                        ✅ Alokasi Waktu Pas
                      </p>
                    )}
                    {stats.capacity === 0 && (
                       <p key={`no-duration-${phase.id}`} className="text-[9px] font-bold text-slate-600 italic uppercase">Tentukan durasi untuk menghitung validasi alokasi.</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-4">
                      <p className="text-[9px] font-black text-[var(--text-sub)] uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/50" />
                        Execution Breakdown
                      </p>
                    </div>

                    <div className="space-y-4">
                      {phase.subtasks.map((sub, sIdx) => {
                        return (
                          <div key={getSafeKey(sub, sIdx, 'wizard-subtask')} className="flex flex-col gap-4 p-4 bg-[#111C44] border border-[#1B254B] rounded-xl mb-4 ml-0 sm:ml-8 transition-all hover:border-[var(--accent)]/30 group/sub">
                            {/* ROW 1: Basic Info */}
                            <div className={cn(
                              "grid items-center gap-4",
                              isMobile ? "grid-cols-1" : "grid-cols-[1fr_130px_130px_80px_150px_40px]"
                            )}>
                              <div className="flex items-center gap-3">
                                {!isMobile && <span className="text-[var(--accent)]/20 font-black text-xl select-none group-hover/sub:text-[var(--accent)]/40">↳</span>}
                                <span className="shrink-0 px-2 py-0.5 rounded-full bg-[var(--bg-page)] border border-[var(--accent)]/20 text-[8px] font-bold text-[var(--accent)]/60 font-mono tracking-wider">
                                  {(sub as any).custom_id}
                                </span>
                                <LocalInput 
                                  value={sub.title}
                                  placeholder="Enter the task breakdown name..."
                                  onChange={(v) => {
                                    const newPhases = [...phases];
                                    newPhases[pIdx].subtasks[sIdx].title = v;
                                    setPhases(newPhases);
                                  }}
                                  className="w-full bg-transparent border-b border-[var(--border)] text-xs text-[var(--text-main)] py-1.5 outline-none focus:border-[var(--accent)]/10 transition-all font-bold"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                {isMobile && <label className="text-[8px] font-black text-[var(--text-sub)] uppercase">From Date</label>}
                                <CustomDatePicker 
                                  selectedDate={sub.start_date}
                                  onChange={date => {
                                    if (phase.start_date && date && date < phase.start_date) {
                                      alert("Tanggal mulai child task tidak boleh mendahului tanggal pada task!");
                                      return;
                                    }
                                    const newPhases = [...phases];
                                    newPhases[pIdx].subtasks[sIdx].start_date = date || '';
                                    setPhases(newPhases);
                                  }}
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                {isMobile && <label className="text-[8px] font-black text-[var(--text-sub)] uppercase">To Date</label>}
                                <CustomDatePicker 
                                  selectedDate={sub.end_date}
                                  onChange={date => {
                                    if (phase.end_date && date && date > phase.end_date) {
                                      alert("Tanggal selesai child task tidak boleh melebihi task utama!");
                                      return;
                                    }
                                    const newPhases = [...phases];
                                    newPhases[pIdx].subtasks[sIdx].end_date = date || '';
                                    setPhases(newPhases);
                                  }}
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                {isMobile && <label className="text-[8px] font-black text-[var(--text-sub)] uppercase">Man-Hours</label>}
                                <input 
                                  type="number" min="0" step="0.5"
                                  value={sub.man_hours}
                                  onChange={(e) => {
                                    const newPhases = [...phases];
                                    newPhases[pIdx].subtasks[sIdx].man_hours = Math.max(0, parseFloat(e.target.value) || 0);
                                    setPhases(newPhases);
                                  }}
                                  className="bg-[#0B1437] border border-[#1B254B] rounded-lg px-2 py-2 text-[10px] text-[var(--accent)] text-center font-black outline-none focus:border-[var(--accent)]"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                {isMobile && <label className="text-[8px] font-black text-[var(--text-sub)] uppercase">Assignee</label>}
                                <LocalInput 
                                  value={(sub as any).assignee}
                                  onChange={(v) => {
                                    const newPhases = [...phases];
                                    (newPhases[pIdx].subtasks[sIdx] as any).assignee = v;
                                    setPhases(newPhases);
                                  }}
                                  placeholder="Assignee"
                                  className="w-full bg-[#0B1437] border border-[#1B254B] rounded px-2 py-2 text-[10px] text-white/70 outline-none focus:border-[var(--accent)]"
                                />
                              </div>

                              <button 
                                onClick={() => {
                                  const newPhases = [...phases];
                                  newPhases[pIdx].subtasks.splice(sIdx, 1);
                                  setPhases(newPhases);
                                }}
                                className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-lg transition-all flex items-center justify-center"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* ROW 2: Metadata (Type & Components) */}
                            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-4">
                              <select 
                                value={(sub as any).task_type || 'New Feature'}
                                onChange={(e) => {
                                  const newPhases = [...phases];
                                  (newPhases[pIdx].subtasks[sIdx] as any).task_type = e.target.value;
                                  setPhases(newPhases);
                                }}
                                className="bg-[#0B1437] border border-[#1B254B] text-[10px] text-white font-black uppercase tracking-widest rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-[var(--accent)]"
                              >
                                <option value="New Feature">New Feature</option>
                                <option value="Improvement">Improvement</option>
                              </select>

                              <div className="flex flex-wrap gap-2 p-1.5 bg-[#0B1437] border border-[#1B254B] rounded-lg">
                                {['Web', 'Android', 'API', 'Desktop', 'Database', 'Report'].map(comp => {
                                  const currentComps = (sub as any).components || [];
                                  const isSelected = currentComps.includes(comp);
                                  return (
                                    <button 
                                      key={comp}
                                      type="button"
                                      onClick={() => {
                                        const newPhases = [...phases];
                                        const nextComps = isSelected 
                                          ? currentComps.filter((c: string) => c !== comp)
                                          : [...currentComps, comp];
                                        (newPhases[pIdx].subtasks[sIdx] as any).components = nextComps;
                                        setPhases(newPhases);
                                      }}
                                      className={cn(
                                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all border",
                                        isSelected 
                                          ? "bg-[var(--accent)] border-[var(--accent)] text-white" 
                                          : "bg-white/5 border-white/5 text-white/30 hover:text-white"
                                      )}
                                    >
                                      {comp}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* ROW 3: Detail Task */}
                            <textarea 
                              rows={3}
                              value={(sub as any).detail_task || ''}
                              placeholder="Detail pengajuan task / Keterangan breakdown..."
                              onChange={(e) => {
                                const newPhases = [...phases];
                                (newPhases[pIdx].subtasks[sIdx] as any).detail_task = e.target.value;
                                setPhases(newPhases);
                              }}
                              className="w-full bg-[#0B1437] border border-[#1B254B] text-gray-300 rounded-lg p-3 text-[10px] font-medium leading-relaxed focus:ring-2 focus:ring-[var(--accent)]/50 outline-none transition-all resize-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-8 border-t border-[var(--border)] bg-[var(--bg-card)]/50 flex justify-between items-center px-10">
          <p className="text-[10px] text-[var(--text-sub)] font-bold uppercase tracking-[0.2em] flex items-center gap-6">
            <span key="wizard-stat-phases" className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse outline outline-offset-2 outline-[var(--accent)]/20" />
              {phases.length} Phases
            </span>
            <span key="wizard-stat-hours" className="flex items-center gap-2">
               <span className="w-2.5 h-2.5 rounded-full bg-[var(--bg-page)]" />
               <span className="text-[var(--accent)] font-black">Total Man-Hours: {(totalManHours || 0).toFixed(1)} Jam</span>
               <span className="text-[var(--text-sub)] font-medium ml-1">{totalManHours > 0 ? `≈ ${formatWorkday(totalManHours)}` : ''}</span>
            </span>
            {isAnyOverAllocated && (
               <span key="wizard-stat-error" className="text-[var(--danger)] font-black animate-pulse">⚠️ Resolusi Over-Alokasi diperlukan</span>
            )}
          </p>
          <div className="flex gap-4">
            <button 
              disabled={loading}
              onClick={handleAttemptClose}
              className="px-8 py-3 bg-[var(--bg-page)] hover:bg-[var(--bg-card)] text-[var(--text-sub)] font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              disabled={loading || !title || isAnyOverAllocated}
              onClick={handleCreate}
              className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 disabled:opacity-30 disabled:grayscale text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(67,24,255,0.3)] hover:shadow-[0_15px_40px_rgba(67,24,255,0.4)] flex items-center gap-3 disabled:cursor-not-allowed"
            >
              {loading ? "Synchronizing..." : "Spawn Infrastructure"}
            </button>
          </div>
        </div>
      </motion.div>

      <UnsavedChangesModal 
        isOpen={showDeddyModal}
        onClose={() => setShowDeddyModal(false)}
        onDiscard={() => {
          setShowDeddyModal(false);
          setHasUnsavedChanges(false);
          onClose();
        }}
      />
    </div>
  );
}

function EditProjectWBSModal({ project, tasks, onClose, onSuccess, user, users, isMobile, setProjects, setTasks, setHasUnsavedChanges, hasUnsavedChanges }: { project: Project, tasks: Task[], onClose: () => void, onSuccess: () => void, user: any, users: AppUser[], isMobile?: boolean, setProjects: React.Dispatch<React.SetStateAction<Project[]>>, setTasks: React.Dispatch<React.SetStateAction<Task[]>>, setHasUnsavedChanges: (val: boolean) => void, hasUnsavedChanges: boolean }) {
  const [showDeddyModal, setShowDeddyModal] = useState(false);

  const handleAttemptClose = () => {
    if (hasUnsavedChanges) {
      setShowDeddyModal(true);
    } else {
      onClose();
    }
  };
  const [title, setTitle] = useState(project.project_name);
  const [pic, setPic] = useState(project.pic_name || '');
  const [ticketId, setTicketId] = useState(project.ticket_id || '');
  const [ownerName, setOwnerName] = useState(project.owner_name || '');
  const [divOwner, setDivOwner] = useState(project.div_owner || '');
  const [startDate, setStartDate] = useState(project.start_date || '');
  const [endDate, setEndDate] = useState(project.end_date || '');
  const [projectDiajukan, setProjectDiajukan] = useState(project.project_diajukan || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletedTaskIds, setDeletedTaskIds] = useState<string[]>([]);
  
  const [phases, setPhases] = useState<any[]>(() => {
    const l1s = tasks.filter(t => !t.parent_id).sort((a,b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    return l1s.map(l1 => ({
      ...l1,
      start_date: l1.start_time ? format(new Date(l1.start_time), 'yyyy-MM-dd') : '',
      end_date: l1.end_time ? format(new Date(l1.end_time), 'yyyy-MM-dd') : '',
      subtasks: tasks.filter(t => t.parent_id === l1.id).sort((a,b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()).map(s => ({
        ...s,
        start_date: s.start_time ? format(new Date(s.start_time), 'yyyy-MM-dd') : '',
        end_date: s.end_time ? format(new Date(s.end_time), 'yyyy-MM-dd') : '',
      }))
    }));
  });

  const selectMasterProject = (master: MasterProject) => {
    setIsSyncing(true);
    setTicketId(master.ticket_id);
    setTitle(master.project_name);
    setPic(master.pic_name?.trim() || '');
    setOwnerName(master.owner_name?.trim() || '');
    setDivOwner(master.div_owner?.trim() || '');
    setTimeout(() => setIsSyncing(false), 500);
  };

  useEffect(() => {
    const validFromDates = phases.map(p => {
      const dates = [p.start_date, ...(p.subtasks?.map((s: any) => s.start_date) || [])].filter(Boolean);
      return dates.length > 0 ? dates.reduce((a, b) => a < b ? a : b) : '';
    }).filter(Boolean);

    const validToDates = phases.map(p => {
      const dates = [p.end_date, ...(p.subtasks?.map((s: any) => s.end_date) || [])].filter(Boolean);
      return dates.length > 0 ? dates.reduce((a, b) => a > b ? a : b) : '';
    }).filter(Boolean);

    if (validFromDates.length > 0) {
       const minDate = validFromDates.reduce((a, b) => a < b ? a : b);
       setStartDate(minDate);
    }
    if (validToDates.length > 0) {
       const maxDate = validToDates.reduce((a, b) => a > b ? a : b);
       setEndDate(maxDate);
    }
  }, [phases]);

  const allocationStats = useMemo(() => {
    return phases.map(phase => {
      const capacity = phase.man_hours || 0;
      const used = phase.subtasks.reduce((sum: number, sub: any) => sum + (sub.man_hours || 0), 0);
      return { 
        capacity, 
        used, 
        isOver: used > capacity, 
        isUnder: used < capacity,
        isPerfect: Math.abs(used - capacity) < 0.01 && capacity > 0,
        remaining: capacity - used
      };
    });
  }, [phases]);

  const totalManHours = useMemo(() => {
    return phases.reduce((acc, phase) => acc + (phase.man_hours || 0), 0);
  }, [phases]);

  const isAnyOverAllocated = allocationStats.some(s => s.isOver);

  const addPhase = () => {
    setHasUnsavedChanges(true);
    setPhases([...phases, { 
      id: `temp-PH-${Math.random().toString(36).substring(2, 6)}`,
      custom_id: `#PH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      title: PHASE_L1_OPTIONS[0], 
      assignee: pic || user?.name || user?.email || '',
      status: TaskStatus.TODO,
      start_date: '',
      end_date: '',
      man_hours: 0,
      subtasks: []
    }]);
  };

  const addSubtask = (phaseIndex: number) => {
    setHasUnsavedChanges(true);
    setPhases(prev => {
      const next = [...prev];
      const phase = { ...next[phaseIndex] };
      phase.subtasks = [...phase.subtasks, { 
        id: `temp-TS-${Math.random().toString(36).substring(2, 6)}`, 
        custom_id: `#TS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        title: '', 
        assignee: pic || user?.name || user?.email || '',
        status: TaskStatus.TODO,
        task_type: 'New Feature',
        components: [],
        detail_task: '',
        start_date: '',
        end_date: '',
        man_hours: 0
      }];
      next[phaseIndex] = phase;
      return next;
    });
  };

  const handleUpdate = async () => {
    if (!title || isAnyOverAllocated || loading) return;
    setLoading(true);
    try {
      const actorEmail = user?.email || 'Administrator';
      const actorName = user?.name || 'Fachrul Wisnu Novianto';

      // 1. Update Project Header
      const updatedProject = await taskService.updateProject(project.id, {
        ticket_id: ticketId,
        project_name: title.trim(),
        pic_name: pic.trim(),
        owner_name: ownerName.trim(),
        div_owner: divOwner.trim(),
        project_diajukan: projectDiajukan.trim(),
        start_date: startDate || undefined,
        end_date: endDate || undefined
      }, actorEmail);

      // Update local state directly to skip refetch loops
      setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));

      // 2. Identify and execute deletes
      if (deletedTaskIds.length > 0) {
        for (const tid of deletedTaskIds) {
          if (!tid.startsWith('temp-')) {
            await supabase.from('tasks').delete().eq('id', tid);
            setTasks(prev => prev.filter(t => t.id !== tid));
          }
        }
      }

      // 3. Update or Create Phases and Subtasks
      for (const phase of phases) {
        const mH = parseFloat(String(phase.man_hours ?? 0)) || 0;
        const phaseData: any = {
          title: phase.title,
          custom_id: phase.custom_id,
          detail_task: phase.detail_task || '',
          project_id: project.id,
          assignee: phase.assignee || pic,
          start_time: phase.start_date ? new Date(`${phase.start_date}T08:00:00`).toISOString() : phase.start_time,
          end_time: phase.end_date ? new Date(`${phase.end_date}T17:00:00`).toISOString() : phase.end_time,
          duration_hours: mH,
          man_hours: mH,
          updated_at: new Date().toISOString()
        };

        let l1;
        if (phase.id.startsWith('temp-')) {
          l1 = await taskService.createTask({
            ...phaseData,
            status: 'TODO' as any,
            parent_id: null,
            start_hour: 8,
            start_minute: 0,
            duration_minutes: 0,
            created_by_name: actorName
          }, actorEmail);
          setTasks(prev => [...prev, { ...l1, level: 1 }]);
        } else {
          l1 = await taskService.updateTask(phase.id, phaseData, actorEmail);
          setTasks(prev => prev.map(t => t.id === phase.id ? { ...l1, level: 1 } : t));
        }

        // Process Subtasks
        for (const sub of phase.subtasks) {
          const subMH = parseFloat(String(sub.man_hours ?? 0)) || 0;
          const subData: any = {
            title: sub.title,
            custom_id: sub.custom_id,
            task_type: sub.task_type || 'New Feature',
            components: sub.components || [],
            detail_task: sub.detail_task || '',
            project_id: project.id,
            parent_id: l1.id,
            assignee: sub.assignee || pic,
            start_time: sub.start_date ? new Date(`${sub.start_date}T08:00:00`).toISOString() : sub.start_time,
            end_time: sub.end_date ? new Date(`${sub.end_date}T17:00:00`).toISOString() : sub.end_time,
            duration_hours: subMH,
            man_hours: subMH,
            updated_at: new Date().toISOString()
          };

          if (sub.id.startsWith('temp-')) {
            const s = await taskService.createTask({
              ...subData,
              status: 'TODO' as any,
              start_hour: 8,
              start_minute: 0,
              duration_minutes: 0,
              created_by_name: actorName
            }, actorEmail);
            setTasks(prev => [...prev, { ...s, level: 2 }]);
          } else {
            const updatedS = await taskService.updateTask(sub.id, subData, actorEmail);
            setTasks(prev => prev.map(t => t.id === sub.id ? { ...updatedS, level: 2 } : t));
          }
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Project Update failed:", err);
      alert("Failed to update project breakdown: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.2)] flex flex-col"
      >
        <div className="p-6 border-b border-[var(--border)] bg-blue-600/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-[var(--text-main)] tracking-tighter uppercase italic">
              Edit Breakdown <span className="text-blue-500">Timeline</span>
            </h2>
            <p className="text-[10px] text-[var(--text-sub)] mt-1 font-bold uppercase tracking-widest">{project.ticket_id} • {project.project_name}</p>
          </div>
          <button onClick={handleAttemptClose} className="p-2 hover:bg-[var(--bg-page)] rounded-full transition-colors">
            <Plus className="w-5 h-5 text-[var(--text-sub)] rotate-45" />
          </button>
        </div>

        <div className="p-4 sm:p-8 flex-1 overflow-x-auto overflow-y-auto space-y-8 scrollbar-hide">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Fields (Clone of Create) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-1">Ticket ID</label>
                <TicketSelector 
                  value={ticketId}
                  onChange={(val) => {
                    setTicketId(val);
                    setHasUnsavedChanges(true);
                  }}
                  onSelectMaster={selectMasterProject}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest px-1">Lead PIC</label>
                <LocalInput 
                  value={pic}
                  onChange={v => {
                    setPic(v);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Lead PIC Name..."
                  className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-main)] outline-none focus:border-blue-500 transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest px-1">Start Date</label>
                <CustomDatePicker 
                  selectedDate={startDate}
                  onChange={setStartDate}
                  className="!min-w-[160px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest px-1">End Date</label>
                <CustomDatePicker 
                  selectedDate={endDate}
                  onChange={setEndDate}
                  className="!min-w-[160px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest px-1">Project Name</label>
              <textarea 
                rows={2}
                value={title}
                onChange={e => {
                  setTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-main)] outline-none focus:border-blue-500 transition-all font-bold text-sm resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest px-1">Owner Name</label>
                <LocalInput 
                  value={ownerName}
                  onChange={v => setOwnerName(v)}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-4 text-sm text-[var(--text-main)] outline-none focus:border-blue-500 font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest px-1">Division</label>
                <LocalInput 
                  value={divOwner}
                  onChange={v => setDivOwner(v)}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-4 text-sm text-[var(--text-main)] outline-none focus:border-blue-500 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-1">Project Diajukan (Short Summary)</label>
              <textarea 
                rows={4}
                value={projectDiajukan}
                onChange={e => setProjectDiajukan(e.target.value)}
                className="w-full bg-[#111C44] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-blue-500 transition-all font-bold text-sm resize-none"
              />
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-[var(--border)]">
              <label className="text-sm font-black text-blue-500 uppercase tracking-widest">Work Breakdown Structure (WBS)</label>
              <button 
                onClick={addPhase}
                className="text-[9px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20"
              >
                + Add Phase (L1)
              </button>
            </div>

            {phases.map((phase, pIdx) => {
              const stats = allocationStats[pIdx];
              return (
                <div key={phase.id} className="bg-[var(--bg-page)]/40 border border-[var(--border)] rounded-2xl p-6 space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500/30 group-hover:bg-blue-500 transition-colors" />
                  
                  <div className={cn(
                    "items-center gap-4 bg-[var(--bg-card)]/50 p-4 rounded-xl border border-[var(--border)] shadow-sm transition-all hover:bg-[var(--bg-card)]/70",
                    isMobile ? "flex flex-col" : "grid grid-cols-[1fr_130px_130px_80px_150px_80px]"
                  )}>
                    <div className="flex items-center gap-2 w-full">
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-[var(--bg-page)] border border-blue-500/30 text-[8px] font-black text-blue-400 font-mono tracking-wider">
                        {phase.custom_id}
                      </span>
                      <L1PhaseSelector 
                        value={phase.title}
                        onChange={(v) => {
                          const newPhases = [...phases];
                          newPhases[pIdx].title = v;
                          setPhases(newPhases);
                        }}
                        className="w-full"
                      />
                    </div>

                    <div className={cn("flex flex-col gap-1", isMobile && "w-full")}>
                      <CustomDatePicker 
                        selectedDate={phase.start_date}
                        onChange={date => {
                          const newPhases = [...phases];
                          newPhases[pIdx].start_date = date || '';
                          setPhases(newPhases);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className={cn("flex flex-col gap-1", isMobile && "w-full")}>
                      <CustomDatePicker 
                        selectedDate={phase.end_date}
                        onChange={date => {
                          const newPhases = [...phases];
                          newPhases[pIdx].end_date = date || '';
                          setPhases(newPhases);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className={cn("flex flex-col items-center gap-1", isMobile && "w-full")}>
                      <input 
                        type="number" min="0" step="0.5"
                        value={phase.man_hours}
                        onChange={(e) => {
                          const newPhases = [...phases];
                          newPhases[pIdx].man_hours = Math.max(0, parseFloat(e.target.value) || 0);
                          setPhases(newPhases);
                        }}
                        className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-lg px-2 py-2.5 text-xs text-blue-400 text-center font-black outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className={cn("flex flex-col", isMobile && "w-full")}>
                      <LocalInput 
                        value={phase.assignee}
                        onChange={(v) => {
                          const newPhases = [...phases];
                          newPhases[pIdx].assignee = v;
                          setPhases(newPhases);
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[10px] text-[var(--text-sub)] text-center outline-none"
                      />
                    </div>

                    <div className={cn("flex justify-center gap-4", isMobile && "w-full pt-4 border-t border-[var(--border)]")}>
                      <button 
                        onClick={() => addSubtask(pIdx)}
                        className="p-2.5 hover:bg-blue-500/10 text-blue-500/40 hover:text-blue-500 rounded-xl transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          setDeletedTaskIds([...deletedTaskIds, phase.id, ...phase.subtasks.map((s: any) => s.id)]);
                          const newPhases = [...phases];
                          newPhases.splice(pIdx, 1);
                          setPhases(newPhases);
                        }}
                        className="p-2.5 hover:bg-rose-500/10 text-[var(--text-sub)] hover:text-rose-500 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Validation Msg */}
                  <div className="px-4">
                    {stats.isOver && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 py-2 px-3 rounded-lg border border-rose-500/20 flex items-center gap-2">⚠️ Over-Allocated: Breakdown melebihi L1!</p>}
                    {stats.isUnder && <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 py-2 px-3 rounded-lg border border-amber-500/20 flex items-center gap-2">⚠️ Under-Allocated: {formatWorkday(stats.remaining)} Sisa</p>}
                    {stats.isPerfect && <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 py-2 px-3 rounded-lg border border-emerald-500/20 flex items-center gap-2">✅ Alokasi Pas</p>}
                  </div>

                  <div className="space-y-4">
                    {phase.subtasks.map((sub: any, sIdx: number) => (
                      <div key={sub.id} className="relative ml-0 sm:ml-8 p-6 bg-[#111C44] border border-[#1B254B] rounded-2xl group/sub hover:border-blue-500/40 transition-all space-y-4 shadow-xl">
                        <div className="absolute top-4 right-4 group-hover/sub:opacity-100 opacity-30 transition-opacity">
                          <button 
                            onClick={() => {
                              setDeletedTaskIds([...deletedTaskIds, sub.id]);
                              const newPhases = [...phases];
                              newPhases[pIdx].subtasks.splice(sIdx, 1);
                              setPhases(newPhases);
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* LINE 1: Title, Dates, Hours, PIC */}
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_130px_130px_80px_180px] gap-4 items-center">
                          <div className="flex items-center gap-3">
                            <span className="shrink-0 px-2 py-0.5 rounded-full bg-slate-900 border border-blue-500/20 text-[8px] font-bold text-blue-400 font-mono uppercase">
                              {sub.custom_id}
                            </span>
                            <LocalInput 
                              value={sub.title}
                              onChange={v => {
                                const next = [...phases];
                                next[pIdx].subtasks[sIdx].title = v;
                                setPhases(next);
                              }}
                              placeholder="Sub-task Title..."
                              className="bg-transparent border-b border-white/10 text-sm text-white font-bold py-1 w-full outline-none focus:border-blue-500"
                            />
                          </div>
                          <CustomDatePicker selectedDate={sub.start_date} onChange={d => {
                            const next = [...phases];
                            next[pIdx].subtasks[sIdx].start_date = d || '';
                            setPhases(next);
                          }} />
                          <CustomDatePicker selectedDate={sub.end_date} onChange={d => {
                            const next = [...phases];
                            next[pIdx].subtasks[sIdx].end_date = d || '';
                            setPhases(next);
                          }} />
                          <input 
                            type="number" step="0.5" value={sub.man_hours}
                            onChange={e => {
                              const next = [...phases];
                              next[pIdx].subtasks[sIdx].man_hours = parseFloat(e.target.value) || 0;
                              setPhases(next);
                            }}
                            className="bg-[#0B1437] border border-white/5 rounded-lg py-2 text-xs text-blue-400 font-black text-center outline-none focus:border-blue-500"
                          />
                          <LocalInput 
                            value={sub.assignee}
                            onChange={v => {
                              const next = [...phases];
                              next[pIdx].subtasks[sIdx].assignee = v;
                              setPhases(next);
                            }}
                            placeholder="PIC Name"
                            className="bg-[#0B1437] border border-white/5 rounded-lg py-2 px-3 text-xs text-indigo-100 font-bold outline-none"
                          />
                        </div>

                        {/* LINE 2: Type & Components */}
                        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6">
                           <div className="space-y-1.5">
                             <label className="text-[8px] font-black text-[var(--text-sub)] uppercase tracking-widest ml-1">Project Type</label>
                             <select 
                                value={sub.task_type || 'New Feature'}
                                onChange={e => {
                                  const next = [...phases];
                                  next[pIdx].subtasks[sIdx].task_type = e.target.value;
                                  setPhases(next);
                                }}
                                className="w-full bg-[#0B1437] border border-white/10 text-[10px] text-white font-black uppercase tracking-widest rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500"
                             >
                                <option value="New Feature">New Feature</option>
                                <option value="Improvement">Improvement</option>
                                <option value="Bug Fix">Bug Fix</option>
                             </select>
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-[8px] font-black text-[var(--text-sub)] uppercase tracking-widest ml-1">Infrastructure Components</label>
                             <div className="flex flex-wrap gap-2 p-2 bg-[#0B1437] border border-white/10 rounded-xl min-h-[46px]">
                               {['Web', 'Android', 'API', 'Desktop', 'Database', 'Report', 'Infrastructure', 'Security'].map(c => {
                                 const selected = (sub.components || []).includes(c);
                                 return (
                                   <button 
                                     key={c}
                                     onClick={() => {
                                       const next = [...phases];
                                       const current = sub.components || [];
                                       next[pIdx].subtasks[sIdx].components = selected ? current.filter((x: string) => x !== c) : [...current, c];
                                       setPhases(next);
                                     }}
                                     className={cn(
                                       "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border transition-all",
                                       selected ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                                     )}
                                   >
                                     {c}
                                   </button>
                                 );
                               })}
                             </div>
                           </div>
                        </div>

                        {/* LINE 3: Detail Task */}
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-blue-400 uppercase tracking-widest ml-1">Detail Task Breakdown & Technical Specification</label>
                          <textarea 
                            rows={4}
                            value={sub.detail_task || ''}
                            onChange={e => {
                              const next = [...phases];
                              next[pIdx].subtasks[sIdx].detail_task = e.target.value;
                              setPhases(next);
                            }}
                            className="w-full bg-[#0B1437] border border-white/10 rounded-xl p-4 text-xs text-slate-300 font-medium leading-relaxed outline-none focus:ring-1 focus:ring-blue-500/50 resize-none transition-all"
                            placeholder="Describe technical implementation detail here..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-8 border-t border-[var(--border)] bg-[var(--bg-card)]/50 flex justify-between items-center px-10">
          <p className="text-[10px] text-[var(--text-sub)] font-bold uppercase tracking-[0.2em] flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              {phases.length} Phases Active
            </span>
            <span className="text-blue-400 font-black">Total: {(totalManHours || 0).toFixed(1)} Jam ({formatWorkday(totalManHours)})</span>
            {isAnyOverAllocated && <span className="text-rose-500 font-black animate-bounce">⚠️ Validation Error: Over-Allocation</span>}
          </p>
          <div className="flex gap-4 pointer-events-auto z-50">
            <button 
              onClick={handleAttemptClose} 
              disabled={loading} 
              className="px-8 py-3 bg-[var(--bg-page)] text-[var(--text-sub)] font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[var(--bg-card)] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpdate} 
              disabled={loading || !title || isAnyOverAllocated} 
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 pointer-events-auto"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? "Synchronizing..." : "Update Breakdown"}
            </button>
          </div>
        </div>
      </motion.div>

      <UnsavedChangesModal 
        isOpen={showDeddyModal}
        onClose={() => setShowDeddyModal(false)}
        onDiscard={() => {
          setShowDeddyModal(false);
          setHasUnsavedChanges(false);
          onClose();
        }}
      />
    </div>
  );
}

function UnsavedChangesModal({ 
  isOpen, 
  onClose, 
  onDiscard 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onDiscard: () => void 
}) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xl z-[9999999]"
      style={{ zIndex: 9999999 }}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0d0e14] border border-white/10 rounded-2xl p-8 w-full max-w-[500px] shadow-[0_0_50px_rgba(255,255,255,0.05)] flex flex-col items-center"
      >
        <div className="mb-6 rounded-xl overflow-hidden border border-white/5 bg-black/40">
          <img 
            src="https://drive.google.com/uc?id=16pystT5qflVtlY4w1QxrYsr8Z8Tb8Omk" 
            alt="Warning" 
            className="w-[320px] h-[240px] object-cover opacity-90 transition-opacity hover:opacity-100" 
          />
        </div>
        
        <div className="text-center space-y-3 mb-8 px-4">
          <h3 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center justify-center gap-2">
            <span className="text-red-500 text-2xl">⚠️</span> JANGAN PINDAH DULU!
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed font-medium">
            Data lu belum kesimpen, <span className="text-white font-bold italic">Oke?</span> Kalau pindah sekarang, semua yang lu ketik bakal hilang permanently.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full">
          <button 
            onClick={onClose}
            className="px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all transform active:scale-95 flex-1"
          >
            Balik Ngetik
          </button>
          <button 
            onClick={onDiscard}
            className="px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all transform active:scale-95 flex-1"
          >
            Iya, Buang Aja
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

function BatchManualEntryModal({ onClose, onSuccess, users }: { onClose: () => void, onSuccess: () => void, users: AppUser[] }) {
  const [rows, setRows] = useState([{ id: crypto.randomUUID(), pic_name: '', status: 'WFO', schedule_date: format(new Date(), 'yyyy-MM-dd') }]);
  const [pasteData, setPasteData] = useState('');
  const [loading, setLoading] = useState(false);

  const addRow = () => {
    const lastRow = rows[rows.length - 1];
    setRows([...rows, { 
      id: crypto.randomUUID(),
      pic_name: lastRow?.pic_name || '', 
      status: 'WFO', 
      schedule_date: lastRow?.schedule_date || format(new Date(), 'yyyy-MM-dd') 
    }]);
  };

  const handlePaste = () => {
    if (!pasteData.trim()) return;
    const lines = pasteData.trim().split('\n');
    const newRows = lines.map(line => {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        const pic_name = parts[0].trim();
        const status = (parts[1]?.trim().toUpperCase() || 'WFO');
        let schedule_date = parts[2]?.trim() || format(new Date(), 'yyyy-MM-dd');
        
        // Basic date normalization if it looks like DD/MM/YYYY
        if (schedule_date.includes('/')) {
          const dateParts = schedule_date.split('/');
          if (dateParts.length === 3) {
            const [d, m, y] = dateParts;
            schedule_date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          }
        }
        
        return { id: crypto.randomUUID(), pic_name, status, schedule_date };
      }
      return null;
    }).filter(Boolean) as any[];

    if (newRows.length > 0) {
      setRows([...rows, ...newRows]);
      setPasteData('');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = rows.filter(r => r.pic_name && r.schedule_date);
      if (payload.length === 0) return;
      
      // Chunk processing for safety
      for (let i = 0; i < payload.length; i += 50) {
        await taskService.upsertSchedules(payload.slice(i, i + 50));
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Batch upsert failed:', err);
      alert('Gagal menyimpan data massal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card)]/50 backdrop-blur-md">
          <div>
            <h2 className="text-3xl font-black text-[var(--text-main)] italic tracking-tighter uppercase leading-none">Batch Manual Entry</h2>
            <p className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
              <Copy className="w-3 h-3 text-[var(--accent)]" /> Massive Schedule Update
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-[var(--bg-page)] rounded-2xl text-[var(--text-sub)] transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Paste Area */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest px-1">Paste from Excel (Tab-Separated: Name \t Status \t Date)</label>
            <div className="flex gap-4">
              <textarea 
                value={pasteData}
                onChange={(e) => setPasteData(e.target.value)}
                placeholder="Paste multi-line data here..."
                className="flex-1 bg-[var(--bg-page)]/50 border border-[var(--border)] rounded-2xl p-4 text-xs font-mono text-[var(--text-main)] min-h-[100px] outline-none focus:border-[var(--accent)]/50 transition-all"
              />
              <button 
                onClick={handlePaste}
                className="px-6 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Parse Paste
              </button>
            </div>
          </div>

          {/* Manual Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">Entry Items</h3>
              <button onClick={addRow} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-black uppercase tracking-widest rounded-lg border border-[var(--accent)]/20 transition-all">
                <Plus className="w-3 h-3" /> Tambah Baris
              </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {rows.map((row, idx) => (
                <div key={getSafeKey(row, idx, 'entry-row')} className="grid grid-cols-[1fr_150px_180px_50px] gap-3 items-center bg-[var(--bg-page)]/30 p-2 rounded-xl border border-[var(--border)]">
                  <div className="relative group">
                    <select 
                      value={row.pic_name}
                      onChange={(e) => {
                        const newRows = [...rows];
                        newRows[idx].pic_name = e.target.value;
                        setRows(newRows);
                      }}
                      className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] focus:border-[var(--accent)]/50 outline-none"
                    >
                      <option value="">Select PIC</option>
                      {users.map((u, i) => <option key={getSafeKey(u, i, 'user-opt')} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>
                  <select 
                    value={row.status}
                    onChange={(e) => {
                      const newRows = [...rows];
                      newRows[idx].status = e.target.value;
                      setRows(newRows);
                    }}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] focus:border-[var(--accent)]/50 outline-none font-bold"
                  >
                    <option value="WFO">WFO</option>
                    <option value="WFH">WFH</option>
                    <option value="WFC">WFC</option>
                    <option value="LIBUR">LIBUR</option>
                  </select>
                  <CustomDatePicker 
                    selectedDate={row.schedule_date}
                    onChange={(date) => {
                      const newRows = [...rows];
                      newRows[idx].schedule_date = date || '';
                      setRows(newRows);
                    }}
                  />
                  <button 
                    onClick={() => setRows(rows.filter((_, i) => i !== idx))}
                    className="text-[var(--text-sub)] hover:text-[var(--danger)] p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 bg-[var(--bg-page)] text-[var(--text-sub)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Cancel</button>
          <button 
            onClick={handleSave}
            disabled={loading || rows.length === 0}
            className="px-10 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            {loading ? 'Processing...' : 'Simpan Semua'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- View Components ---

function DashboardStats({ tasks, projects }: { tasks: Task[], projects: Project[] }) {
  const stats = useMemo(() => {
    const safeProjects = projects || [];
    const safeTasks = tasks || [];
    const totalProjects = safeProjects.length;
    
    // Strict Level 1 (Phases) Aggregation
    const totalTasks = safeTasks.filter(t => t.level === 1).length;
    const totalChildTasks = safeTasks.filter(t => t.level === 2).length;
    const totalManHours = safeTasks
      .filter(t => t.level === 1)
      .reduce((sum, t) => sum + (Number(t.man_hours) || 0), 0);
    
    return { totalProjects, totalTasks, totalChildTasks, totalManHours };
  }, [tasks, projects]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Total Project', value: stats.totalProjects, icon: FolderKanban, color: 'emerald' },
        { label: 'Total All Task', value: stats.totalTasks, icon: Layers, color: 'sky' },
        { label: 'Total Breakdown Task', value: stats.totalChildTasks, icon: Activity, color: 'indigo' },
        { label: 'Total All Man Hours Project', value: Number(stats.totalManHours).toFixed(1), icon: Clock, color: 'amber' },
      ].map((stat, i) => (
        <div key={getSafeKey({id: stat.label}, i, 'stat')} className="bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border)] p-5 rounded-2xl relative overflow-hidden group hover:border-[var(--accent)]/30 transition-all shadow-lg">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-[var(--text-main)] italic tracking-tighter transition-colors">{stat.value}</h3>
            </div>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
              stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400" :
              stat.color === 'sky' ? "bg-sky-500/10 text-sky-400" :
              stat.color === 'indigo' ? "bg-indigo-500/10 text-indigo-400" :
              "bg-amber-500/10 text-amber-400"
            )}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          <div className={cn(
            "absolute bottom-0 left-0 h-1 transition-all",
            stat.color === 'emerald' ? "bg-emerald-500/20 group-hover:bg-emerald-500" :
            stat.color === 'sky' ? "bg-sky-500/20 group-hover:bg-sky-500" :
            stat.color === 'indigo' ? "bg-indigo-500/20 group-hover:bg-indigo-500" :
            "bg-amber-500/20 group-hover:bg-amber-500"
          )} style={{ width: '100%' }} />
        </div>
      ))}
    </div>
  );
}

const formatManDays = (totalHours: number) => {
  if (!totalHours) return '0 Days, 0 Hours, 0 Mins';
  const days = Math.floor(totalHours / 9); // 9 hours = 1 day
  const hours = Math.floor(totalHours % 9);
  const mins = Math.round((totalHours % 1) * 60);
  return `${days} Days, ${hours} Hours, ${mins} Mins`;
};

function SlaDetailModal({ isOpen, onClose, type, tasks }: { isOpen: boolean, onClose: () => void, type: string, tasks: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      // First ensure it matches the timeliness state (FASTER/ON_TIME/LATE)
      if (calculateTimeliness(t._normEnd, t._normRealized, t._normStatus).state !== type) return false;

      // Then apply search filter
      const matchesSearch = 
        t._projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t._taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t._normPic || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Then apply status filter
      const matchesStatus = statusFilter === 'ALL' || t._normStatus.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [tasks, type, searchTerm, statusFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md pointer-events-auto"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-7xl h-full max-h-[90vh] rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col pointer-events-auto"
      >
        <div className="p-8 border-b border-[var(--border)] flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-950 px-10">
          <div>
            <h2 className={cn(
              "text-4xl font-black italic tracking-tighter uppercase mb-1",
              type === 'LATE' ? 'text-rose-500' : type === 'FASTER' ? 'text-emerald-500' : 'text-blue-500'
            )}>
              {type} Tasks Detail
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">Drill-down Task Performance & Timeliness Metrics</p>
          </div>
          <button 
            onClick={onClose}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group"
          >
            <X className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* SEARCH & FILTER UI */}
        <div className="flex justify-between items-center bg-gray-900/50 p-6 border-b border-white/5 backdrop-blur-xl">
          <div className="flex gap-4 w-full max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="🔍 Cari Project, Task, atau PIC..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0b0c13] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-sm w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-bold"
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0b0c13] border border-white/10 rounded-xl px-6 py-3 text-white text-[10px] font-black uppercase tracking-widest focus:border-blue-500 outline-none cursor-pointer hover:bg-slate-900 transition-colors appearance-none min-w-[160px]"
            >
              <option value="ALL">All Status</option>
              <option value="TODO">TODO</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
              <option value="LIVE">LIVE</option>
              <option value="CANCEL">CANCEL</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-10 bg-[#0b0c13]">
          <div className="bg-slate-900/30 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-950/80 border-b border-white/10">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic w-[15%]">Project Identity</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white uppercase tracking-widest italic w-[25%]">Task Name</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center w-[15%]">PIC / Leader</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center w-[15%]">Differential</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center w-[10%]">Timeline (Plan)</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white uppercase tracking-widest italic text-center w-[10%]">Realized Date</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white uppercase tracking-widest italic text-right w-[10%]">Task Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((t, i) => {
                  const timeData = calculateTimeliness(t._normEnd, t._normRealized, t._normStatus);
                  return (
                    <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[10px] font-mono text-slate-500 mb-0.5 tracking-tighter italic">Source Project</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter truncate">{t._projectName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight leading-tight break-words">{t._taskName}</span>
                          <span className="text-[9px] font-mono text-indigo-400/40">Task ID Ref: {t.id?.split('-')[0] || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-2xl shadow-inner">
                          <UserIcon className="w-3 h-3 text-indigo-400" />
                          <span className="text-[11px] font-black italic uppercase tracking-tighter text-slate-300">{t._normPic || '-'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <span className={cn(
                           "text-[11px] font-black italic tracking-widest uppercase px-4 py-2 rounded-xl shadow-lg border",
                           timeData.state === 'LATE' ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' : 
                           timeData.state === 'FASTER' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                           'bg-blue-500/20 text-blue-400 border-blue-500/30'
                         )}>
                           {timeData.text}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded italic">{t._normStart ? format(new Date(t._normStart), 'dd MMM yy') : '-'}</span>
                          <ArrowDown className="w-2 h-2 text-slate-700" />
                          <span className="text-[10px] font-mono text-rose-500/80 bg-rose-500/5 px-2 py-0.5 rounded italic font-bold">{t._normEnd ? format(new Date(t._normEnd), 'dd MMM yy') : '-'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="text-[11px] font-black italic text-white uppercase tracking-tighter bg-white/5 py-2 px-4 rounded-2xl border border-white/5">
                          {t._normRealized ? format(new Date(t._normRealized), 'dd MMM yyyy') : '-'}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 shadow-xl">
                          <div className={cn("w-2 h-2 rounded-full animate-pulse", t._normStatus === 'DONE' ? 'bg-emerald-500' : 'bg-amber-500')} />
                          {t._normStatus || 'TODO'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-24 text-center flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                  <Info className="w-10 h-10 text-slate-600" />
                </div>
                <div>
                   <p className="text-slate-200 font-black uppercase tracking-[0.3em] text-sm italic mb-2">No tasks matches this state</p>
                   <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest max-w-sm mx-auto">All systems operational. No records identified in the current filtration parameters.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-10 bg-slate-950 border-t border-white/10 flex justify-between items-center px-12">
           <div className="flex gap-10">
             <div className="flex flex-col">
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Aggregation Results</span>
               <span className="text-3xl font-black text-white italic tracking-tighter drop-shadow-lg">{filtered.length} <span className="text-xs text-slate-500 font-normal uppercase not-italic tracking-widest ml-2">Identified Tasks</span></span>
             </div>
           </div>
           <button 
             onClick={onClose}
             className="px-12 py-4 bg-white text-slate-950 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-2xl shadow-white/10"
           >
             Close Operational View
           </button>
        </div>
      </motion.div>
    </div>
  );
}

function PortfolioDashboard({ 
  user,
  projects, 
  tasks,
  loading,
  onOpenProject,
  onDeleteProject,
  onUpdateProject,
  onCreateRequested,
  onReschedule,
  setEditingProject,
  setIsProjectDetailOpen,
  isMobile
}: { 
  user: any,
  projects: Project[], 
  tasks: Task[],
  loading: boolean,
  onOpenProject: (id: string) => void,
  onDeleteProject: (id: string) => void,
  onUpdateProject: (id: string, updates: Partial<Project>) => void,
  onCreateRequested: () => void,
  onReschedule: (p: Project) => void,
  setEditingProject: (p: Project) => void,
  setIsProjectDetailOpen: (open: boolean) => void,
  isMobile?: boolean
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notif, setNotif] = useState<string | null>(null);
  const [masterProjects, setMasterProjects] = useState<MasterProject[]>([]);
  const [selectedSlaModal, setSelectedSlaModal] = useState<string | null>(null); 
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalStatus, setGlobalStatus] = useState('ALL');
  
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const data = await taskService.getMasterProjects();
        setMasterProjects(data);
      } catch (err) {
        console.error("🔥 Dashboard Sync Error: Failed to fetch master projects", err);
      }
    };
    fetchMasterData();
  }, []);

  const safeProjects = projects || [];

  const mergedProjects = useMemo(() => {
    return safeProjects.map(p => {
      return {
        ...p
      } as Project;
    });
  }, [safeProjects]);

  // Aggressive Task Extraction for SLA aggregation with normalization
  const allTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    // We only care about L2 tasks (breakdowns) for this SLA monitoring
    // Level 1 tasks are phases, Level 2 are actual sub-tasks
    const l2Tasks = tasks.filter(t => t.level === 2);

    return l2Tasks.map(task => {
      // Find parent project for name mapping
      const parentProject = safeProjects.find(p => p.id === task.project_id);

      // FAILSAFE NORMALIZATION: Catch every possible DB key variation
      // @ts-ignore - dynamic keys from various sources
      const safeEnd = task.end_time || (task as any).end_date || (task as any).end || (task as any).endDate || (task as any).planned_end;
      // @ts-ignore
      const safeRealized = task.realized_finish_date || (task as any).realized_date || (task as any).realized_finish || (task as any).realized || (task as any).realizedFinish;
      // @ts-ignore
      const safeStart = task.start_time || (task as any).start_date || (task as any).start || (task as any).startDate;
      // @ts-ignore
      const safePic = (task as any).pic_name || (task as any).pic || task.assignee || parentProject?.pic_name || parentProject?.leader_email || 'Unassigned';

      // Safely parse Project Name (it might be joined from Supabase)
      const projName = (task as any).master_projects?.project_name || (task as any).projectName || parentProject?.project_name || 'Unknown Project';

      return {
        ...task,
        _normEnd: safeEnd,
        _normRealized: safeRealized,
        _normStart: safeStart,
        _normPic: safePic,
        _normStatus: task.status || 'TODO',
        _projectName: projName,
        _taskName: task.title || (task as any).name || (task as any).task_name || 'Unnamed Task'
      };
    }).filter(t => t._normEnd); // Only keep tasks that actually have an end date
  }, [tasks, safeProjects]);

  // Debugger for SLA Data
  useEffect(() => {
    if (allTasks.length > 0) {
      console.log("=== SLA DEBUGGER ===");
      console.log("Total Normalized Tasks:", allTasks.length);
      console.log("Late Count:", allTasks.filter(t => calculateTimeliness(t._normEnd, t._normRealized, t._normStatus).state === 'LATE').length);
      console.log("Sample Task:", allTasks[0]);
    }
  }, [allTasks]);

  // SLA Stats Calculation at Task level
  const slaStats = useMemo(() => {
    const stats = { FASTER: 0, ON_TIME: 0, LATE: 0 };
    allTasks.forEach(t => {
      const timeliness = calculateTimeliness(t._normEnd, t._normRealized, t._normStatus);
      if (timeliness.state === 'FASTER') stats.FASTER++;
      else if (timeliness.state === 'ON_TIME') stats.ON_TIME++;
      else if (timeliness.state === 'LATE') stats.LATE++;
    });
    return stats;
  }, [allTasks]);

  const handleExportProjects = () => {
    // 1. New Clean Date Formatter Utility
    const formatDate = (dateStr: any) => {
      if (!dateStr || dateStr === '-') return '-';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
      } catch (e) {
        return dateStr;
      }
    };

    // 2. Man Days Formatter (9 Hours = 1 Day)
    const formatManDays = (totalHours: number) => {
      if (!totalHours) return '0 Days, 0 Hours, 0 Mins';
      const days = Math.floor(totalHours / 9); 
      const hours = Math.floor(totalHours % 9);
      const mins = Math.round((totalHours % 1) * 60);
      return `${days} Days, ${hours} Hours, ${mins} Mins`;
    };

    const wb = XLSX.utils.book_new();

    safeProjects.forEach(project => {
      let fsdHours = 0, devHours = 0, sitHours = 0;
      const p = project as any;
      const phases = p.tasks || p.breakdowns || p.phases || p.l1_tasks || [];

      // First Pass: Calculate Total Hours from L2 ONLY to prevent double counting
      phases.forEach((phase: any) => {
        const phaseName = (phase.title || phase.name || '').toUpperCase();
        const tasks = phase.tasks || phase.breakdowns || phase.children || phase.l2_tasks || [];
        tasks.forEach((task: any) => {
          const hours = parseFloat(task.man_hours || task.hours) || 0;
          if (phaseName.includes('FSD')) fsdHours += hours;
          else if (phaseName.includes('DEV')) devHours += hours;
          else if (phaseName.includes('SIT')) sitHours += hours;
        });
      });

      const trueTotalHours = fsdHours + devHours + sitHours;

      // 3. Build the ENTIRE Sheet as Array of Arrays (AOA)
      const aoa: any[][] = [
        [`OM DEDY - PROJECT TIMELINE & BREAKDOWN REPORT`], // Row 1 (Index 0)
        [], // Row 2 (Index 1)
        [`Project Name`, project.project_name || '-', ``, `Global Status`, project.status || 'TODO'], // Row 3 (Index 2)
        [`Start Date`, formatDate(project.start_date), ``, `Total Man Hours`, `${trueTotalHours} Hours`], // Row 4 (FORMATTED)
        [`End Date`, formatDate(project.end_date), ``, `PIC`, project.pic_name || (project as any).pic || '-'], // Row 5 (FORMATTED)
        [], // Row 6 (Index 5)
        [`Total Man days FSD:`, formatManDays(fsdHours)], // Row 7 (Index 6)
        [`Total Man days DEV:`, formatManDays(devHours)], // Row 8 (Index 7)
        [`Total Man days SIT:`, formatManDays(sitHours)], // Row 9 (Index 8)
        [], // Row 10 (Index 9)
        [ // Row 11 (Index 10): MAIN TABLE HEADERS (EXACT 13 FIELDS)
          "Project Name", "Phase L1", "Task", "Type Task", "Components", 
          "Detail Breakdown", "Man Hours", "Man Hours (In Minutes)", 
          "Start Date", "End Date", "Status", "Fachrul Feedback", "Barra Feedback"
        ]
      ];

      const merges = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } } // Merge the main title across all 13 columns
      ];

      let currentRow = 11; // Data starts at Row 12 (0-indexed)

      // 4. Second Pass: Build Data Rows & Merge Coordinates
      phases.forEach((phase: any) => {
        const tasks = phase.tasks || phase.breakdowns || phase.children || phase.l2_tasks || [{}];
        const taskCount = tasks.length;
        const startRow = currentRow; // Remember where this phase started

        tasks.forEach((task: any) => {
          const hours = parseFloat(task.man_hours || task.hours) || 0;
          const mins = hours * 60;

          aoa.push([
            project.project_name || '-',
            phase.title || phase.name || '-',
            task.title || task.name || '-',
            task.type_task || task.type || '-',
            task.components || '-',
            task.detail_breakdown || task.detail || '-',
            hours ? `${hours} h` : '-',
            mins ? `${mins} m` : '-',
            formatDate(task.start_time || task.start_date), // Row Data Start Date (FORMATTED)
            formatDate(task.end_time || task.end_date),   // Row Data End Date (FORMATTED)
            task.status || 'TODO',
            (task as any).fachrul_feedback || '-',
            (task as any).barra_feedback || '-'
          ]);
          currentRow++;
        });

        // Add Merge Coordinates for L1 and Project Name
        if (taskCount > 1) {
          // Note: s = start, e = end, r = row, c = col (0-indexed)
          merges.push({ s: { r: startRow, c: 1 }, e: { r: startRow + taskCount - 1, c: 1 } }); // Phase L1 (Col B)
          merges.push({ s: { r: startRow, c: 0 }, e: { r: startRow + taskCount - 1, c: 0 } }); // Project Name (Col A)
        }
      });

      // 5. Generate Worksheet from AOA
      const ws = XLSX.utils.aoa_to_sheet(aoa);

      // 6. Apply Merges & Strict Column Widths
      ws['!merges'] = merges;
      ws['!cols'] = [
        { wch: 25 }, // A: Project Name
        { wch: 15 }, // B: Phase L1
        { wch: 45 }, // C: Task
        { wch: 15 }, // D: Type Task
        { wch: 25 }, // E: Components
        { wch: 65 }, // F: Detail Breakdown
        { wch: 12 }, // G: Man Hours
        { wch: 22 }, // H: Man Hours (Mins)
        { wch: 15 }, // I: Start Date
        { wch: 15 }, // J: End Date
        { wch: 15 }, // K: Status
        { wch: 35 }, // L: Fachrul Feedback
        { wch: 35 }  // M: Barra Feedback
      ];

      // Define Reuseable Borders
      const borderDef = {
        top: { style: "thin" as const, color: { rgb: "D9D9D9" } },
        bottom: { style: "thin" as const, color: { rgb: "D9D9D9" } },
        left: { style: "thin" as const, color: { rgb: "D9D9D9" } },
        right: { style: "thin" as const, color: { rgb: "D9D9D9" } }
      };

      // 7. Inject Styles
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
          if (!ws[cellRef]) continue;
          //@ts-ignore
          if (R === 0) { // Main Title
            ws[cellRef].s = {
              fill: { fgColor: { rgb: "1F4E78" } },
              font: { name: "Arial", sz: 14, bold: true, color: { rgb: "FFFFFF" } },
              alignment: { horizontal: "center", vertical: "center" }
            };
          } else if ((R >= 2 && R <= 4) || (R >= 6 && R <= 8)) { // Metadata
            ws[cellRef].s = {
              font: { name: "Arial", sz: 10, bold: C === 0 || C === 3 || C === 6 },
              alignment: { vertical: "center" },
              border: (R === 4 || R === 8) ? { bottom: { style: "thin", color: { rgb: "D9D9D9" } } } : undefined
            };
          } else if (R === 10) { // Table Headers
            ws[cellRef].s = {
              fill: { fgColor: { rgb: "2F5597" } },
              font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
              alignment: { horizontal: "center", vertical: "center", wrapText: true },
              border: borderDef
            };
          } else if (R >= 11) { // Data Rows
            if (C === 1 || C === 0) {
              ws[cellRef].s = {
                fill: C === 1 ? { fgColor: { rgb: "F2F2F5" } } : undefined,
                font: { name: "Arial", sz: 10, bold: C === 1 },
                alignment: { horizontal: "center", vertical: "center", wrapText: true },
                border: borderDef
              };
            } else if (C === 8 || C === 9 || C === 10) {
              ws[cellRef].s = {
                font: { name: "Arial", sz: 10 },
                alignment: { horizontal: "center", vertical: "top", wrapText: true },
                border: borderDef
              };
            } else {
              ws[cellRef].s = {
                font: { name: "Arial", sz: 10 },
                alignment: { vertical: "top", wrapText: true },
                border: borderDef
              };
            }
          }
        }
      }

      // 8. Save
      const sheetName = (project.project_name || 'Project').substring(0, 31).replace(/[\[\]\?\*\\\/]/g, '');
      XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Project');
    });

    XLSX.writeFile(wb, `OM_DEDY_Timeline_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <SuccessNotification show={!!notif} message={notif || ''} onClose={() => setNotif(null)} />
      
      <div className="flex items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase transition-colors">Om Dedy Portfolio</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Global Project Tracking System</p>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <button 
              onClick={handleExportProjects}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" /> Export to Excel
            </button>
          )}
          {user && (
            <button 
              onClick={onCreateRequested}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          )}
        </div>
      </div>
      
      {!loading && <DashboardStats tasks={tasks} projects={projects} />}
      
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-8">
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => setSelectedSlaModal('FASTER')} 
            className="cursor-pointer bg-[#0b0c13] border border-emerald-500/50 p-6 rounded-[2rem] hover:bg-emerald-500/5 transition-all group overflow-hidden relative shadow-2xl flex justify-between items-center"
          >
            <div className="absolute -top-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
               <Rocket className="w-24 h-24 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-emerald-400 font-black text-xs tracking-[0.2em] uppercase mb-1 drop-shadow-sm">Faster Tasks</h3>
              <p className="text-5xl font-black text-white italic tracking-tighter drop-shadow-lg">
                {slaStats.FASTER}
              </p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
              <span className="text-emerald-500 text-2xl drop-shadow-lg">⚡</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => setSelectedSlaModal('ON_TIME')} 
            className="cursor-pointer bg-[#0b0c13] border border-blue-500/50 p-6 rounded-[2rem] hover:bg-blue-500/5 transition-all group overflow-hidden relative shadow-2xl flex justify-between items-center"
          >
            <div className="absolute -top-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
               <Zap className="w-24 h-24 text-blue-500" />
            </div>
            <div>
              <h3 className="text-blue-400 font-black text-xs tracking-[0.2em] uppercase mb-1 drop-shadow-sm">On Time Tasks</h3>
              <p className="text-5xl font-black text-white italic tracking-tighter drop-shadow-lg">
                {slaStats.ON_TIME}
              </p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
              <span className="text-blue-500 text-2xl drop-shadow-lg">✅</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => setSelectedSlaModal('LATE')} 
            className="cursor-pointer bg-[#0b0c13] border border-rose-500/50 p-6 rounded-[2rem] hover:bg-rose-500/5 transition-all group overflow-hidden relative shadow-2xl flex justify-between items-center"
          >
            <div className="absolute -top-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
               <AlertTriangle className="w-24 h-24 text-rose-500" />
            </div>
            <div>
              <h3 className="text-rose-500 font-black text-xs tracking-[0.2em] uppercase mb-1 drop-shadow-sm">Late Tasks</h3>
              <p className="text-5xl font-black text-white italic tracking-tighter drop-shadow-lg">
                {slaStats.LATE}
              </p>
            </div>
            <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 shadow-inner group-hover:scale-110 transition-transform">
              <span className="text-rose-500 text-2xl drop-shadow-lg">⚠️</span>
            </div>
          </motion.div>
        </div>
      )}

      {selectedSlaModal && (
        <SlaDetailModal 
          isOpen={!!selectedSlaModal} 
          onClose={() => setSelectedSlaModal(null)} 
          type={selectedSlaModal} 
          tasks={allTasks} 
        />
      )}
      
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 bg-white/50 dark:bg-slate-900/20 rounded-3xl border border-slate-200 dark:border-slate-800/50 shadow-sm transition-colors">
           <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Retrieving Portfolio Data</p>
        </div>
      ) : (
        <>
          <ConfirmModal 
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={() => {
              if (deleteId) {
                onDeleteProject(deleteId);
                setNotif('Project successfully decommissioned');
              }
            }}
            title="Archive Project?"
            description="Are you sure you want to remove this project? All associated tasks and audit trails will be archived."
          />

          {/* GLOBAL SEARCH & FILTER BAR */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 mt-8 bg-[#0b0c13] p-4 rounded-xl border border-gray-800 shadow-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="🔍 Cari Nama Project atau PIC..." 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold"
              />
            </div>
            <div className="w-full md:w-64">
              <select 
                value={globalStatus} 
                onChange={(e) => setGlobalStatus(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 outline-none cursor-pointer font-black uppercase tracking-widest appearance-none"
              >
                <option value="ALL">Semua Status Project</option>
                <option value="TODO">TODO</option>
                <option value="ON QUEUE">ON QUEUE</option>
                <option value="FSD ON PROGRESS">FSD ON PROGRESS</option>
                <option value="DEV ON PROGRESS">DEV ON PROGRESS</option>
                <option value="UAT">UAT</option>
                <option value="LIVE">LIVE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const uniqueProjects = Array.from(new Map(mergedProjects.filter(p => !!p).map(p => [p.id, p])).values());
              const filteredProjects = uniqueProjects.filter(project => {
                // 1. Status Filter
                if (globalStatus !== 'ALL' && (project.status || '').toUpperCase() !== globalStatus) return false;

                // 2. Search Filter (By Project Name or PIC)
                if (globalSearch) {
                  const searchLower = globalSearch.toLowerCase();
                  const matchName = (project.project_name || '').toLowerCase().includes(searchLower);
                  const matchPic = (project.pic_name || '').toLowerCase().includes(searchLower) || (project.leader_email || '').toLowerCase().includes(searchLower);
                  return matchName || matchPic;
                }

                return true;
              });

              if (filteredProjects.length === 0) {
                return (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 px-8 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl text-center space-y-4 transition-colors">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center">
                      <FolderKanban className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-slate-900 dark:text-white font-bold tracking-tight">No Projects Found</h3>
                      <p className="text-slate-500 dark:text-slate-500 text-xs uppercase tracking-widest font-black">Portfolio is currently empty</p>
                    </div>
                  </div>
                );
              }
              return filteredProjects.map((p, i) => {
                const combinedKey = getSafeKey(p, i, 'portfolio-project');
                return (
                  <motion.div
                    key={combinedKey}
                    whileHover={{ y: -8 }}
                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 cursor-pointer hover:border-[var(--primary)]/50 transition-all group relative overflow-hidden shadow-[var(--shadow-float)]"
                  >
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {user && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onReschedule(p);
                    }}
                    className="p-2 bg-[var(--bg-card)] hover:bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--primary)] rounded-lg transition-colors border border-[var(--border-color)] hover:border-[var(--primary)]/50"
                    title="Reschedule Project"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                )}
                {user && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProject(p);
                      setIsProjectDetailOpen(true);
                    }}
                    className="p-2 bg-white hover:bg-slate-50 text-[var(--text-sub)] hover:text-[var(--primary)] rounded-lg transition-colors border border-[var(--border-subtle)] hover:border-slate-300"
                    title="Edit Project Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                {user && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(p.id);
                    }}
                    className="p-2 bg-white hover:bg-rose-50 text-[var(--text-sub)] hover:text-rose-500 rounded-lg transition-colors border border-[var(--border-subtle)] hover:border-rose-200"
                    title="Archive Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

                  <div onClick={() => onOpenProject(p.id)}>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-[var(--bg-main)] rounded-xl flex items-center justify-center group-hover:bg-[var(--primary)]/10 transition-all">
                    <FolderKanban className="w-6 h-6 text-[var(--text-sub)] group-hover:text-[var(--primary)] transition-colors" />
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <ProjectStatusSelector status={p.status} onUpdate={(v) => onUpdateProject(p.id, { status: v })} disabled={!user} />
                  </div>
                </div>
                <input 
                  defaultValue={p.project_name || ''}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={(e) => {
                    if (e.target.value !== p.project_name) {
                      onUpdateProject(p.id, { project_name: e.target.value });
                      setNotif('Project title synchronized');
                    }
                  }}
                  className="text-lg font-bold text-[var(--text-main)] mb-2 bg-transparent border-none outline-none focus:text-[var(--primary)] w-full transition-colors"
                  placeholder="Untitled Project"
                  disabled={!user}
                />
                
                <div className="flex flex-col gap-1.5 mb-2">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                    <UserIcon className="w-3 h-3 text-[var(--primary)]" />
                    <span>PIC: <span className="text-[var(--text-primary)] transition-colors font-bold uppercase">{p.pic_name || p.leader_email || 'Unassigned'}</span></span>
                  </div>
                  {(p.owner_name || p.div_owner) && (
                    <div className="flex items-center gap-2 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                      <ShieldCheck className="w-3 h-3 text-[var(--secondary)]" />
                      <span>OWNER: <span className="text-[var(--text-primary)] transition-colors font-bold uppercase">{p.owner_name || '-'} ({p.div_owner || '-'})</span></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                    <Clock className="w-3 h-3 text-[var(--primary)]" />
                    <span>MAN HOURS: <span className="text-[var(--text-primary)] transition-colors font-bold">
                      {tasks
                        .filter(t => t.project_id === p.id && t.level === 1)
                        .reduce((sum, t) => sum + (Number(t.man_hours) || 0), 0)
                        .toFixed(1)}
                    </span></span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-[var(--text-sub)] uppercase tracking-widest">
                    <Calendar className="w-3 h-3 text-[var(--primary)]" />
                    <span>Timeline: <span className="text-[var(--text-main)] font-mono tracking-tighter transition-colors font-bold">
                      {p.start_date ? format(new Date(p.start_date), 'MMM dd') : 'Belum Set'} - {p.end_date ? format(new Date(p.end_date), 'MMM dd, yyyy') : 'Belum Set'}
                    </span></span>
                  </div>
                </div>

                {/* Add this inside the card body, below the MAN HOURS / TIMELINE section */}
                <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                  <div className="flex items-start gap-2 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-[var(--primary)] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[var(--text-secondary)] font-semibold uppercase text-[9px]">Project Diajukan</span>
                      <span className="text-[var(--text-primary)] line-clamp-2 italic" title={p.project_diajukan || "Belum ada informasi"}>
                        {p.project_diajukan || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mt-4 pt-4 border-t border-[var(--border-color)] group-hover:text-[var(--primary)] transition-colors">
                  <span>View Full Timeline</span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 text-[var(--primary)]" />
                </div>
              </div>
            </motion.div>
                  );
                });
              })()}
        
        {user && (
          <button 
            onClick={onCreateRequested}
          className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/50 transition-all gap-3 bg-slate-50 dark:bg-slate-900/10 group shadow-sm hover:shadow-md dark:shadow-none"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-gradient-to-br group-hover:from-indigo-600 group-hover:to-violet-600 flex items-center justify-center transition-all group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            <Plus className="w-8 h-8 group-hover:rotate-90 group-hover:text-white transition-all text-slate-400 dark:text-slate-500" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Create New Project</span>
        </button>
        )}
      </div>
    </>
  )}
</div>
  );
}

const SCHEDULE_STATUS_COLORS: Record<string, string> = {
  'WFO': 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/20 dark:bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-500/20 shadow-sm',
  'WFH': 'text-blue-700 dark:text-blue-400 bg-blue-500/20 dark:bg-blue-500/10 border-blue-500/30 dark:border-blue-500/20 shadow-sm',
  'WFC': 'text-amber-700 dark:text-amber-400 bg-amber-500/20 dark:bg-amber-500/10 border-amber-500/30 dark:border-amber-500/20 shadow-sm',
  'A2': 'text-indigo-700 dark:text-indigo-400 bg-indigo-500/20 dark:bg-indigo-500/10 border-indigo-500/30 dark:border-indigo-500/20 shadow-sm',
  'LIBUR': 'text-rose-700 dark:text-rose-400 bg-rose-500/20 dark:bg-rose-500/10 border-rose-500/30 dark:border-rose-500/20 shadow-sm',
  'LATE': 'text-rose-700 dark:text-rose-400 bg-rose-500/20 dark:bg-rose-500/10 border-rose-500/30 dark:border-rose-500/20 shadow-sm',
};

function OmDedySchedule({ user, users, setActiveView, isAdmin, isSuperadmin, setOwnershipModal, onNotif, isMobile }: { 
  user: any, 
  users: AppUser[], 
  setActiveView: (view: AppView) => void,
  isAdmin: boolean,
  isSuperadmin: boolean,
  setOwnershipModal: React.Dispatch<React.SetStateAction<any>>,
  onNotif?: (msg: string | null) => void,
  isMobile?: boolean
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingCell, setEditingCell] = useState<{ pic: string, date: string } | null>(null);
  const [rescheduleRequests, setRescheduleRequests] = useState<any[]>([]);
  const [showRescheduleRequests, setShowRescheduleRequests] = useState(false);
  const [requestModal, setRequestModal] = useState<{ 
    pic: string, 
    date: string, 
    currentStatus: string, 
    newStatus: string,
    isSwap?: boolean,
    swapDate?: string,
    swapStatus?: string,
    swapCurrentStatus?: string
  } | null>(null);
  const [selectedPIC, setSelectedPIC] = useState<string | null>(null);

  const currentUserProfile = useMemo(() => {
    return users.find(u => u.email?.toLowerCase() === user?.email?.toLowerCase());
  }, [users, user]);

  const userAccess = (currentUserProfile?.access_level || '').toLowerCase().trim();
  const fullName = currentUserProfile?.name || '';

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const stats = useMemo(() => {
    const counts = { WFO: 0, WFH: 0, CUTI_LIBUR: 0, WFC: 0 };
    schedules.forEach(s => {
      // Only count if it's in the current month's days
      const dateKey = s.schedule_date; // already YYYY-MM-DD
      const date = new Date(dateKey);
      if (date >= monthStart && date <= monthEnd) {
        const st = (s.status || '').toUpperCase();
        if (st === 'WFO') counts.WFO++;
        else if (st === 'WFH') counts.WFH++;
        else if (st === 'WFC' || st === 'A2') counts.WFC++;
        else if (st === 'CUTI' || st === 'LIBUR') counts.CUTI_LIBUR++;
      }
    });
    return counts;
  }, [schedules, monthStart, monthEnd]);

  const picStats = useMemo(() => {
    const statsMap: Record<string, { WFO: number, WFH: number, TOTAL: number }> = {};
    const list = Array.from(new Set(schedules.map(s => s.pic_name))).sort();
    
    list.forEach(p => statsMap[p] = { WFO: 0, WFH: 0, TOTAL: 0 });
    
    schedules.forEach(s => {
      const d = new Date(s.schedule_date);
      if (d >= monthStart && d <= monthEnd && statsMap[s.pic_name]) {
        const st = (s.status || '').toUpperCase();
        if (st === 'WFO') statsMap[s.pic_name].WFO++;
        else if (st === 'WFH') statsMap[s.pic_name].WFH++;
        statsMap[s.pic_name].TOTAL = statsMap[s.pic_name].WFO + statsMap[s.pic_name].WFH;
      }
    });
    return statsMap;
  }, [schedules, monthStart, monthEnd]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await taskService.getSchedules(currentMonth);
      setSchedules(data);
      if (user?.access_level && user.access_level !== 'PIC') {
        const reqs = await taskService.getRescheduleRequests();
        setRescheduleRequests(reqs);
      }
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    
    // Subscribe to schedule changes
    const scheduleChannel = supabase.channel('schedules-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, () => {
        fetchSchedules();
      })
      .subscribe();

    const requestChannel = supabase.channel('requests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reschedule_requests' }, () => {
        fetchSchedules();
      })
      .subscribe();
      
    return () => { 
      supabase.removeChannel(scheduleChannel); 
      supabase.removeChannel(requestChannel);
    };
  }, [currentMonth]);

  const pics = useMemo(() => {
    // Collect all unique PICs from schedules
    const list = Array.from(new Set(schedules.map(s => s.pic_name))).sort();
    return list;
  }, [schedules]);

  const scheduleGrid = useMemo(() => {
    const grid: Record<string, Record<string, string>> = {};
    schedules.forEach(s => {
      const dateKey = format(new Date(s.schedule_date), 'yyyy-MM-dd');
      if (!grid[s.pic_name]) grid[s.pic_name] = {};
      grid[s.pic_name][dateKey] = s.status.toUpperCase();
    });
    return grid;
  }, [schedules]);

  if (isMobile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 border border-slate-800 rounded-lg text-slate-500 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black text-white uppercase italic tracking-tighter">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 border border-slate-800 rounded-lg text-slate-500 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex bg-slate-900 rounded-lg border border-slate-800 p-1">
             <div className="px-2 py-1 flex items-center gap-1">
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
               <span className="text-[8px] font-black text-slate-400 uppercase">{stats.WFO} WFO</span>
             </div>
             <div className="px-2 py-1 flex items-center gap-1 border-l border-slate-800">
               <div className="w-2 h-2 rounded-full bg-indigo-500" />
               <span className="text-[8px] font-black text-slate-400 uppercase">{stats.WFH} WFH</span>
             </div>
          </div>
        </div>

        {selectedPIC ? (
          <div className="space-y-4">
            <button 
              onClick={() => setSelectedPIC(null)}
              className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Team List
            </button>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-indigo-500/30 flex items-center justify-center">
                    <span className="text-xl font-black text-indigo-400 uppercase">{selectedPIC.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">{selectedPIC}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Team Availability Calendar</p>
                  </div>
               </div>

               <div className="grid grid-cols-7 gap-1">
                 {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                   <div key={`day-header-${i}`} className="text-[10px] font-black text-slate-600 text-center py-2">{d}</div>
                 ))}
                 {days.map((day, i) => {
                   const dateKey = format(day, 'yyyy-MM-dd');
                   const st = scheduleGrid[selectedPIC]?.[dateKey] || '';
                   const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;
                   
                   return (
                     <div 
                       key={`calendar-day-${i}`}
                       className={cn(
                         "aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all border",
                         st === 'WFO' ? "bg-emerald-500 text-white border-emerald-400" :
                         st === 'WFH' ? "bg-indigo-500 text-white border-indigo-400" :
                         "bg-slate-950/50 border-white/5",
                         isToday && "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900"
                       )}
                     >
                       <span className={cn(
                         "text-[10px] font-bold",
                         (st === 'WFO' || st === 'WFH') ? "text-white" : isToday ? "text-indigo-400" : "text-slate-500"
                       )}>
                         {format(day, 'd')}
                       </span>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pics.map((pic, i) => {
              const picStat = picStats[pic] || { WFO: 0, WFH: 0, TOTAL: 0 };
              return (
                <motion.div
                  key={`mobile-pic-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-indigo-500/30 flex items-center justify-center">
                      <span className="text-xl font-black text-indigo-400 uppercase">{pic.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white px-0 m-0">{pic}</h3>
                      <div className="flex items-center gap-3 mt-1">
                         <div className="flex items-center gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                           <span className="text-[9px] font-black text-slate-500 uppercase">{picStat.WFO} WFO</span>
                         </div>
                         <div className="flex items-center gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                           <span className="text-[9px] font-black text-slate-500 uppercase">{picStat.WFH} WFH</span>
                         </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPIC(pic)}
                    className="h-10 w-10 flex items-center justify-center bg-slate-800 rounded-xl text-slate-400 hover:text-white"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const rawJsonAoA: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const jsonData: any[] = XLSX.utils.sheet_to_json(ws);

        let upsertPayload: Partial<Schedule>[] = [];

        // 1. Detect if it's a FLAT format (name, status, date)
        const firstRow = jsonData[0] || {};
        const keys = Object.keys(firstRow).map(k => k.toLowerCase());
        const flatMapping = {
          name: Object.keys(firstRow).find(k => ['name', 'pic'].includes(k.toLowerCase()) || k.toLowerCase().includes('nama')),
          status: Object.keys(firstRow).find(k => k.toLowerCase() === 'status'),
          date: Object.keys(firstRow).find(k => k.toLowerCase() === 'date' || k.toLowerCase() === 'tanggal')
        };

        if (flatMapping.name && flatMapping.status && flatMapping.date) {
           console.log('Flat Format Detected');
           upsertPayload = jsonData.map(row => {
             const pic_name = String(row[flatMapping.name!] || '').trim();
             const status = String(row[flatMapping.status!] || '').trim().toUpperCase();
             let schedule_date = '';
             
             const rawDate = row[flatMapping.date!];
             if (typeof rawDate === 'number') {
               const d = XLSX.SSF.parse_date_code(rawDate);
               schedule_date = format(new Date(d.y, d.m - 1, d.d), 'yyyy-MM-dd');
             } else {
               const d = new Date(rawDate);
               if (!isNaN(d.getTime())) schedule_date = format(d, 'yyyy-MM-dd');
             }
             
             return { pic_name, status, schedule_date };
           }).filter(r => r.pic_name && r.status && r.schedule_date);

        } else {
          // 2. MATRIX HEURISTIC (existing robust logic)
          console.log('Matrix Format Fallback');
          let headerRowIndex = -1;
          let nameColumnIndex = -1;
          let dateHeaders: any[] = [];

          for (let i = 0; i < Math.min(rawJsonAoA.length, 100); i++) {
            const row = rawJsonAoA[i];
            if (!row || !Array.isArray(row)) continue;
            
            const picIdx = row.findIndex(c => {
              const s = String(c || '').toLowerCase().trim();
              return s.includes('nama') || s.includes('pic') || s === 'name' || s === 'karyawan';
            });
            
            if (picIdx !== -1) {
              headerRowIndex = i;
              nameColumnIndex = picIdx;
              dateHeaders = row.slice(nameColumnIndex + 1);
              break;
            }
          }

          if (headerRowIndex !== -1) {
            const normalizeDate = (raw: any): string | null => {
              if (!raw) return null;
              const str = String(raw).trim().toLowerCase();
              if (!isNaN(Number(str)) && Number(str) > 10000) {
                const d = XLSX.SSF.parse_date_code(Number(str));
                return format(new Date(d.y, d.m - 1, d.d), 'yyyy-MM-dd');
              }
              const monthMap: Record<string, string> = { 
                'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'mei': '05', 
                'jun': '06', 'jul': '07', 'aug': '08', 'agu': '08', 'ags': '08', 'sep': '09', 
                'oct': '10', 'okt': '10', 'nov': '11', 'dec': '12', 'des': '12' 
              };
              const match = str.match(/(\d{1,2})[\s\-\/]([a-z]{3}|\d{1,2})/);
              if (match) {
                const day = match[1].padStart(2, '0');
                const monthPart = match[2];
                let m = /^\d+$/.test(monthPart) ? monthPart.padStart(2, '0') : (monthMap[monthPart.substring(0, 3)] || '');
                if (m && day) return `${new Date().getFullYear()}-${m}-${day}`;
              }
              try {
                const d = new Date(str);
                if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
              } catch (e) {}
              return null;
            };

            const parsedDates = dateHeaders.map(d => normalizeDate(d));
            const dataRows = rawJsonAoA.slice(headerRowIndex + 1);

            dataRows.forEach(row => {
              const picName = String(row[nameColumnIndex] || '').trim();
              if (!picName || picName.length < 2 || /^\d+$/.test(picName)) return;

              parsedDates.forEach((scheduleDate, dateIdx) => {
                if (!scheduleDate) return;
                const rawValue = String(row[nameColumnIndex + 1 + dateIdx] || '').trim().toUpperCase();
                let status = 'WFH';
                if (rawValue === 'WFO') status = 'WFO';
                else if (['LIBUR', 'OFF', 'CUTI'].includes(rawValue)) status = 'LIBUR';
                else if (['WFC', 'A2'].includes(rawValue)) status = 'WFC';
                else if (rawValue === 'WFH') status = 'WFH';
                
                upsertPayload.push({ pic_name: picName, status, schedule_date: scheduleDate });
              });
            });
          }
        }

        if (upsertPayload.length > 0) {
          const chunkSize = 100;
          for (let i = 0; i < upsertPayload.length; i += chunkSize) {
            await taskService.upsertSchedules(upsertPayload.slice(i, i + chunkSize));
          }
          alert(`Berhasil mengimpor ${upsertPayload.length} data jadwal.`);
          fetchSchedules();
        } else {
          alert('Format data tidak dikenali (Gunakan CSV Flat atau Matrix)');
        }
      } catch (err) {
        console.error('Import Error:', err);
        alert(err instanceof Error ? err.message : 'Gagal mengimpor file.');
      } finally {
        setIsImporting(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleStatusUpdate = async (pic: string, date: string, status: string) => {
    if (!user) return; // RBAC: Public users cannot edit

    const currentStatus = scheduleGrid[pic]?.[date] || '';
    
    // Admin/Superadmin can update directly without approval
    if (isAdmin || isSuperadmin) {
       try {
         await taskService.upsertSchedules([{ pic_name: pic, schedule_date: date, status: status }]);
         fetchSchedules();
         onNotif?.("Jadwal updated!");
       } catch (err) {
         console.error("Failed to update schedule:", err);
       }
    } else {
      // Regular PICs (including owners) must go through the Approval Gate
      setRequestModal({ pic, date, currentStatus, newStatus: status });
    }
    setEditingCell(null);
  };

  const handleDownloadTemplate = () => {
    const data = [
      ["Name", "02 Jan 2026", "03 Jan 2026", "04 Jan 2026", "05 Jan 2026"],
      ["Fachrul Wisnu Novianto", "WFO", "WFH", "LIBUR", ""]
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Matrix");
    XLSX.writeFile(wb, "Template_Schedule_Sakti_Matrix.xlsx");
  };

  const handleExport = () => {
    // Generate grid for Excel
    const header = ['PIC', ...days.map(d => format(d, 'dd/MM/yyyy'))];
    const dataRows = pics.map(pic => [
      pic,
      ...days.map(d => scheduleGrid[pic]?.[format(d, 'yyyy-MM-dd')] || '-')
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedule");
    XLSX.writeFile(wb, `OMDEDY_Schedule_${format(currentMonth, 'MMM_yyyy')}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
            <Calendar className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter italic uppercase">Om Dedy Schedule</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] leading-none mt-1">Resource Capacity Monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
           <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 transition-all hover:text-white">
             <ChevronLeft className="w-5 h-5" />
           </button>
           <div className="px-6 py-1 border-x border-slate-800">
             <span className="text-lg font-black text-white italic tracking-widest uppercase">{format(currentMonth, 'MMMM yyyy')}</span>
           </div>
           <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 transition-all hover:text-white">
             <ChevronRight className="w-5 h-5" />
           </button>
        </div>

        <div className="flex items-center gap-3">
          {user && (user.access_level === 'Superadmin' || user.access_level === 'Admin') && (
            <>
              <button 
                onClick={() => setShowBatchModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-slate-700"
              >
                <Plus className="w-4 h-4" />
                Input Massal
              </button>
              <button 
                onClick={() => setActiveView('RESCHEDULE')}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-amber-500/20 relative"
              >
                <History className="w-4 h-4" />
                Reschedule
                {rescheduleRequests.filter(r => r.status === 'Pending').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] rounded-full flex items-center justify-center animate-bounce shadow-lg ring-2 ring-slate-950">
                    {rescheduleRequests.filter(r => r.status === 'Pending').length}
                  </span>
                )}
              </button>
            </>
          )}
          {user && (
            <label className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-indigo-500/20 transition-all active:scale-95 group">
              <Upload className="w-4 h-4 group-hover:bounce" />
              {isImporting ? 'Parsing...' : 'Smart Import'}
              <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} disabled={isImporting} />
            </label>
          )}
          {user && (
            <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-black/20 hover:bg-black/30 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-white/5">
              <Download className="w-4 h-4" />
              Export Grid
            </button>
          )}
          {user && (
            <button 
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl"
            >
              <History className="w-4 h-4" />
              Template Excel
            </button>
          )}
        </div>

        {showBatchModal && (
          <BatchManualEntryModal 
            users={users} 
            onClose={() => setShowBatchModal(false)} 
            onSuccess={() => {
              fetchSchedules();
            }} 
          />
        )}
      </div>

      {/* Monthly Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-5 flex items-center gap-4 group hover:bg-[var(--bg-page)] transition-all shadow-sm">
          <div className="w-12 h-12 bg-[var(--success)]/10 rounded-2xl flex items-center justify-center border border-[var(--success)]/20 shadow-lg shadow-[var(--success)]/5">
            <Rocket className="w-6 h-6 text-[var(--success)]" />
          </div>
          <div>
            <p className="text-[9px] font-black text-[var(--text-sub)] uppercase tracking-[0.2em] mb-1">Total WFO</p>
            <h4 className="text-2xl font-black text-[var(--text-main)] italic">{stats.WFO}</h4>
          </div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-5 flex items-center gap-4 group hover:bg-[var(--bg-page)] transition-all shadow-sm">
          <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center border border-[var(--accent)]/20 shadow-lg shadow-[var(--accent)]/5">
            <Activity className="w-6 h-6 text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-[9px] font-black text-[var(--text-sub)] uppercase tracking-[0.2em] mb-1">Total WFH</p>
            <h4 className="text-2xl font-black text-[var(--text-main)] italic">{stats.WFH}</h4>
          </div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-5 flex items-center gap-4 group hover:bg-rose-500/5 transition-all shadow-sm">
          <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-500/5">
            <Filter className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="text-[9px] font-black text-[var(--text-sub)] uppercase tracking-[0.2em] mb-1">Absence/Libur</p>
            <h4 className="text-2xl font-black text-[var(--text-main)] italic">{stats.CUTI_LIBUR}</h4>
          </div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-5 flex items-center gap-4 group hover:bg-amber-500/5 transition-all shadow-sm">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
            <LayoutGrid className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-[9px] font-black text-[var(--text-sub)] uppercase tracking-[0.2em] mb-1">Outstation/WFC</p>
            <h4 className="text-2xl font-black text-[var(--text-main)] italic">{stats.WFC}</h4>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden flex flex-col backdrop-blur-xl shadow-2xl">
        <div className="overflow-auto relative min-h-[500px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--bg-card)] border-b border-[var(--border)] sticky top-0 z-40 backdrop-blur-md">
                <th className="sticky left-0 z-50 bg-[var(--bg-card)] px-8 py-5 border-r border-[var(--border)] min-w-[240px] text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                    <span className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-[0.3em]">PIC RESOURCE</span>
                  </div>
                </th>
                {days.map((d, di) => (
                  <th key={getSafeKey({id: d.toISOString()}, di, 'omdedy-header')} className={cn(
                    "px-4 py-5 border-r border-[var(--border)]/10 min-w-[70px] transition-all",
                    isToday(d) ? "bg-[var(--accent)]/10 ring-1 ring-inset ring-[var(--accent)]/30" : "hover:bg-[var(--accent)]/5"
                  )}>
                    <div className="flex flex-col gap-1 items-center relative group/header">
                       <span className={cn(
                         "text-xl font-black italic tracking-tighter",
                         isToday(d) ? "text-[var(--accent)]" : (HOLIDAYS_2026[format(d, 'yyyy-MM-dd')] ? "text-rose-500" : (isWeekend(d) ? "text-rose-500/80" : "text-[var(--text-main)]"))
                       )}>
                         {format(d, 'dd')}
                       </span>
                       <span className={cn(
                         "text-[8px] font-black text-[var(--text-sub)] uppercase tracking-widest",
                         CUTI_BERSAMA_2026[format(d, 'yyyy-MM-dd')] && "text-amber-500"
                       )}>
                         {format(d, 'EEE')}
                       </span>
                       
                       {(HOLIDAYS_2026[format(d, 'yyyy-MM-dd')] || CUTI_BERSAMA_2026[format(d, 'yyyy-MM-dd')]) && (
                         <div className="absolute top-full mt-2 hidden group-hover/header:block z-[100] bg-slate-800 border border-slate-700 p-2 rounded shadow-xl text-[10px] font-bold text-white whitespace-nowrap pointer-events-none">
                           {HOLIDAYS_2026[format(d, 'yyyy-MM-dd')] || CUTI_BERSAMA_2026[format(d, 'yyyy-MM-dd')]}
                         </div>
                       )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={days.length + 1} className="py-32">
                     <div className="flex flex-col items-center gap-4">
                        <Activity className="w-10 h-10 text-[var(--primary)] animate-pulse" />
                        <p className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-[0.4em]">Synchronizing Capacity Grid...</p>
                     </div>
                  </td>
                </tr>
              ) : pics.length === 0 ? (
                <tr>
                   <td colSpan={days.length + 1} className="py-20 text-center">
                     <p className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-widest italic">No PIC Data Available for this period</p>
                   </td>
                </tr>
              ) : pics.map((pic, pi) => (
                <tr key={getSafeKey({id: pic}, pi, 'resource-row')} className="group border-b border-[var(--border)] hover:bg-[var(--bg-page)] transition-all">
                   <td className="sticky left-0 z-30 bg-[var(--bg-card)] px-6 py-4 border-r border-[var(--border)] transition-colors">
                     <div className="flex flex-col gap-1.5">
                       <span className="font-black text-sm italic text-[var(--text-main)] tracking-tighter group-hover:text-[var(--accent)]">
                         {pic}
                       </span>
                       <div className="flex items-center gap-2">
                         <div className="flex items-center gap-1 bg-[var(--success)]/10 px-1.5 py-0.5 rounded-md border border-[var(--success)]/20">
                           <span className="text-[8px] font-black text-[var(--success)]">O: {picStats[pic]?.WFO || 0}</span>
                         </div>
                         <div className="flex items-center gap-1 bg-[var(--accent)]/10 px-1.5 py-0.5 rounded-md border border-[var(--accent)]/20">
                           <span className="text-[8px] font-black text-[var(--accent)]">H: {picStats[pic]?.WFH || 0}</span>
                         </div>
                         <div className="flex items-center gap-1 bg-[var(--bg-page)] px-1.5 py-0.5 rounded-md border border-[var(--border)]">
                           <span className="text-[8px] font-black text-[var(--text-sub)]">T: {picStats[pic]?.TOTAL || 0}</span>
                         </div>
                       </div>
                     </div>
                   </td>
                   {days.map((d, di) => {
                     const dateKey = format(d, 'yyyy-MM-dd');
                     const holiday = HOLIDAYS_2026[dateKey];
                     const cuti = CUTI_BERSAMA_2026[dateKey];
                     const status = scheduleGrid[pic]?.[dateKey];
                     
                     const displayStatus = status || (holiday ? 'LIBUR' : null);
                     
                     return (
                       <td key={getSafeKey({id: `${pic}-${dateKey}`}, di, 'omdedy-cell')} className={cn(
                         "p-2 border-r border-[var(--border)]/10 text-center relative group/cell",
                         isToday(d) && "bg-[var(--accent)]/5",
                         holiday && "bg-rose-500/5",
                         cuti && "bg-amber-500/5"
                       )}>
                         <div className="flex justify-center items-center h-full min-h-[40px]">
                            {(holiday || cuti) && (
                               <div className="absolute bottom-full mb-2 hidden group-hover/cell:block z-[100] bg-slate-800 border border-slate-700 p-2 rounded shadow-xl text-[10px] font-bold text-white whitespace-nowrap pointer-events-none">
                                 {holiday || cuti}
                               </div>
                            )}
                            
                            {editingCell?.pic === pic && editingCell?.date === dateKey ? (
                              <div className="absolute inset-x-1 z-[110] bg-slate-950/95 backdrop-blur-md p-2 flex flex-col gap-1.5 shadow-2xl border border-indigo-500/50 rounded-2xl animate-in zoom-in-95 duration-200">
                                 {['WFO', 'WFH', 'WFC', 'LIBUR', 'A2', 'DELETE'].map((st, si) => (
                                   <button 
                                     key={getSafeKey({id: st}, si, 'status-opt')}
                                     onClick={() => {
                                       if (st === 'DELETE') {
                                          handleStatusUpdate(pic, dateKey, '');
                                       } else {
                                         handleStatusUpdate(pic, dateKey, st);
                                       }
                                     }}
                                     className={cn(
                                       "text-[9px] font-black px-3 py-1.5 rounded-xl grow hover:scale-105 active:scale-95 transition-all text-center border uppercase tracking-widest",
                                       st === 'DELETE' ? "bg-rose-500/20 text-rose-500 border-rose-500/30" : (SCHEDULE_STATUS_COLORS[st] || "bg-slate-800 text-slate-400 border-slate-700")
                                     )}
                                   >
                                     {st}
                                   </button>
                                 ))}
                                 <button onClick={() => setEditingCell(null)} className="text-[8px] font-black text-slate-500 bg-black/40 py-1.5 rounded-xl hover:text-white transition-colors">BATAL</button>
                              </div>
                            ) : (
                              displayStatus ? (
                               <motion.div 
                                 whileHover={{ scale: 1.1, zIndex: 10 }}
                                 onClick={() => {
                                   const isOwner = fullName === pic;
                                   if (isOwner || isAdmin || isSuperadmin) {
                                     setEditingCell({ pic, date: dateKey });
                                   } else {
                                     setOwnershipModal({
                                       isOpen: true,
                                       picName: pic,
                                       itemName: `Jadwal ${dateKey}`,
                                       type: 'schedule',
                                       onCancel: () => setOwnershipModal(prev => ({ ...prev, isOpen: false })),
                                       onConfirm: () => {
                                         setOwnershipModal(prev => ({ ...prev, isOpen: false }));
                                         setEditingCell({ pic, date: dateKey });
                                       }
                                     });
                                   }
                                 }}
                                 className={cn(
                                   "px-2.5 py-1.5 rounded-xl text-[10px] font-black border text-center shadow-lg transition-all select-none",
                                   (fullName === pic || isAdmin || isSuperadmin) ? "cursor-pointer hover:ring-2 hover:ring-indigo-500/50" : "cursor-help",
                                   holiday ? "text-rose-100 bg-rose-600 border-rose-500" : (SCHEDULE_STATUS_COLORS[displayStatus] || 'text-slate-500 bg-slate-800/10 border-slate-800')
                                 )}
                               >
                                 {displayStatus}
                               </motion.div>
                             ) : (
                               <div 
                                 onClick={() => {
                                   const isOwner = fullName === pic;
                                   if (isOwner || isAdmin || isSuperadmin) {
                                     setEditingCell({ pic, date: dateKey });
                                   } else {
                                     setOwnershipModal({
                                       isOpen: true,
                                       picName: pic,
                                       itemName: `Jadwal ${dateKey}`,
                                       type: 'schedule',
                                       onCancel: () => setOwnershipModal(prev => ({ ...prev, isOpen: false })),
                                       onConfirm: () => {
                                         setOwnershipModal(prev => ({ ...prev, isOpen: false }));
                                         setEditingCell({ pic, date: dateKey });
                                       }
                                     });
                                   }
                                 }}
                                 className={cn(
                                   "w-3 h-3 rounded-full bg-slate-800/50 transition-all shadow-inner",
                                   (fullName === pic || isAdmin || isSuperadmin) ? "cursor-pointer hover:bg-slate-600 hover:scale-125" : ""
                                 )} 
                               />
                             )
                            )}
                         </div>
                       </td>
                     );
                   })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend and Modals */}
      {requestModal && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 relative overflow-hidden"
           >
              {/* Glass Decorations */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                    <Clock className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Konfirmasi Perubahan Jadwal</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Status: Pending Approval</p>
                  </div>
                </div>
                <div className="space-y-5 mb-10">
                  <div className="p-6 bg-slate-950/40 rounded-3xl border border-white/5 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">PIC TARGET</p>
                        <p className="text-md font-black text-white italic">{requestModal.pic}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">TANGGAL</p>
                        <p className="text-md font-black text-slate-300 italic">{format(new Date(requestModal.date), 'dd MMMM yyyy')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 p-4 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden group">
                      <div className="flex-1">
                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">Original</p>
                        <span className="text-xs font-black text-slate-500">{requestModal.currentStatus || 'KOSONG'}</span>
                      </div>
                      <div className="w-8 h-8 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                        <ChevronRight className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-[8px] text-indigo-500 font-black uppercase tracking-widest mb-1">Proposed</p>
                        <span className="text-xs font-black text-indigo-400">{requestModal.newStatus || 'DELETE'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Two-Way Swap Feature */}
                  <div className="p-6 bg-slate-950/20 rounded-3xl border border-white/5">
                    <label className="flex items-center gap-3 cursor-pointer group mb-4">
                      <input 
                        type="checkbox" 
                        checked={requestModal.isSwap || false}
                        onChange={(e) => setRequestModal({ ...requestModal, isSwap: e.target.checked })}
                        className="w-5 h-5 rounded-lg border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500/50"
                      />
                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest group-hover:text-white transition-colors">Tukar 2 Arah (Opsional)</span>
                    </label>

                    {requestModal.isSwap && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-2 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[8px] text-slate-500 font-black uppercase tracking-widest ml-1">Tanggal Pengganti</label>
                            <CustomDatePicker 
                              selectedDate={requestModal.swapDate || ''}
                              onChange={(date) => {
                                const swapCurrentStatus = scheduleGrid[requestModal.pic]?.[date] || '';
                                // 🔥 UX: Auto-suggest the original status for the substitute date
                                setRequestModal({ 
                                  ...requestModal, 
                                  swapDate: date, 
                                  swapCurrentStatus,
                                  swapStatus: requestModal.currentStatus // Suggest the original status
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[8px] text-slate-500 font-black uppercase tracking-widest ml-1">Status Pengganti</label>
                            <select 
                              value={requestModal.swapStatus || ''}
                              onChange={(e) => setRequestModal({ ...requestModal, swapStatus: e.target.value })}
                              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-indigo-400 font-black uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            >
                              <option value="">Pilih Status</option>
                              {['WFO', 'WFH', 'A2', 'LIBUR'].map(st => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {requestModal.swapDate && (
                          <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-center">
                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-tighter mb-1">Status Saat Ini pada {requestModal.swapDate}</p>
                            <span className="text-[10px] font-black text-slate-400">{requestModal.swapCurrentStatus || 'KOSONG'}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-2">Alasan Reschedule</label>
                    <textarea 
                      id="reschedule-reason"
                      className="w-full bg-slate-950/50 border border-white/10 rounded-3xl p-5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-700 min-h-[120px]"
                      placeholder="Contoh: Sakit, Ada keperluan mendesak, Tukar shift..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setRequestModal(null)}
                    className="flex-1 py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border border-white/5"
                  >
                    Batalkan
                  </button>
                  <button 
                    onClick={async () => {
                      const reason = (document.getElementById('reschedule-reason') as HTMLTextAreaElement).value;
                      if (!reason.trim()) {
                        alert('Harap masukkan alasan penukaran jadwal.');
                        return;
                      }

                      if (requestModal.isSwap) {
                        if (!requestModal.swapDate || !requestModal.swapStatus) {
                          alert('Harap lengkapi detail tukar jadwal.');
                          return;
                        }
                        if (requestModal.swapDate === requestModal.date) {
                          alert('Tanggal pengganti tidak boleh sama dengan tanggal utama.');
                          return;
                        }

                        // Check duplicate for swap date
                        try {
                          const isSwapPending = await taskService.checkExistingRescheduleRequest(requestModal.pic, requestModal.swapDate);
                          if (isSwapPending) {
                            alert(`Tanggal pengganti (${requestModal.swapDate}) sedang dalam status Pending approval.`);
                            return;
                          }
                        } catch (e) { console.error(e); }
                      }

                      try {
                        setLoading(true);
                        
                        // Single payload for multi-way swaps
                        const payload = {
                          pic_name: requestModal.pic,
                          schedule_date: requestModal.date,
                          original_status: requestModal.currentStatus,
                          new_status: requestModal.newStatus,
                          reason: reason.trim() + (requestModal.isSwap ? ` (Tukar dengan ${requestModal.swapDate})` : ''),
                          requested_by: fullName || user?.email || user?.name || 'User',
                          swap_date: requestModal.isSwap ? requestModal.swapDate : null,
                          swap_status: requestModal.isSwap ? requestModal.swapStatus : null
                        };

                        await taskService.createRescheduleRequest(payload);
                        onNotif?.("Request submitted for approval.");
                        setRequestModal(null);
                        fetchSchedules();
                      } catch (err: any) {
                        console.error(err);
                        alert(`Gagal mengirim permohonan: ${err.message || 'Unknown Error'}`);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="flex-3 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 transition-all border border-white/20 active:scale-95"
                  >
                    Kirim Pengajuan
                  </button>
                </div>
              </div>
           </motion.div>
        </div>
      )}

      {showRescheduleRequests && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col relative overflow-hidden"
           >
              <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                    <History className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Om Dedy: APPROVAL MENU</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Incoming and Pending Requests</p>
                  </div>
                </div>
                <button onClick={() => setShowRescheduleRequests(false)} className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {rescheduleRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                    <History className="w-16 h-16 text-slate-500" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">No Pending Requests Found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rescheduleRequests.map((req: any, ri: number) => (
                      <div key={getSafeKey(req, ri, 'resched-req')} className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-indigo-500/30 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-black text-white italic">{req.pic_name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{req.schedule_date}</p>
                          </div>
                          <div className={cn(
                            "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border",
                            req.status === 'Approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            req.status === 'Rejected' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          )}>
                            {req.status}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl">
                          <div className="flex-1 text-center">
                            <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">From</p>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">{req.original_status || 'BLANK'}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-700" />
                          <div className="flex-1 text-center">
                            <p className="text-[8px] text-indigo-500 font-bold uppercase mb-1">To</p>
                            <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">{req.new_status}</span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800/50">
                          <p className="text-[8px] text-slate-500 font-bold uppercase mb-2">Reason</p>
                          <p className="text-xs text-slate-300 italic">"{req.reason}"</p>
                        </div>
                        
                        {req.status === 'Pending' && (
                          <div className="flex gap-3">
                            <button 
                              onClick={async () => {
                                if (confirm('Tolak request ini?')) {
                                  try {
                                    await taskService.updateRescheduleRequestStatus(req.id, 'Rejected', user?.email || 'Admin');
                                    fetchSchedules();
                                  } catch (err) { alert('Gagal memproses approval'); }
                                }
                              }}
                              className="flex-1 py-3 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={async () => {
                                if (confirm('Setujui request ini? Jadwal akan terupdate otomatis.')) {
                                  try {
                                    await taskService.updateRescheduleRequestStatus(req.id, 'Approved', user?.email || 'Admin');
                                    fetchSchedules();
                                  } catch (err) { alert('Gagal memproses approval'); }
                                }
                              }}
                              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
           </motion.div>
        </div>
      )}

      <div className="bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border)] p-6 rounded-[2rem] flex flex-wrap gap-8 items-center">
         <div className="flex items-center gap-3 pr-8 border-r border-[var(--border)]">
            <Filter className="w-4 h-4 text-[var(--text-sub)]" />
            <span className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-[0.3em]">Status Legend</span>
         </div>
         {[
           { label: 'WFO - Work From Office', color: 'emerald', code: 'WFO' },
           { label: 'WFH - Work From Home', color: 'indigo', code: 'WFH' },
           { label: 'WFC/A2 - Outstation', color: 'amber', code: 'WFC' },
           { label: 'LIBUR/LATE - Absence', color: 'rose', code: 'LIBUR' },
         ].map(item => (
           <div key={item.code} className="flex items-center gap-3">
              <div className={cn(
                "w-4 h-4 rounded-lg border",
                SCHEDULE_STATUS_COLORS[item.code]
              )} />
              <span className="text-[10px] font-bold text-[var(--text-sub)] uppercase tracking-widest">{item.label}</span>
           </div>
         ))}
      </div>
    </div>
  );
}

function PersonelManagement({ users, projects, currentUser, onRefresh, isAdmin, isMobile }: { users: AppUser[], projects: Project[], currentUser: any, onRefresh: () => void, isAdmin: boolean, isMobile?: boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [accessFilter, setAccessFilter] = useState('all');
  const [selectedPIC, setSelectedPIC] = useState<AppUser | null>(null);
  
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, title: string, description: string, onConfirm: () => void, variant?: 'danger' | 'primary' } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [notif, setNotif] = useState<string | null>(null);

  const filteredUsers = (users || []).filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAccess = accessFilter === 'all' || u.access_level === accessFilter;
    return matchesSearch && matchesAccess;
  });

  const startEditing = (user: AppUser) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDelete = async (user: AppUser) => {
    if (!isAdmin) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Personel?',
      description: `Apakah Anda yakin ingin menghapus ${user.name} (${user.email}) dari sistem? Tindakan ini tidak dapat dibatalkan.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await taskService.deleteUser(user.id, currentUser?.email || 'System');
          setNotif(`Personnel ${user.name} removed successfully`);
          onRefresh();
          if (selectedPIC?.id === user.id) setSelectedPIC(null);
        } catch (err) {
          console.error('Delete user failed:', err);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <SuccessNotification show={!!notif} message={notif || ''} onClose={() => setNotif(null)} />
      
      <AnimatePresence>
        {confirmConfig && (
          <ConfirmModal 
            isOpen={confirmConfig.isOpen}
            onClose={() => setConfirmConfig(null)}
            onConfirm={confirmConfig.onConfirm}
            title={confirmConfig.title}
            description={confirmConfig.description}
            variant={confirmConfig.variant}
            confirmText={confirmConfig.variant === 'primary' ? 'Ya, Simpan' : 'Hapus'}
          />
        )}
        {showAddModal && (
          <AddPersonnelModal 
            isAdmin={isAdmin}
            currentUserEmail={currentUser?.email || 'System'}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setNotif('New personnel onboarded successfully');
              onRefresh();
            }}
          />
        )}
        {showEditModal && editingUser && (
          <EditPersonnelModal 
            user={editingUser}
            isAdmin={isAdmin}
            currentUserEmail={currentUser?.email || 'System'}
            onClose={() => {
              setShowEditModal(false);
              setEditingUser(null);
            }}
            onConfirmSave={async (updatedData) => {
              try {
                await taskService.updateUser(editingUser.id, updatedData, currentUser?.email || 'System');
                setNotif('Data berhasil diperbarui');
                setShowEditModal(false);
                setEditingUser(null);
                onRefresh();
              } catch (err: any) {
                alert('Update failed: ' + err.message);
              }
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-sub)]" />
            <input 
              type="text"
              placeholder="Search PIC or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-page)]/50 border border-[var(--border)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-main)] focus:border-[var(--accent)] outline-none transition-all"
            />
          </div>
          <select 
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value)}
            className="bg-[var(--bg-page)]/50 border border-[var(--border)] rounded-xl px-4 py-2 text-xs text-[var(--text-sub)] focus:border-[var(--accent)] outline-none"
          >
            <option value="all">All Access Levels</option>
            <option value="Superadmin">Superadmin</option>
            <option value="Admin">Admin</option>
            <option value="PIC">PIC</option>
            <option value="Developer">Developer</option>
            <option value="QA">QA</option>
          </select>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" /> Add Personnel
          </button>
        )}
      </div>

      <div className={cn("bg-[var(--bg-card)]/50 border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl", isMobile && "bg-transparent border-none shadow-none")}>
        {isMobile ? (
          <div className="space-y-4">
            {filteredUsers.map((u, i) => {
              const canEdit = isAdmin || u.email === currentUser?.email;
              return (
                <div 
                  key={getSafeKey(u, i, 'user-mobile')}
                  className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-2xl space-y-4"
                  onClick={() => setSelectedPIC(u)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-center font-bold text-xs text-[var(--accent)] uppercase">
                        {u.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-main)]">{u.name}</p>
                        <p className="text-[10px] text-[var(--text-sub)] font-mono">{u.email}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[8px] font-black uppercase tracking-wider">
                      {u.access_level}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                    <span className="font-black text-[var(--text-sub)] text-[8px] uppercase tracking-widest">{u.role}</span>
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <button 
                          onClick={e => { e.stopPropagation(); startEditing(u); }}
                          className="p-2 bg-[var(--bg-page)] rounded-lg text-[var(--text-sub)]"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={e => { e.stopPropagation(); setSelectedPIC(u); }}
                        className="p-2 bg-[var(--bg-page)] rounded-lg text-[var(--text-sub)]"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-page)]">
                <th className="px-6 py-4 text-[9px] font-black text-[var(--text-sub)] uppercase tracking-[0.2em]">Nama PIC</th>
                <th className="px-6 py-4 text-[9px] font-black text-[var(--text-sub)] uppercase tracking-[0.2em]">Email PIC</th>
                <th className="px-6 py-4 text-[9px] font-black text-[var(--text-sub)] uppercase tracking-[0.2em]">Password</th>
                <th className="px-6 py-4 text-[9px] font-black text-[var(--text-sub)] uppercase tracking-[0.2em]">Access Level</th>
                <th className="px-6 py-4 text-[9px] font-black text-[var(--text-sub)] uppercase tracking-[0.2em]">Role</th>
                <th className="px-6 py-4 text-[9px] font-black text-[var(--text-sub)] uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredUsers.map((u, i) => {
                const canEdit = isAdmin || u.email === currentUser?.email;
                const personnelKey = getSafeKey(u, i, 'user');

                return (
                  <tr 
                    key={personnelKey} 
                    className="hover:bg-[var(--bg-page)]/50 transition-all group cursor-pointer border-b border-[var(--border)]"
                    onClick={() => setSelectedPIC(u)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-center font-bold text-[10px] text-[var(--accent)] uppercase">
                          {u.name?.charAt(0)}
                        </div>
                        <span className="font-bold text-[var(--text-main)]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[11px] text-[var(--text-sub)] font-mono">{u.email}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[11px] text-[var(--text-sub)]/30 font-mono">••••••••</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-black uppercase tracking-wider">
                        {u.access_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-[var(--text-sub)] text-[10px] uppercase tracking-[0.15em]">{u.role}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canEdit && (
                          <button 
                            onClick={e => { e.stopPropagation(); startEditing(u); }}
                            className="p-2 hover:bg-[var(--bg-page)] rounded-lg text-[var(--text-sub)] hover:text-[var(--accent)]"
                            title="Edit Personnel"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={e => { e.stopPropagation(); setSelectedPIC(u); }}
                          className="p-2 hover:bg-[var(--bg-page)] rounded-lg text-[var(--text-sub)] hover:text-[var(--accent)]"
                          title="View Info"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={e => { e.stopPropagation(); handleDelete(u); }}
                            className="p-2 hover:bg-[var(--danger)]/10 rounded-lg text-[var(--text-sub)] hover:text-[var(--danger)]"
                            title="Hapus Personel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {selectedPIC && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border)] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card)]/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-xl font-black text-white italic">
                    {selectedPIC.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-[var(--text-main)] uppercase italic tracking-tighter text-lg">{selectedPIC.name}</h3>
                    <p className="text-[10px] text-[var(--text-sub)] font-bold uppercase tracking-widest">{selectedPIC.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPIC(null)}
                  className="p-2 hover:bg-[var(--bg-page)] rounded-xl transition-colors text-[var(--text-sub)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 space-y-6">
                <div>
                   <h4 className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-[0.2em] mb-4">Credentials</h4>
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[var(--text-sub)] uppercase px-1">Crypto-Key (Password)</label>
                        <input 
                          type="password"
                          defaultValue={selectedPIC.password || ''}
                          className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-all font-mono"
                          placeholder="Set password..."
                        />
                      </div>
                   </div>
                </div>

                <div>
                   <h4 className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-[0.2em] mb-4">Assigned Projects</h4>
                   <div className="space-y-3">
                      {projects.filter(p => true).map((p, i) => (
                        <div key={getSafeKey(p, i, 'pic-project')} className="bg-[var(--bg-page)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-[var(--accent)]/50 transition-all group">
                            <div>
                              <p className="text-xs font-bold text-[var(--text-main)] uppercase">{p.project_name || "Loading Project..."}</p>
                              <p className="text-[9px] text-[var(--text-sub)] font-bold uppercase tracking-tighter mt-1">Status: <span className="text-[var(--accent)]">{p.status}</span></p>
                            </div>
                            <button className="p-2 bg-[var(--bg-card)] rounded-lg text-[var(--text-sub)] hover:text-[var(--text-main)] transition-opacity opacity-0 group-hover:opacity-100">
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                      ))}
                   </div>
                </div>
              </div>
            </motion.div>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10" onClick={() => setSelectedPIC(null)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KanbanView({ projects, tasks, onOpenGantt, onUpdateProject }: { projects: Project[], tasks: Task[], onOpenGantt: (id: string) => void, onUpdateProject: (id: string, updates: Partial<Project>) => void, isMobile?: boolean }) {
  const [picFilter, setPicFilter] = useState('all');
  const [projectSearch, setProjectSearch] = useState('');

  const KANBAN_COLUMNS = [
    { id: 'To Do', title: 'TO DO / ON QUEUE', color: 'bg-slate-400 dark:bg-slate-500' },
    { id: 'FSD On Progress', title: 'FSD ON PROGRESS', color: 'bg-blue-500' },
    { id: 'Development On Progress', title: 'DEV ON PROGRESS', color: 'bg-indigo-500' },
    { id: 'SIT On Progress', title: 'SIT ON PROGRESS', color: 'bg-cyan-500' },
    { id: 'UAT On Progress', title: 'UAT ON PROGRESS', color: 'bg-purple-500' },
    { id: 'LIVE', title: 'LIVE / DONE', color: 'bg-emerald-500' },
  ];

  const safeProjects = projects || [];
  const safeTasks = tasks || [];

  const getProjectsByStatus = (statusId: string) => {
    return safeProjects.filter(p => {
      // Filter by search
      if (projectSearch && !p.project_name.toLowerCase().includes(projectSearch.toLowerCase())) return false;
      
      // Filter by PIC if needed
      if (picFilter !== 'all') {
         const pPic = p.pic_name || p.leader_email || 'Unassigned';
         if (pPic !== picFilter) return false;
      }

      const pStatus = (p as any).global_status || p.status || 'To Do';
      
      if (statusId === 'To Do' && (pStatus === 'To Do' || pStatus === 'On Queue' || pStatus === 'OPEN')) return true;
      return pStatus === statusId;
    });
  };

  const uniquePics = Array.from(new Set(safeProjects.map(p => p.pic_name || p.leader_email || 'Unassigned'))).filter(Boolean).sort();

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="sticky top-0 z-20 bg-[var(--bg-card)]/80 backdrop-blur-md py-4 border-b border-[var(--border)] mb-6 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4 flex-1 max-w-2xl min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-sub)]" />
            <input 
              type="text"
              placeholder="Filter Project Name..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="w-full bg-[var(--bg-page)]/50 border border-[var(--border)] rounded-xl pl-9 pr-4 py-2 text-[11px] text-[var(--text-main)] focus:border-[var(--accent)] outline-none transition-all shadow-inner dark:shadow-none"
            />
          </div>
          <select 
            value={picFilter}
            onChange={(e) => setPicFilter(e.target.value)}
            className="bg-[var(--bg-page)]/50 border border-[var(--border)] rounded-xl px-4 py-2 text-[11px] text-[var(--text-sub)] outline-none transition-all"
          >
            <option value="all">All PIC</option>
            {uniquePics.map(pic => <option key={pic} value={pic}>{pic}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-page)]/50 border border-[var(--border)] rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-[var(--text-sub)] uppercase tracking-widest">Real-time Sync Active</span>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto snap-x pb-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="flex gap-6 h-full min-w-max pr-24">
          {KANBAN_COLUMNS.map((col, i) => {
            const colProjects = getProjectsByStatus(col.id);

            return (
              <div key={getSafeKey(col, i, 'kanban-col')} className="flex-1 w-[350px] min-w-[350px] shrink-0 bg-[var(--bg-page)]/50 rounded-2xl border border-[var(--border)] p-4 flex flex-col gap-4 snap-center transition-colors">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", col.color)} />
                    <h3 className="text-[10px] font-black text-[var(--text-sub)] uppercase tracking-[0.15em]">{col.title}</h3>
                  </div>
                  <span className="bg-[var(--bg-card)] px-2 py-0.5 rounded text-[10px] font-mono text-[var(--text-sub)] border border-[var(--border)]">{colProjects.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide py-2">
                  {(colProjects || []).map((p, j) => {
                    const projectTasks = safeTasks.filter(t => t.project_id === p.id);
                    const doneTasks = projectTasks.filter(t => !!t.realized_finish_date).length;
                    const progress = projectTasks.length > 0 ? (doneTasks / projectTasks.length) * 100 : 0;
                    const isLate = p.status === ProjectStatus.LATE;
                    
                    return (
                      <motion.div 
                        layoutId={p.id}
                        key={getSafeKey(p, j, 'kanban-project')}
                        onClick={() => onUpdateProject(p.id, { status: col.id as ProjectStatus })}
                        className={cn(
                          "bg-[var(--bg-card)] border rounded-xl p-4 shadow-sm hover:shadow-xl cursor-pointer transition-all hover:bg-[var(--bg-page)] group relative overflow-hidden h-auto min-h-[180px] flex flex-col",
                          isLate ? "border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.1)]" : "border-[var(--border)] hover:border-[var(--accent)]/50"
                        )}
                      >
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className="text-xs font-black text-[var(--text-main)] italic uppercase tracking-tighter transition-colors whitespace-normal break-words leading-tight">{p.project_name || "Loading Project..."}</h4>
                            {isLate && (
                              <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[7px] font-black uppercase tracking-widest rounded animate-pulse shrink-0">LATE</span>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-1.5 mb-4">
                             <div className="flex items-center gap-2 text-[9px] font-bold text-[var(--text-sub)] uppercase tracking-widest">
                               <UserIcon className="w-3 h-3 text-[var(--accent)]" />
                               <span>PIC: <span className="text-[var(--text-main)] transition-colors font-bold uppercase">{p.pic_name || p.leader_email || 'Unassigned'}</span></span>
                             </div>
                             <div className="flex items-center gap-2 text-[9px] font-bold text-[var(--text-sub)] uppercase tracking-widest">
                               <Clock className="w-3 h-3 text-[var(--text-sub)]" />
                               <span>Updated: <span className="font-mono text-[var(--text-main)] transition-colors">{p.updated_at ? format(new Date(p.updated_at), 'MM/dd') : 'N/A'}</span></span>
                             </div>
                          </div>
                          
                          <div className="flex flex-col h-full bg-black/20 -mx-4 -mb-4 p-4 mt-auto">
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter italic">
                                <span className="text-[var(--text-sub)]">Infrastructure Health</span>
                                <span className="text-[var(--accent)]">{Math.round(progress)}%</span>
                              </div>
                              <div className="h-1 bg-[var(--bg-page)] rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  className={cn(
                                    "h-full",
                                    progress === 100 ? "bg-emerald-500" : "bg-[var(--accent)]"
                                  )}
                                />
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                              <button 
                                onClick={(e) => { e.stopPropagation(); onOpenGantt(p.id); }}
                                className="px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 rounded-lg text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-md active:scale-95"
                              >
                                Gantt Detail
                              </button>
                              <div className="w-6 h-6 rounded-lg bg-[var(--bg-page)] flex items-center justify-center font-black text-[8px] text-[var(--accent)] border border-[var(--border)]">
                                {(p.project_name || '?').charAt(0)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 blur-2xl -mr-8 -mt-8" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


const ProjectRedirect = () => {
  const { projectId } = useParams();
  return <Navigate to={`/detail-timeline/${projectId}`} replace />;
};

function GanttDetailView({ 
  user, users, projectId: propsProjectId, setFocusedProjectId, projects, setProjects, tasks, hierarchicalTasks, expandedRows, scale, revertCount,
  setRefreshKey, handleToggleExpand, handleUpdateTask, handleUpdateProject, handleOpenAudit, handleDeleteTask, 
  setScale, setTasks, setIsEditWBSModalOpen, onReschedule, onNotif, auditLogs, historyEditLogs, isAdmin, isSuperadmin, isMobile, authLoading
}: any) {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId: urlProjectId } = useParams();
  const projectId = urlProjectId || propsProjectId;

  const isGlobalView = !projectId || location.pathname === '/timeline';

  useEffect(() => {
    if (!projectId && !authLoading && !isGlobalView) {
      navigate('/projects');
    }
  }, [projectId, navigate, authLoading, isGlobalView]);

  const [activeView, setActiveView] = useState<'INFRASTRUCTURE' | 'SYSTEM_LOG' | 'HISTORY_EDIT'>('INFRASTRUCTURE');
  const [rescheduleLogs, setRescheduleLogs] = useState<ProjectRescheduleLog[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  const currentProject = useMemo(() => (projects || []).find((p: any) => p.id === projectId), [projects, projectId]);

  // DERIVE PROJECT SPECIFIC AUDIT LOGS
  const systemLogs = useMemo(() => {
    if (!auditLogs) return [];
    const filtered = isGlobalView ? auditLogs : auditLogs.filter((log: any) => log.project_id === projectId);
    // Explicitly focus on system logs now
    return filtered.filter((log: any) => {
      const actor = (log.actor || "").toLowerCase();
      const logType = (log.log_type || "");
      const action = (log.action || "").toLowerCase();
      const newPayloadStr = typeof log.new_payload === 'string' ? log.new_payload : JSON.stringify(log.new_payload || {});
      
      return actor.includes('system') || 
             logType.includes('SYSTEM') || 
             action.includes('auto') ||
             newPayloadStr.toLowerCase().includes('"changed_by":"system');
    });
  }, [auditLogs, projectId, isGlobalView]);

  const historyLogs = useMemo(() => {
    if (!historyEditLogs) return [];
    if (isGlobalView) return historyEditLogs;
    return historyEditLogs.filter((log: any) => log.project_id === projectId);
  }, [historyEditLogs, projectId, isGlobalView]);

  // AUTO-SCROLL TO TODAY
  const timelineRange = useMemo(() => {
    const filteredTasks = projectId ? tasks.filter((t: any) => t.project_id === projectId) : tasks;
    return calculateTimelineRange(scale, filteredTasks, projects, projectId, isGlobalView);
  }, [scale, tasks, projects, projectId, isGlobalView]);

  useEffect(() => {
    const scrollToToday = () => {
      if (scrollRef.current) {
        const now = new Date();
        const startMs = timelineRange.gridStart.getTime();
        const totalDuration = timelineRange.totalDuration;
        const container = scrollRef.current;
        const viewportWidth = container.clientWidth;
        
        // Find the 3600px inner div or whatever the scale is
        const contentDiv = container.firstElementChild as HTMLElement;
        const totalWidth = contentDiv?.scrollWidth || 3600;

        const posPercent = (now.getTime() - startMs) / totalDuration;
        if (posPercent > 0 && posPercent < 1) {
          const scrollTo = (posPercent * totalWidth) - (viewportWidth / 2);
          container.scrollLeft = Math.max(0, scrollTo);
        }
      }
    };

    // Small delay to ensure layout
    const timer = setTimeout(scrollToToday, 500);
    return () => clearTimeout(timer);
  }, [timelineRange.gridStart, timelineRange.totalDuration, scale]);

  // Reactive Sync: Calculate and Save Global Status to Supabase
  useEffect(() => {
    const syncStatusToDatabase = async () => {
      // 1. Calculate the latest status
      const projectTasks = tasks.filter((t: any) => t.project_id === projectId);
      const latestStatus = calculateGlobalProjectStatus(projectTasks, currentProject?.status || '');

      // 2. FORCE SYNC TO SUPABASE (master_projects) and local projects state
      // Use ticket_id if available, otherwise fallback to projectId (assuming they refer to same entity in master_projects)
      const syncId = currentProject?.ticket_id || projectId;
      
      if (syncId && latestStatus && latestStatus !== currentProject?.status) {
        // Update local project status first
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: latestStatus as any } : p));

        const { error } = await supabase
          .from('master_projects')
          .update({ global_status: latestStatus, status: latestStatus }) 
          .eq('ticket_id', syncId);

        if (error) {
          console.error("🔥 Sync Error: Failed to update master_projects", error);
        } else {
          console.log("✅ Sync Success: Master Project updated to", latestStatus);
        }

        // Also update the projects table if it differs
        await supabase.from('projects').update({ status: latestStatus }).eq('id', projectId);
      }
    };

    if (tasks && tasks.length > 0 && projectId && currentProject) {
      syncStatusToDatabase();
    }
  }, [tasks, projectId, currentProject?.id, currentProject?.ticket_id]);

  // If loading, show spinner (simulated or simplified check)
  // We can use the 'tasks' being empty or loading state from props if passed
  const isLoading = !projects || (projects.length === 0 && !projectId);

  if (!isGlobalView && (!projectId || !currentProject)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-slate-900/50 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
          <Activity className="w-10 h-10 text-indigo-500" />
        </div>
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">No Project Selected</h3>
        <p className="text-slate-400 max-w-md mb-8 font-medium">Please select a project from the Project List to view the detailed timeline and task management.</p>
        <button 
          onClick={() => navigate('/projects')}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          Go to Project List
        </button>
      </div>
    );
  }

  // If projectId is null or on global route, we show the high-level Global Gantt
  // const isGlobalView = !projectId; (already defined)
  

  const handleAddInlineL1 = async () => {
    if (!projectId) return;
    const tempId = crypto.randomUUID();
    const customId = `#PH-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const defaultL1 = {
        id: tempId,
        custom_id: customId,
        project_id: projectId,
        parent_id: null,
        title: PHASE_L1_OPTIONS[0], 
        duration_hours: 0,
        man_hours: 0,
        status: TaskStatus.TODO,
        start_time: null, 
        end_time: null,
        assignee: user?.name || '',
        updated_at: new Date().toISOString()
      };
    try {
      setTasks((prev: Task[]) => [...prev, defaultL1]);
      const { data, error } = await supabase.from('tasks').insert([defaultL1]).select().single();
      if (error) {
        setTasks((prev: Task[]) => prev.filter(t => t.id !== tempId));
        throw error;
      }
      if (data) {
        setTasks((prev: Task[]) => prev.map(t => t.id === tempId ? data : t));
      }
    } catch (err: any) {
      console.error("Failed to add inline L1:", err);
    }
  };

  const handleAddInlineL2 = async (parentId: string) => {
    if (!projectId) return;
    const parent = tasks.find((t: any) => t.id === parentId);
    const tempId = crypto.randomUUID();
    const customId = `#TS-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const defaultL2 = {
        id: tempId,
        custom_id: customId,
        project_id: projectId,
        parent_id: parentId,
        title: '', 
        duration_hours: 0,
        man_hours: 0,
        status: TaskStatus.TODO,
        start_time: (parent?.start_time && parent.start_time !== '') ? parent.start_time : new Date().toISOString(),
        end_time: (parent?.end_time && parent.end_time !== '') ? parent.end_time : addDays(new Date(), 1).toISOString(),
        assignee: user?.name || '',
        updated_at: new Date().toISOString()
      };
    try {
      setTasks((prev: Task[]) => [...prev, defaultL2]);
      if (!expandedRows.has(parentId)) {
        handleToggleExpand(parentId);
      }
      const { data, error } = await supabase.from('tasks').insert([defaultL2]).select().single();
      if (error) {
        setTasks((prev: Task[]) => prev.filter(t => t.id !== tempId));
        throw error;
      }
      if (data) {
        setTasks((prev: Task[]) => prev.map(t => t.id === tempId ? data : t));
      }
    } catch (err: any) {
      console.error("Failed to add inline L2:", err);
    }
  };

  const projectStats = useMemo(() => {
    if (!projectId || !tasks) return { minStart: null, maxEnd: null, totalManHours: 0, totalTasks: 0, totalChildTasks: 0, remainingManHours: 0 };
    
    // THE "MATHEMATICIAN" FIX: Project-Level Scoped Scoped aggregation
    const pTasks = tasks.filter((t: any) => t.project_id === projectId);
    if (pTasks.length === 0) return { minStart: null, maxEnd: null, totalManHours: 0, totalTasks: 0, totalChildTasks: 0, remainingManHours: 0 };

    const validDates = pTasks
      .flatMap(t => [t.start_time, t.end_time])
      .filter(d => {
        const ts = d ? new Date(d).getTime() : 0;
        return ts > 86400000 && !isNaN(ts); // Filter out 1970/Invalid dates
      });

    const minStart = validDates.length > 0 ? new Date(Math.min(...validDates.map(d => new Date(d).getTime()))) : null;
    const maxEnd = validDates.length > 0 ? new Date(Math.max(...validDates.map(d => new Date(d).getTime()))) : null;
    
    const totalTasks = pTasks.filter(t => !t.parent_id).length;
    const totalChildTasks = pTasks.filter(t => !!t.parent_id).length;
    
    // THE "TRUE SUM" PROTOCOL: Direct aggregation of the man_hours column
    const totalManHours = pTasks.reduce((sum, t) => sum + (Number(t.man_hours) || 0), 0);
    const remainingManHours = pTasks
      .filter(t => t.status !== TaskStatus.DONE)
      .reduce((sum, t) => sum + (Number(t.man_hours) || 0), 0);

    return { 
      minStart, 
      maxEnd, 
      totalManHours,
      remainingManHours: Math.max(0, remainingManHours),
      totalTasks,
      totalChildTasks
    };
  }, [tasks, projectId]);

  const displayStart = currentProject?.start_date || (projectStats.minStart && !isNaN(projectStats.minStart.getTime()) ? format(projectStats.minStart, 'yyyy-MM-dd') : '');
  const displayEnd = currentProject?.end_date || (projectStats.maxEnd && !isNaN(projectStats.maxEnd.getTime()) ? format(projectStats.maxEnd, 'yyyy-MM-dd') : '');
  
  useEffect(() => {
    if (projectId) {
      taskService.getProjectRescheduleLogs(projectId).then(setRescheduleLogs);
    }
  }, [projectId]);

  
  // RBAC & Filter logic
  
  const filteredTasks = useMemo(() => {
    if (isGlobalView) return tasks || []; 
    const pTasks = (tasks || []).filter((t: any) => t.project_id === projectId);
    return pTasks;
  }, [tasks, projectId, isGlobalView]);

  // Recalculate hierarchy for filtered tasks
  const projectTree = useMemo(() => {
    if (isGlobalView) {
      const globalRoots = (projects || []).map(p => {
        const pTasks = (tasks || []).filter(t => t.project_id === p.id);
        
        // Build sub-hierarchy (Phases -> Tasks)
        const l1Map = new Map();
        const l1Roots: any[] = [];
        pTasks.forEach(t => {
          if (!t.parent_id) {
            const node = { ...t, children: [] };
            l1Map.set(t.id, node);
            l1Roots.push(node);
          }
        });
        pTasks.forEach(t => {
          if (t.parent_id && l1Map.has(t.parent_id)) {
            l1Map.get(t.parent_id).children.push({ ...t });
          }
        });

        // 1. Sync Phase ranges from children
        l1Roots.forEach(l1 => {
          if (l1.children.length > 0) {
            const range = calculateParentRange(l1.children);
            if (range.from_date) l1.start_time = range.from_date;
            if (range.to_date) l1.end_time = range.to_date;
          }
        });

        // Sort l1Roots
        l1Roots.sort((a, b) => {
           const getOrder = (title: string) => {
              const str = (title || '').toUpperCase();
              for (const key in PHASE_ORDER) {
                 if (str.includes(key)) return (PHASE_ORDER as any)[key];
              }
              return 99;
           };
           const orderA = getOrder(a.title);
           const orderB = getOrder(b.title);
           if (orderA !== orderB) return orderA - orderB;
           return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
        });

        // 2. Sync Project range from all tasks
        const projectRange = calculateParentRange(pTasks);
        
        // Use specified project dates if available and tasks don't exceed them, or if no tasks
        const baseStart = projectRange.from_date ? new Date(projectRange.from_date).getTime() : (p.start_date ? new Date(p.start_date).getTime() : new Date(p.created_at).getTime());
        const baseEnd = projectRange.to_date ? new Date(projectRange.to_date).getTime() : (p.end_date ? new Date(p.end_date).getTime() : new Date(p.created_at).getTime() + 86400000);

        // TRUE MATH AGGREGATION for Global View
        const leafTasks = pTasks.filter(t => !pTasks.some(other => other.parent_id === t.id));
        const totalProjectManHours = leafTasks.reduce((sum, t) => sum + (Number(t.man_hours) || 0), 0);

        return {
          id: p.id,
          title: p.name,
          isProject: true,
          status: p.status,
          start_time: new Date(baseStart).toISOString(),
          end_time: new Date(baseEnd).toISOString(),
          assignee: p.pic_name || p.leader_email,
          duration_hours: totalProjectManHours,
          duration_minutes: 0,
          children: l1Roots
        };
      });
      
      const map = new Map();
      globalRoots.forEach(r => map.set(r.id, r)); 
      return { roots: globalRoots, map };
    }

    const roots: any[] = [];
    const map = new Map();
    (filteredTasks || []).forEach((t: any) => map.set(t.id, { ...t, children: [] }));
    (filteredTasks || []).forEach((t: any) => {
      if (t.parent_id && map.has(t.parent_id)) {
        map.get(t.parent_id).children.push(map.get(t.id));
      } else if (!t.parent_id) {
        roots.push(map.get(t.id));
      }
    });

    // Recursive inheritance for dates
    const syncBoundaries = (nodes: any[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          syncBoundaries(node.children);
          const range = calculateParentRange(node.children);
          if (range.from_date && !node.start_time) node.start_time = range.from_date;
          if (range.to_date && !node.end_time) node.end_time = range.to_date;
        }
      });
    };

    syncBoundaries(roots);

    roots.sort((a, b) => {
        const getOrder = (title: string) => {
          const str = (title || '').toUpperCase();
          for (const key in PHASE_ORDER) {
            if (str.includes(key)) return (PHASE_ORDER as any)[key];
          }
          return 99;
        };
        const orderA = getOrder(a.title);
        const orderB = getOrder(b.title);
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });

    return { roots, map };
  }, [filteredTasks, isGlobalView, projects, tasks]);

  const handleExportWBS = () => {
    if (!currentProject) return;
    
    // Pass the hierarchical project tree roots to the new export utility
    exportToExcel(currentProject, projectTree.roots);
  };

  if (!projectTree || !projectTree.roots || (projectTree.roots.length === 0 && !isGlobalView)) {
    return (
      <div className="h-full flex items-center justify-center bg-[#020617] text-slate-500 font-bold uppercase tracking-widest flex-col gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center opacity-50">
          <Plus className="w-6 h-6" />
        </div>
        {user ? 'Timeline Partition Empty' : 'No tasks assigned yet'}
        {!isGlobalView && user && (
           <button 
             onClick={handleAddInlineL1}
             className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
           >
             <Plus className="w-4 h-4" /> Add First Phase (L1)
           </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
       <AnimatePresence mode="wait">
       <motion.div 
         key={projectId || 'global'}
         initial={{ opacity: 0, scale: 0.98 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 1.02 }}
         transition={{ duration: 0.3 }}
         className={cn("flex flex-col h-full justify-start gap-4 p-4", isMobile && "p-1 pb-20")}
       >
          {/* TOP: Task Manager (Only in Detail View) */}
          {!isGlobalView && (
            <div className="h-auto max-h-[650px] 2xl:max-h-[70vh] flex flex-col bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-y-auto shadow-xl dark:shadow-2xl shrink-0 scrollbar-hide transition-colors">
      <div className={cn("p-4 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between bg-[#111b43] gap-4", isMobile && "px-4")}>
                <div className="flex items-center gap-6">
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                    <button 
                      onClick={() => setActiveView('INFRASTRUCTURE')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        activeView === 'INFRASTRUCTURE' ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md dark:shadow-lg dark:shadow-indigo-600/20" : "text-slate-500 hover:text-indigo-600 dark:hover:text-slate-300"
                      )}
                    >
                      Infrastructure Breakdown
                    </button>
                    <button 
                      onClick={() => setActiveView('SYSTEM_LOG')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        activeView === 'SYSTEM_LOG' ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md dark:shadow-lg dark:shadow-indigo-600/20" : "text-slate-500 hover:text-indigo-600 dark:hover:text-slate-300"
                      )}
                    >
                      System Log
                    </button>
                    <button 
                      onClick={() => setActiveView('HISTORY_EDIT')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        activeView === 'HISTORY_EDIT' ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md dark:shadow-lg dark:shadow-indigo-600/20" : "text-slate-500 hover:text-indigo-600 dark:hover:text-slate-300"
                      )}
                    >
                      History Edit
                    </button>
                  </div>

                  {/* GLOBAL STATUS HEADER DISPLAY */}
                  {!isGlobalView && currentProject?.status && (
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-950/50 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-500/30 shadow-sm dark:shadow-[0_0_15px_rgba(99,102,241,0.1)] animate-pulse transition-colors">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-0.5">Global Process Status</span>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none italic">
                          {currentProject.status}
                        </span>
                      </div>
                    </div>
                  )}

                   {currentProject && (
                    <div className="flex flex-wrap items-center gap-4 pl-4 border-l border-white/5">
                      <div className="flex flex-col">
                        <div className="flex flex-wrap items-center gap-3">
                           <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 shadow-inner group z-[100] relative pointer-events-auto transition-colors">
                              <div className="flex items-center gap-1">
                                <CustomDatePicker 
                                  selectedDate={displayStart}
                                  onChange={async (date) => {
                                    if (!date || !projectId) return;
                                    try {
                                      const { data, error } = await supabase
                                        .from('projects')
                                        .update({ start_date: date })
                                        .eq('id', projectId)
                                        .select()
                                        .single();

                                      if (error) throw error;
                                      
                                      if (data) {
                                        setProjects(prev => prev.map(p => p.id === projectId ? data : p));
                                      }

                                      await taskService.createProjectRescheduleLog({
                                        project_id: projectId,
                                        changed_by: user?.name || user?.email || 'User',
                                        old_start_date: displayStart,
                                        old_end_date: displayEnd,
                                        new_start_date: date,
                                        new_end_date: displayEnd,
                                        reason: 'Direct Header Adjustment'
                                      });
                                      onNotif?.("Project timeline updated!");
                                    } catch (err) {
                                      console.error("Failed to update project start date:", err);
                                    }
                                  }}
                                  className="bg-transparent text-[9px] sm:text-[10px] text-indigo-100 font-mono italic font-bold outline-none cursor-pointer hover:text-white transition-colors relative z-[110]"
                                />
                                <span className="text-slate-500 mx-0.5">-</span>
                                <CustomDatePicker 
                                  selectedDate={displayEnd}
                                  onChange={async (date) => {
                                    if (!date || !projectId) return;
                                    try {
                                      const { data, error } = await supabase
                                        .from('projects')
                                        .update({ end_date: date })
                                        .eq('id', projectId)
                                        .select()
                                        .single();

                                      if (error) throw error;

                                      if (data) {
                                        setProjects(prev => prev.map(p => p.id === projectId ? data : p));
                                      }

                                      await taskService.createProjectRescheduleLog({
                                        project_id: projectId,
                                        changed_by: user?.name || user?.email || 'User',
                                        old_start_date: displayStart,
                                        old_end_date: displayEnd,
                                        new_start_date: displayStart,
                                        new_end_date: date,
                                        reason: 'Direct Header Adjustment'
                                      });
                                      onNotif?.("Project timeline updated!");
                                    } catch (err) {
                                      console.error("Failed to update project end date:", err);
                                    }
                                  }}
                                  className="bg-transparent text-[9px] sm:text-[10px] text-indigo-100 font-mono italic font-bold outline-none cursor-pointer hover:text-white transition-colors relative z-[110]"
                                />
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                             {user && (
                               <button 
                                 onClick={() => onReschedule(currentProject)}
                                 className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg"
                                 title="Reschedule Project Timeline"
                               >
                                 <ArrowDown className="w-3.5 h-3.5 rotate-[-90deg]" />
                               </button>
                             )}
                             {user && (
                               <button 
                                 onClick={handleExportWBS}
                                 className="bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg border border-indigo-200 dark:border-indigo-500/20 transition-all shadow-sm dark:shadow-none"
                                 title="Export to Excel"
                               >
                                 <Download className="w-3.5 h-3.5" />
                               </button>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {activeView === 'INFRASTRUCTURE' && user && (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsEditWBSModalOpen(true)}
                      className="bg-[#2563EB] hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2 border border-blue-400/30"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Breakdown Timeline
                    </button>
                    <button 
                      onClick={handleAddInlineL1}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2 border border-indigo-400/30"
                    >
                      <Plus className="w-4 h-4" />
                      + Add New Phase (L1)
                    </button>
                  </div>
                )}
              </div>
              
              {!isGlobalView && currentProject && (
                <div className="px-5 py-4 bg-white/5 dark:bg-black/40 border-b border-slate-200 dark:border-white/5 transition-colors mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Detail Pengajuan Project (Summary)
                    </span>
                  </div>
                  <div className="w-full bg-[#0B1437] border border-white/10 rounded-xl p-4 min-h-[60px] flex items-start text-xs text-gray-300 font-medium italic leading-relaxed">
                    {currentProject.project_diajukan || "Belum ada detail pengajuan..."}
                  </div>
                </div>
              )}
              
              <div className="flex-1 overflow-auto scrollbar-hide bg-slate-950/40 relative">
                {activeView === 'INFRASTRUCTURE' ? (
                  isMobile ? (
                    <div className="flex-1 overflow-y-auto px-4 py-6">
                      <div className="space-y-4">
                        {projectTree.roots.map((root: any) => (
                          <MobileTaskCard 
                            key={`${root.id}-${revertCount}`}
                            task={root}
                            onToggleExpand={handleToggleExpand}
                            isExpanded={expandedRows.has(root.id)}
                            onUpdateTask={handleUpdateTask}
                            onDeleteTask={handleDeleteTask}
                            expandedRows={expandedRows}
                            revertCount={revertCount}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto scrollbar-hide">
                      <div className="min-w-[800px]">
                        <GanttTree 
                          user={user}
                          users={users}
                          roots={projectTree.roots} 
                          map={projectTree.map} 
                          tasks={filteredTasks}
                          projects={projects}
                          expandedRows={expandedRows}
                          revertCount={revertCount}
                          onToggleExpand={handleToggleExpand}
                          onUpdateTask={handleUpdateTask}
                          onOpenAudit={handleOpenAudit}
                          onDeleteTask={handleDeleteTask}
                          onAddSubTask={handleAddInlineL2}
                          disabled={false}
                          isMobile={isMobile}
                          setTasks={setTasks}
                        />
                      </div>
                    </div>
                  )
                ) : activeView === 'SYSTEM_LOG' ? (
                  <div className="p-8">
                     <SystemLogTable logs={systemLogs} />
                     <div className="mt-8 border-t border-white/5 pt-8">
                       <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Project Timeline Adjustment History</h4>
                       <AuditLogTable logs={rescheduleLogs} />
                     </div>
                  </div>
                ) : (
                  <div className="p-8">
                    <HistoryEditTable logs={historyLogs} users={users} />
                  </div>
                )}
              </div>
            </div>
          )}

         {/* Alternative TOP for Global View: Simple Legend / Filter */}
         {isGlobalView && (
           <div className="p-4 bg-slate-950/20 border-b border-slate-800/40 flex items-center justify-between rounded-2xl">
              <div>
                <h3 className="text-white font-black uppercase italic tracking-tighter text-lg">Om Dedy Timeline Overview</h3>
                
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500/40 border border-emerald-500 rounded" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Done</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500/40 border border-indigo-500 rounded" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500/40 border border-amber-500 rounded" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Review</span>
                </div>
              </div>
           </div>
         )}

         {/* BOTTOM: Temporal Visualizer */}
         <div className="flex-1 min-h-0 bg-[#020617] border-t border-slate-800/60 flex flex-col">
           <div className="p-4 flex items-center justify-between bg-slate-950/30">
             <div className="flex items-center gap-3">
               <LayoutGrid className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temporal Visualizer ({scale.charAt(0) + scale.slice(1).toLowerCase()} Resolution)</span>
             </div>
             <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 scale-90">
               {(['MONTH', 'WEEK', 'DAY'] as ViewScale[]).map((s, si) => (
                 <button
                   key={`detail-scale-${s}-${si}`}
                   onClick={() => setScale(s)}
                   className={cn(
                     "px-3 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all",
                     scale === s ? "bg-slate-800 text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-300"
                   )}
                 >
                   {s}
                 </button>
               ))}
             </div>
           </div>
           <div className="flex-1 overflow-auto bg-[#020617] scrollbar-hide relative border-t border-slate-800/40" ref={scrollRef}>
             <div className="flex min-w-[3600px] items-start h-full">
                <TemporalVisualizer 
                  user={user}
                  scale={scale} 
                  tasks={filteredTasks} 
                  projectId={projectId}
                  hierarchicalTasks={projectTree}
                  expandedRows={expandedRows}
                  onToggleExpand={handleToggleExpand}
                  setTasks={setTasks} 
                  projects={projects}
                  isGlobalView={isGlobalView}
                  onSetFocus={(id: string) => navigate(`/project/${id}`)}
                  isMobile={isMobile}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                />
             </div>
           </div>
         </div>
       </motion.div>
       </AnimatePresence>
    </div>
  );
}

// --- Anti-Stuttering Input Component ---
function LocalInput({ 
  value, 
  onChange, 
  className, 
  placeholder, 
  type = 'text',
  required = false,
  autoFocus = false,
  disabled = false,
  onFocus,
  onBlur
}: { 
  value: string, 
  onChange: (v: string) => void, 
  className?: string, 
  placeholder?: string,
  type?: string,
  required?: boolean,
  autoFocus?: boolean,
  disabled?: boolean,
  onFocus?: () => void,
  onBlur?: () => void
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);

  if (disabled) return <span className={cn(className, "opacity-70 cursor-default")}>{value || placeholder}</span>;

  return (
    <input 
      type={type}
      required={required}
      autoFocus={autoFocus}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onFocus={onFocus}
      onBlur={(e) => {
        if (local !== value) onChange(local);
        onBlur?.();
      }}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

function AddPersonnelModal({ 
  onClose, 
  onSuccess, 
  isAdmin,
  currentUserEmail
}: { 
  onClose: () => void, 
  onSuccess: () => void, 
  isAdmin: boolean,
  currentUserEmail: string
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    access_level: 'PIC',
    role: 'Staff',
    password: 'password123'
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await taskService.createUser(formData, currentUserEmail);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add personnel');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-[95%] max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 bg-slate-900/50">
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Onboard Personnel</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Register new PIC into the OD Ecosystem</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase rounded-xl tracking-wider">{error}</div>}
          
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Nama PIC</label>
            <LocalInput 
              required
              value={formData.name}
              onChange={v => setFormData({...formData, name: v})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all font-bold"
              placeholder="e.g., John Doe"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Email PIC</label>
            <LocalInput 
              required
              type="email"
              value={formData.email}
              onChange={v => setFormData({...formData, email: v})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all font-mono"
              placeholder="email@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Access Level</label>
              <select 
                value={formData.access_level}
                onChange={e => setFormData({...formData, access_level: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-indigo-400 outline-none focus:border-indigo-500 font-bold"
              >
                <option value="Superadmin">Superadmin</option>
                <option value="Admin">Admin</option>
                <option value="PIC">PIC</option>
                <option value="Developer">Developer</option>
                <option value="QA">QA</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Role (Text)</label>
              <LocalInput 
                value={formData.role}
                onChange={v => setFormData({...formData, role: v})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-bold"
                placeholder="Developer, QA, etc."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Security-Key</label>
            <LocalInput 
              required
              type="password"
              value={formData.password}
              onChange={v => setFormData({...formData, password: v})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-3 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
            >
              Onboard User
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function EditPersonnelModal({ 
  user,
  onClose, 
  onConfirmSave, 
  isAdmin,
  currentUserEmail
}: { 
  user: AppUser,
  onClose: () => void, 
  onConfirmSave: (data: Partial<AppUser>) => void, 
  isAdmin: boolean,
  currentUserEmail: string
}) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    access_level: user?.access_level || 'PIC',
    role: user.role || 'Staff',
    password: user.password || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-[95%] max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 bg-slate-900/50">
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Edit Personnel</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Modify credentials for {user.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Nama PIC</label>
            <LocalInput 
              required
              value={formData.name}
              onChange={v => setFormData({...formData, name: v})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all font-bold"
              placeholder="Full Name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Email PIC</label>
            <LocalInput 
              required
              type="email"
              value={formData.email}
              onChange={v => setFormData({...formData, email: v})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 outline-none focus:border-indigo-500 transition-all font-mono read-only:opacity-60"
              placeholder="email@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Access Level</label>
              <select 
                value={formData.access_level}
                disabled={!isAdmin}
                onChange={e => setFormData({...formData, access_level: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-indigo-400 outline-none focus:border-indigo-500 font-bold disabled:opacity-60"
              >
                <option value="Superadmin">Superadmin</option>
                <option value="Admin">Admin</option>
                <option value="PIC">PIC</option>
                <option value="Developer">Developer</option>
                <option value="QA">QA</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Role (Text)</label>
              <LocalInput 
                value={formData.role}
                onChange={v => setFormData({...formData, role: v})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-bold"
                placeholder="Developer, QA, etc."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Security-Key</label>
            <LocalInput 
              type="password"
              value={formData.password}
              onChange={v => setFormData({...formData, password: v})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-3 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20 transition-all font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              Update Data
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function RescheduleRequestsView({ requests, onRefresh, user, isLoading, isMobile }: { requests: any[], onRefresh: () => void, user: any, isLoading?: boolean, isMobile?: boolean }) {
  const [confirmData, setConfirmData] = useState<{ id: string, status: 'Approved' | 'Rejected' } | null>(null);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    onRefresh();
  }, []);

  const isAdminAccess = useMemo(() => {
    if (!user) return false;
    const level = user.access_level?.toLowerCase() || '';
    return level.includes('admin');
  }, [user]);

  if (!user || !isAdminAccess) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-black text-white uppercase italic">Unauthorized Access</h2>
          <p className="text-slate-500">You do not have permission to access the Approval Menu.</p>
        </div>
      </div>
    );
  }

  const handleAction = async () => {
    if (!confirmData) return;
    try {
      await taskService.updateRescheduleRequestStatus(confirmData.id, confirmData.status, user.email || 'Admin');
      onRefresh();
    } catch (err) { 
      alert('Gagal memproses approval'); 
    } finally {
      setConfirmData(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await taskService.deleteRescheduleRequest(deleteId, user.email || 'Admin');
      onRefresh();
    } catch (err) {
      alert('Gagal menghapus request');
    } finally {
      setDeleteId(null);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const historyRequests = requests.filter(r => r.status !== 'Pending');
  const currentRequests = activeTab === 'PENDING' ? pendingRequests : historyRequests;

  return (
    <div className={cn("space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col", isMobile ? "px-1" : "px-0")}>
      <ConfirmModal 
        isOpen={!!confirmData}
        onClose={() => setConfirmData(null)}
        onConfirm={handleAction}
        title={confirmData?.status === 'Approved' ? "Setujui Request?" : "Tolak Request?"}
        description={confirmData?.status === 'Approved' 
          ? "Jadwal personel akan diperbarui secara otomatis di sistem." 
          : "Permohonan reschedule ini akan ditolak dan personel akan diberitahu."}
        variant={confirmData?.status === 'Approved' ? 'primary' : 'danger'}
        confirmText={confirmData?.status === 'Approved' ? "Approve" : "Reject"}
      />

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus History Request?"
        description="Data ini akan dihapus permanen dari audit trail reschedule."
        variant="danger"
        confirmText="Hapus Permanen"
      />

      <div className={cn("flex flex-wrap items-center justify-between gap-6", isMobile && "flex-col items-start")}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
            <History className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h2 className={cn("font-black text-white tracking-tighter italic uppercase", isMobile ? "text-xl" : "text-2xl")}>APPROVAL MENU</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Status Change Requests</p>
          </div>
        </div>

        <div className={cn("flex items-center gap-3", isMobile && "w-full overflow-x-auto pb-2 scrollbar-hide")}>
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all disabled:opacity-50 flex-shrink-0"
            title="Refresh Requests"
          >
            <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
          </button>

          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5 flex-shrink-0">
            <button 
              onClick={() => setActiveTab('PENDING')}
              className={cn(
                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'PENDING' ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20" : "text-slate-500 hover:text-slate-300",
                isMobile && "px-3"
              )}
            >
              Pending
              <span className="bg-black/40 px-1.5 py-0.5 rounded-md text-[8px]">{pendingRequests.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('HISTORY')}
              className={cn(
                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'HISTORY' ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300",
                isMobile && "px-3"
              )}
            >
              History
            </button>
          </div>
        </div>
      </div>

      <div className={cn("flex-1 overflow-y-auto pr-2 scrollbar-hide", isMobile ? "px-0" : "pr-4")}>
        {isLoading ? (
          <div className="h-full bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 text-center">
             <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
             <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Fetching requests...</p>
          </div>
        ) : currentRequests.length === 0 ? (
          <div className="h-full bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 text-center">
            <History className="w-16 h-16 text-slate-700 mx-auto" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">No {activeTab === 'PENDING' ? 'Pending' : 'Resolved'} Requests</p>
          </div>
        ) : (
          <div className={cn("grid grid-cols-1 gap-6 pb-20", !isMobile && "md:grid-cols-2 lg:grid-cols-3")}>
            {currentRequests.map((req: any, i: number) => {
              return (
                <div key={getSafeKey(req, i, 'request')} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-5 hover:border-indigo-500/30 transition-all shadow-xl group relative">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-black text-white italic tracking-tight">{req.pic_name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{req.schedule_date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border",
                      req.status === 'Approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      req.status === 'Rejected' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                      "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {req.status}
                    </div>
                    {activeTab === 'HISTORY' && (
                      <button 
                        onClick={() => setDeleteId(req.id)}
                        className={cn("p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all", isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                    <div className="flex-1 text-center">
                      <p className="text-[8px] text-slate-600 font-bold uppercase mb-1">From</p>
                      <span className="text-[10px] font-black text-slate-500">{req.original_status || 'KOSONG'}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-700" />
                    <div className="flex-1 text-center">
                      <p className="text-[8px] text-indigo-500 font-bold uppercase mb-1">To</p>
                      <span className="text-[10px] font-black text-indigo-400">{req.new_status}</span>
                    </div>
                  </div>

                  {req.swap_date && (
                    <div className="flex items-center gap-3 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <div>
                        <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Two-Way Swap</p>
                        <p className="text-[9px] text-slate-400 font-bold truncate">Swap with {req.swap_date}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-950/30 rounded-2xl border border-white/5 h-20 overflow-y-auto">
                  <p className="text-[8px] text-slate-600 font-bold uppercase mb-1">Reason</p>
                  <p className="text-xs text-slate-400 italic font-medium leading-relaxed">"{req.reason}"</p>
                </div>

                {activeTab === 'HISTORY' && (
                  <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">Processed By</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{req.processed_by || 'Admin'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">Action Date</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                        {req.updated_at ? format(new Date(req.updated_at), 'dd/MM/yy HH:mm') : '-'}
                      </p>
                    </div>
                  </div>
                )}

                {req.status === 'Pending' && (
                  <div className="pt-2 flex gap-3 text-xs">
                    <button 
                      onClick={() => setConfirmData({ id: req.id, status: 'Rejected' })}
                      className="flex-1 py-4 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => setConfirmData({ id: req.id, status: 'Approved' })}
                      className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                    >
                      Approve
                    </button>
                  </div>
                )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectDetailWrapper(props: any) {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <GanttDetailView 
      {...props} 
      projectId={id} 
      setFocusedProjectId={(pid: string) => navigate(`/project/${pid}`)} 
    />
  );
}

function MasterProjectPlaceholder() {
  return null;
}

function MasterProjectViewLegacy({ user, isMobile }: { user: any, isMobile?: boolean }) {
  return <MasterProjectHub user={user} isMobile={isMobile} />;
}

function AuditLogView({ logs, projects, users, isMobile }: { logs: AuditLog[], projects: Project[], users: AppUser[], isMobile?: boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter(log => {
    const actorName = users.find(u => u.email === log.actor)?.name || log.actor || 'System';
    const matchesActor = actorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || (log.created_at && log.created_at.startsWith(dateFilter));
    return matchesActor && matchesDate;
  });

  return (
    <div className={cn("space-y-6 h-full flex flex-col", isMobile ? "px-2" : "px-0")}>
      <div className={cn("flex flex-wrap items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800", isMobile && "flex-col")}>
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Personnel..."
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-all font-bold"
          />
        </div>
        <div className={cn("flex items-center gap-3", isMobile && "w-full justify-between")}>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filter Date</label>
          <CustomDatePicker 
            selectedDate={dateFilter}
            onChange={setDateFilter}
          />
        </div>
      </div>

      <div className={cn("bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col flex-1", !isMobile && "max-h-[calc(100vh-300px)]")}>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isMobile ? (
            <div className="divide-y divide-slate-800/50">
              {filteredLogs.map((log, i) => {
                const project = projects.find(p => p.id === log.project_id);
                const actorUser = users.find(u => u.email === log.actor);
                return (
                  <div key={getSafeKey(log, i, 'audit-mobile')} className="p-4 space-y-3 hover:bg-white/[0.01]">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-black text-[10px] text-indigo-400">
                          {actorUser?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-200">{actorUser?.name || log.actor || 'System'}</p>
                          <p className="text-[9px] text-slate-500 italic font-mono">
                            {log.created_at ? format(new Date(log.created_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                        log.action?.includes('Create') ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        log.action?.includes('Delete') ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                        "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      )}>
                        {log.action}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-1">Project mapping</p>
                      <p className="text-[10px] text-indigo-400 font-black truncate">{project?.project_name || 'System Wide'}</p>
                    </div>
                    <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 flex justify-between items-center group">
                      <p className="text-[11px] text-slate-400 italic leading-relaxed line-clamp-2 grow mr-4">{(log as any).details || 'N/A'}</p>
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="p-2 bg-indigo-600 rounded-lg text-white"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10 bg-[var(--bg-main)] shadow-sm">
                <tr className="border-b border-[var(--border-color)]">
                  <th className="px-6 py-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="px-6 py-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest leading-none">Actor (Name)</th>
                  <th className="px-6 py-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest leading-none">Project Mapping</th>
                  <th className="px-6 py-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest leading-none">Operational Action</th>
                  <th className="px-6 py-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest text-right leading-none">Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-[12px] text-slate-400">
                {filteredLogs.map((log, i) => {
                  const project = projects.find(p => p.id === log.project_id);
                  const actorUser = users.find(u => u.email === log.actor);
                  return (
                    <tr key={getSafeKey(log, i, 'audit-table')} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-500 whitespace-nowrap italic">
                          {log.created_at ? format(new Date(log.created_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-black text-[9px] text-indigo-400">
                              {actorUser?.name?.charAt(0) || 'S'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-200 tracking-tight leading-none mb-1">{actorUser?.name || log.actor || 'System'}</span>
                              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{log.actor}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-indigo-400/90 tracking-tight">{project?.project_name || 'System Wide'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              log.action?.includes('Create') ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                              log.action?.includes('Delete') ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" :
                              "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                            )} />
                            <span className="font-bold uppercase tracking-widest text-[9px] text-slate-500">{log.action}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setSelectedLog(log)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-tighter italic transition-colors underline underline-offset-4 decoration-indigo-500/30"
                          >
                            View detail log
                          </button>
                        </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Payload Analysis</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 truncate max-w-[200px]">ID: {selectedLog.id}</p>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-4 sm:p-8 overflow-y-auto bg-slate-950/50 grow">
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] px-2 block border-l-2 border-indigo-500">Field Comparison Logic</label>
                  <div className="grid grid-cols-[1fr_2fr] gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[9px] font-bold text-slate-500 uppercase">Property</div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[9px] font-bold text-slate-500 uppercase">Transition</div>
                  </div>
                  {Object.keys({ ...(selectedLog.old_payload || {}), ...(selectedLog.new_payload || {}) }).map((key, ki) => {
                    if (['updated_at', 'id', 'created_at', 'project_id', 'task_id', 'user_id', 'created_by_name'].includes(key)) return null;

                    const oldVal = (selectedLog.old_payload as any)?.[key];
                    const newVal = (selectedLog.new_payload as any)?.[key];
                    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) return null;

                    const formatVal = (v: any) => {
                      if (v === null || v === undefined) return 'None';
                      if (typeof v === 'string') return v;
                      return JSON.stringify(v);
                    };

                    return (
                      <div key={`log-detail-payload-${key}-${ki}`} className="grid grid-cols-[100px_1fr] sm:grid-cols-[150px_1fr] gap-4 items-center py-3 border-b border-white/5">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider break-words">{key.replace(/_/g, ' ')}</div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 overflow-hidden">
                           <div className="line-through text-rose-500/60 text-[10px] font-medium truncate">{formatVal(oldVal)}</div>
                           <div className="text-slate-700 font-bold hidden sm:block">➔</div>
                           <div className="text-emerald-400 text-[11px] font-black italic break-words">{formatVal(newVal)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DeferredTextarea = ({ value, onSave, className, placeholder, disabled, debounceMs }: { value: string, onSave: (v: string) => void, className?: string, placeholder?: string, disabled?: boolean, debounceMs?: number }) => {
  const [local, setLocal] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!isFocused) setLocal(value);
  }, [value, isFocused]);

  const handleSave = (val: string) => {
    if (val !== value) onSave(val);
  };

  if (disabled) return <div className={cn(className, "opacity-70 text-[8px] overflow-hidden")}>{value || placeholder}</div>;

  return (
    <textarea 
      value={local}
      onFocus={() => setIsFocused(true)}
      onChange={(e) => {
        const val = e.target.value;
        setLocal(val);
        if (debounceMs) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            handleSave(val);
          }, debounceMs);
        }
      }}
      onBlur={() => { 
        setIsFocused(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        handleSave(local); 
      }}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};
function SystemLogTable({ logs }: { logs: AuditLog[] }) {
  if (!logs || logs.length === 0) {
    return <div className="text-center py-10 text-slate-500 font-bold uppercase text-[10px] tracking-widest border border-dashed border-slate-800 rounded-2xl">No system logs recorded</div>;
  }
  return (
    <div className="overflow-hidden bg-white dark:bg-[#0b1120] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Action</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Auth By</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight group-hover:text-indigo-500 transition-colors">{log.action || 'INTERNAL OPERATION'}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-widest">
                    {log.actor || 'SYSTEM'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 font-bold">
                    {log.created_at ? format(new Date(log.created_at), 'dd/MM/yy HH:mm') : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HistoryEditTable({ logs, users }: { logs: HistoryEditProject[], users: AppUser[] }) {
  if (!logs || logs.length === 0) {
    return <div className="text-center py-10 text-slate-500 font-bold uppercase text-[10px] tracking-widest border border-dashed border-slate-800 rounded-2xl">No user edits recorded</div>;
  }
  return (
    <div className="overflow-hidden bg-white dark:bg-[#0b1120] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest w-[150px]">PIC Name</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center w-[120px]">Date</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest w-[150px]">Field Name</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Before</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">After</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map((log) => {
              const actorName = users.find(u => u.email === log.pic_name)?.name || log.pic_name;
              
              return (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                        <UserIcon className="w-3 h-3 text-indigo-500" />
                      </div>
                      <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight">{actorName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 font-bold">
                      {log.created_at ? format(new Date(log.created_at), 'dd/MM/yy') : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">{log.field_name}</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="max-w-[200px] truncate text-[10px] text-rose-500/60 line-through italic">
                       {log.before_value}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="max-w-[200px] truncate text-[10px] text-emerald-500 font-bold italic">
                       {log.after_value}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditLogTable({ logs }: { logs: ProjectRescheduleLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3 border-2 border-dashed border-slate-800 rounded-3xl">
        <History className="w-8 h-8 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest">No Reschedule Events Logged</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white dark:bg-[#0b1120] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Timestamp</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Authorized By</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Previous Timeline</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Target Timeline</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Reason / Justification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map((log, i) => (
              <tr key={getSafeKey(log, i, 'resched-log')} className="hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600 dark:text-gray-200 font-mono italic">{format(new Date(log.created_at), 'MMM dd, yyyy')}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">{format(new Date(log.created_at), 'HH:mm:ss')}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-500 dark:text-indigo-400">
                      {log.changed_by?.charAt(0) || 'A'}
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{log.changed_by}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col items-center gap-1 opacity-50">
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">{log.old_start_date}</span>
                      <ArrowDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">{log.old_end_date}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black font-mono">{log.new_start_date}</span>
                      <ArrowDown className="w-3 h-3 text-indigo-500" />
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black font-mono">{log.new_end_date}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                  <div className="p-3 bg-gray-50 dark:bg-slate-950/50 rounded-xl border border-gray-100 dark:border-white/5 max-w-md">
                     <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic">"{log.reason}"</p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GanttTree({ user, users, roots, map, tasks, projects, expandedRows, onToggleExpand, onUpdateTask, onOpenAudit, onAddSubTask, onDeleteTask, disabled, isMobile, revertCount, setTasks }: any) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
       const activeId = active.id as string;
       const overId = over.id as string;
       
       const activeTask = tasks.find((t: any) => t.id === activeId);
       if (!activeTask || !activeTask.parent_id) return;
       
       const parentId = activeTask.parent_id;

       // Get siblings of the dragged task
       const siblings = tasks
         .filter((t: any) => t.parent_id === parentId)
         .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));

       const oldIndex = siblings.findIndex(t => t.id === activeId);
       const newIndex = siblings.findIndex(t => t.id === overId);

       if (newIndex === -1) return; // Dropped over something not a sibling

       const newOrder = arrayMove(siblings, oldIndex, newIndex);

       // Update all tasks locally with new sort_order for the siblings
       const updatedTasks = tasks.map((t: any) => {
         const moveIndex = newOrder.findIndex((no: any) => no.id === t.id);
         if (moveIndex !== -1) {
            return { ...t, sort_order: moveIndex };
         }
         return t;
       });
       
       setTasks(updatedTasks);

       // Silent DB sync for only the affected siblings using individual updates to avoid not-null constraint issues
       try {
         const updatePromises = newOrder.map((t: any, idx: number) => 
           supabase
             .from('tasks')
             .update({ 
               sort_order: idx,
               updated_at: new Date().toISOString()
             })
             .eq('id', t.id)
         );

         const results = await Promise.all(updatePromises);
         const firstError = results.find(res => res.error)?.error;

         if (firstError) throw firstError;
       } catch (err) {
         console.error("Sort order sync failed:", err);
         toast.error("Failed to save task order. Keeping local reorder for now.");
       }
    }
  };

  const SortableTaskRow = ({ task, level, index, parentTask }: any) => {
    const isExpanded = expandedRows.has(task.id);
    const children = task.children || [];
    const isProject = !!task.isProject;
    const health = getTaskHealth(task);
    const proj = projects.find((p: any) => p.id === task.project_id) || (isProject ? task : null);
    
    const currentUser = user?.name || '';
    const projectPic = proj?.pic_name || '';
    const isAdmin = user?.access_level?.toLowerCase() === 'admin' || user?.access_level?.toLowerCase() === 'superadmin';
    const isOwner = canEditTask(currentUser, projectPic);
    const hasControl = isOwner || isAdmin;

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ 
      id: task.id, 
      disabled: level === 0 || !user || user.access_level === 'Viewer'
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 50 : 'auto',
      position: 'relative' as any,
    };

    return (
      <React.Fragment>
        <tr 
          ref={setNodeRef}
          style={style}
          onClick={() => !isProject && children.length > 0 && onToggleExpand(task.id)}
          className={cn(
            "border-b border-[var(--border)] transition-all group cursor-pointer hover:bg-[var(--bg-page)] relative",
            level === 0 ? "bg-[var(--bg-page)]/40 text-sm font-black uppercase" : "bg-[var(--bg-card)]",
            level === 1 && isExpanded ? "bg-[var(--bg-page)]" : "hover:bg-[var(--bg-page)]/60",
            health === 'OVERDUE' && "border-l-4 border-l-[var(--danger)] bg-[var(--danger)]/10",
            health === 'OVER SLA' && "border-l-4 border-l-[var(--warning)] bg-[var(--warning)]/10",
            !hasControl && "hover:bg-[var(--warning)]/5 transition-colors",
            isDragging && "shadow-2xl bg-indigo-500/10 z-50 ring-2 ring-indigo-500/30"
          )}
        >
          <td className="px-6 py-4 align-top">
            <div className={cn(
              "flex items-start gap-3",
              level === 1 ? "pl-10" : level > 1 ? "pl-16" : "pl-0"
            )}>
              {level === 1 && hasControl && (
                <div 
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-indigo-400 z-50 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
              )}
              {!hasControl && (
                <div className="absolute left-1 top-4 text-amber-500/40 group-hover:text-amber-500 transition-colors" title={`Milik PIC ${proj?.pic_name}`}>
                  <ShieldAlert className="w-3 h-3" />
                </div>
              )}
              {(isProject || children.length > 0) && (
                <span className="text-cyan-400 font-mono w-4 flex items-center justify-center shrink-0 mt-0.5" onClick={(e) => { e.stopPropagation(); onToggleExpand(task.id); }}>
                  {isExpanded ? "▼" : "▶"}
                </span>
              )}
              {isProject ? (
                <FolderKanban className="w-5 h-5 text-indigo-400 shrink-0" />
              ) : level > 0 ? (
                <span className="text-cyan-500 font-black text-xl select-none leading-none shrink-0">↳</span>
              ) : (
                <Layers className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-[250px] whitespace-normal break-words" onClick={e => e.stopPropagation()}>
                <div className="flex items-start gap-2 flex-wrap">
                  {task.custom_id && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border)] text-[8px] font-black text-[var(--text-sub)] font-mono tracking-tighter shadow-sm select-none mt-0.5">
                      {task.custom_id}
                    </span>
                  )}
                  {!isProject && (task.level === 1 || level === 0) ? (
                    <L1PhaseSelector 
                      value={task.title}
                      onChange={(v) => onUpdateTask(task.id, 'title', v)}
                      disabled={disabled}
                      className={cn(
                        "bg-transparent border-none p-0 text-[var(--text-main)] font-semibold italic text-sm tracking-tight hover:bg-[var(--bg-page)] rounded px-2 focus:ring-1 focus:ring-[var(--accent)] min-w-[100px] whitespace-normal break-words leading-relaxed",
                        disabled && "opacity-80"
                      )}
                    />
                  ) : (
                    <DeferredTextarea 
                      value={task.title} 
                      onSave={(v) => onUpdateTask(task.id, 'title', v)}
                      className={cn(
                        "bg-transparent outline-none border-none focus:ring-1 focus:ring-emerald-500 w-full whitespace-normal break-words leading-relaxed resize-none min-h-[1.5em]",
                        isProject ? "text-base font-bold uppercase text-[var(--text-main)] tracking-tight" : 
                        "text-[var(--text-main)] text-xs font-medium tracking-wider"
                      )}
                      placeholder="Enter the task breakdown name..."
                      disabled={disabled}
                    />
                  )}
                  <HealthBadge health={health} />
                  {task.task_type && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                      task.task_type === 'Improvement' 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                        : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                    )}>
                      {task.task_type}
                    </span>
                  )}
                  {task.components && task.components.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.components.map((c: string) => (
                        <span key={c} className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[7px] font-black uppercase tracking-widest rounded border border-white/5">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  {task.detail_task && (
                    <div className="relative group/info">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleExpand(`info-${task.id}`);
                        }}
                        className={cn(
                          "p-1 rounded-full transition-all flex items-center justify-center",
                          expandedRows.has(`info-${task.id}`) 
                            ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                            : "bg-slate-800 text-indigo-400 hover:bg-indigo-500 hover:text-white"
                        )}
                      >
                        <Info className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-full mb-2 hidden group-hover/info:block w-max max-w-xs bg-slate-900 border border-indigo-500/30 text-indigo-100 text-[10px] rounded p-2 z-[100] shadow-xl font-medium tracking-tight">
                        Click to view Full Technical Detail & Breakdown
                      </div>
                    </div>
                  )}
                  {(() => {
                    const conflict = level > 0 && parentTask && isWBSConflict(parentTask, task);
                    return (
                        <div className="flex items-center gap-1">
                          {conflict && (
                            <div className="relative group/conflict inline-flex items-center justify-center ml-1">
                              <div className="text-amber-500 animate-pulse cursor-help">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                              <div className="absolute bottom-full mb-2 hidden group-hover/conflict:block w-max max-w-xs bg-slate-900 border border-amber-500/30 text-amber-200 text-[9px] rounded p-2 z-[100] shadow-xl font-bold uppercase tracking-widest leading-tight">
                                OUTSIDE PARENT RANGE: Tanggal di luar jadwal task utama!
                              </div>
                            </div>
                          )}
                        </div>
                    );
                  })()}
                </div>
                {level === 0 && !isProject && (() => {
                    const children = map.get(task.id) || [];
                    if (children.length > 0) {
                      const capacity = task.man_hours || 0;
                      const used = children.reduce((sum: number, c: any) => sum + (c.man_hours || 0), 0);
                      if (used > capacity) return <span className="text-[7px] font-black text-rose-500 uppercase mt-0.5">⚠️ Over-Allocated</span>;
                      if (used < capacity) return <span className="text-[7px] font-black text-amber-500 uppercase mt-0.5">⚠️ Under-Allocated</span>;
                      return <span className="text-[7px] font-black text-emerald-500 uppercase mt-0.5">✅ Alokasi Pas</span>;
                    }
                    return null;
                })()}
              </div>
            </div>
          </td>
          <td className="px-2 py-4 text-center align-top">
             <div className="flex flex-col items-center gap-1" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  <EditableInput 
                    type="number"
                    value={(task.man_hours || 0).toString()} 
                    onSave={(v) => onUpdateTask(task.id, 'man_hours', parseFloat(v) || 0)}
                    className="w-12 bg-[var(--bg-card)] text-[10px] text-center rounded border border-[var(--border)] text-[var(--accent)] font-black"
                    disabled={disabled}
                  />
                  <span className="text-[8px] text-[var(--text-sub)] font-bold">h</span>
                </div>
                <div className="text-[7px] text-[var(--text-sub)] font-black uppercase tracking-tighter bg-[var(--bg-page)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                  {formatWorkday(task.man_hours || 0)}
                </div>
             </div>
          </td>
          <td className="px-4 py-4 align-top" onClick={e => e.stopPropagation()}>
            <EditableInput 
              value={task.assignee || ''} 
              onSave={(v) => onUpdateTask(task.id, 'assignee', v)}
              className="bg-[var(--bg-card)] text-[10px] font-bold text-center p-1 rounded border border-[var(--border)] text-[var(--text-main)] outline-none focus:border-[var(--accent)] w-full"
              placeholder="PIC"
              disabled={disabled}
            />
          </td>
          <td className="px-4 py-4 bg-[var(--accent)]/5 align-top" onClick={e => e.stopPropagation()}>
            <CustomDatePicker 
              selectedDate={task.realized_finish_date ? format(new Date(task.realized_finish_date), 'yyyy-MM-dd') : ''}
              onChange={(date) => {
                const val = date ? new Date(`${date}T17:00:00`).toISOString() : null;
                onUpdateTask(task.id, 'realized_finish_date', val);
              }}
              className="bg-transparent border-none text-[10px] text-[var(--text-main)] font-mono text-center w-full outline-none focus:ring-1 focus:ring-[var(--accent)] rounded"
              disabled={disabled}
            />
          </td>
          <td className="px-2 py-4 align-top" onClick={e => e.stopPropagation()}>
            {level > 0 && (
              <EditableInput 
                value={task.dev_name || ''} 
                onSave={(v) => onUpdateTask(task.id, 'dev_name', v)}
                debounceMs={800}
                className="bg-[var(--bg-page)] border border-[var(--border)] text-[10px] px-1.5 py-1 rounded text-[var(--accent)] text-center hover:border-[var(--accent)] transition-all font-mono w-full"
                placeholder="Dev"
                disabled={disabled}
              />
            )}
          </td>
          <td className="px-2 py-4 align-top" onClick={e => e.stopPropagation()}>
            {level > 0 && (
              <EditableInput 
                value={task.qa_name || ''} 
                onSave={(v) => onUpdateTask(task.id, 'qa_name', v)}
                debounceMs={800}
                className="bg-[var(--bg-page)] border border-[var(--border)] text-[10px] px-1.5 py-1 rounded text-purple-400 text-center hover:border-purple-500 transition-all font-mono w-full"
                placeholder="QA"
                disabled={disabled}
              />
            )}
          </td>
          <td className="px-1 py-4 text-center cursor-pointer hover:bg-[var(--bg-card)] transition-all group/date relative align-top" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center">
              <CustomDatePicker 
                selectedDate={task.start_time ? format(new Date(task.start_time), "yyyy-MM-dd") : ''}
                onChange={(date) => {
                  onUpdateTask(task.id, 'start_time', date ? new Date(date).toISOString() : null);
                }}
                minDate={proj?.start_date ? new Date(proj.start_date) : undefined}
                maxDate={task.end_time ? new Date(task.end_time) : (parentTask?.end_time ? new Date(parentTask.end_time) : (proj?.end_date ? new Date(proj.end_date) : undefined))}
                className="bg-[var(--bg-page)] border border-[var(--border)] text-[10px] text-[var(--text-main)] font-mono focus:text-[var(--accent)] outline-none w-full text-center cursor-pointer font-bold rounded px-1 py-0.5"
                disabled={disabled}
              />
              <span className="text-[7px] text-[var(--accent)] font-black uppercase opacity-0 group-hover/date:opacity-100 transition-all absolute -top-1">Start</span>
            </div>
          </td>
          <td className="px-1 py-4 text-center cursor-pointer hover:bg-[var(--bg-card)] transition-all group/date relative align-top" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center">
              <CustomDatePicker 
                selectedDate={task.end_time ? format(new Date(task.end_time), "yyyy-MM-dd") : ''}
                onChange={(date) => {
                  onUpdateTask(task.id, 'end_time', date ? new Date(date).toISOString() : null);
                }}
                minDate={task.start_time ? new Date(task.start_time) : (proj?.start_date ? new Date(proj.start_date) : undefined)}
                maxDate={parentTask?.end_time ? new Date(parentTask.end_time) : (proj?.end_date ? new Date(proj.end_date) : undefined)}
                className="bg-[var(--bg-page)] border border-[var(--border)] text-[10px] text-[var(--text-main)] font-mono focus:text-[var(--accent)] outline-none w-full text-center cursor-pointer font-bold rounded px-1 py-0.5"
                disabled={disabled}
              />
              <span className="text-[7px] text-[var(--accent)] font-black uppercase opacity-0 group-hover/date:opacity-100 transition-all absolute -top-1">End</span>
            </div>
          </td>
          <td className="px-4 py-4 align-top" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center">
              <TaskStatusSelector 
                status={task.status || TaskStatus.TODO} 
                onUpdate={(v) => onUpdateTask(task.id, 'status', v)} 
                disabled={disabled}
              />
            </div>
          </td>
          <td className="px-4 py-4 align-top" onClick={e => e.stopPropagation()}>
             <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[var(--bg-page)]/50 rounded-lg border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-colors">
                <div className="flex flex-col gap-0.5 min-w-[50px]">
                   <ApprovalBadge value={task.approval_fachrul} label="Fachrul" onUpdate={(v) => onUpdateTask(task.id, 'approval_fachrul', v)} disabled={disabled} />
                </div>
                <DeferredTextarea 
                   value={task.suggestion_fachrul || ''}
                   onSave={(v) => onUpdateTask(task.id, 'suggestion_fachrul', v)}
                   debounceMs={500}
                   className="bg-[var(--bg-page)] border border-[var(--border)] rounded px-2 py-1 text-[9px] text-[var(--text-main)] focus:ring-1 focus:ring-[var(--accent)] outline-none w-full min-h-[32px] resize-none scrollbar-hide font-medium"
                   placeholder="..."
                   disabled={disabled}
                />
             </div>
          </td>
          <td className="px-4 py-4 align-top" onClick={e => e.stopPropagation()}>
             <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[var(--bg-page)]/50 rounded-lg border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-colors">
                <div className="flex flex-col gap-0.5 min-w-[50px]">
                   <ApprovalBadge value={task.approval_barra} label="Barra" onUpdate={(v) => onUpdateTask(task.id, 'approval_barra', v)} disabled={disabled} />
                </div>
                <DeferredTextarea 
                   value={task.suggestion_barra || ''}
                   onSave={(v) => onUpdateTask(task.id, 'suggestion_barra', v)}
                   debounceMs={500}
                   className="bg-[var(--bg-page)] border border-[var(--border)] rounded px-2 py-1 text-[9px] text-[var(--text-main)] focus:ring-1 focus:ring-[var(--accent)] outline-none w-full min-h-[32px] resize-none scrollbar-hide font-medium"
                   placeholder="..."
                   disabled={disabled}
                />
             </div>
          </td>
          <td className="px-6 py-4 text-right align-top">
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              {!isProject && level === 0 && user && (
                <button 
                  onClick={() => onAddSubTask(task.id)}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded shadow-lg shadow-indigo-500/20 transition-all border border-white/10 active:scale-95"
                >
                  + Sub-task
                </button>
              )}
              <button 
                onClick={() => onOpenAudit(task)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-indigo-400 rounded-lg transition-all border border-slate-700"
              >
                <History className="w-3.5 h-3.5" />
              </button>
              {user && (
                <button 
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-600 hover:text-rose-500 rounded-lg transition-all border border-slate-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </td>
        </tr>
        
        <AnimatePresence>
          {expandedRows.has(`info-${task.id}`) && (
            <motion.tr 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-indigo-500/5 border-b border-indigo-500/10"
            >
              <td colSpan={12} className="px-12 py-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    <Database className="w-3.5 h-3.5" />
                    Full Technical Detail & Execution Breakdown
                  </div>
                  <DeferredTextarea 
                    value={task.detail_task || ''}
                    onSave={(v) => onUpdateTask(task.id, 'detail_task', v)}
                    className="w-full bg-slate-900/50 border border-indigo-500/20 rounded-xl p-4 text-xs text-slate-300 outline-none focus:border-indigo-500/50 transition-all font-medium leading-relaxed min-h-[120px]"
                    placeholder="Masukkan detail teknis pengerjaan atau breakdown di sini..."
                  />
                </div>
              </td>
            </motion.tr>
          )}
        </AnimatePresence>
      </React.Fragment>
    );
  };

  const renderTaskRows = (task: any, level: number = 0, index: number = 0, parentTask: any = null) => {
    if (!task) return null;
    const isExpanded = expandedRows.has(task.id);
    const children = task.children || [];
    
    // THE "REORDER" FIX: Always sort children by sort_order for consistent display
    const sortedChildren = [...children].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));

    return (
      <React.Fragment key={`${task.id}-${index}-${revertCount}`}>
        <SortableTaskRow 
          task={task} 
          level={level} 
          index={index} 
          parentTask={parentTask} 
        />
        
        {isExpanded && sortedChildren.length > 0 && (() => {
          // Unique children guard
          const uniqueChildren = sortedChildren.filter((v: any, i: number, a: any[]) => !!v && a.findIndex(t => t.id === v.id) === i);
          
          if (level === 0) {
            // L2 children of an L1 parent get a SortableContext for reordering
            return (
              <SortableContext items={uniqueChildren.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {uniqueChildren.map((sub: any, sidx: number) => (
                  <React.Fragment key={`${sub.id}-${sidx}`}>
                    {renderTaskRows(sub, level + 1, sidx, task)}
                  </React.Fragment>
                ))}
              </SortableContext>
            );
          } else {
            // L3+ children just render normally (reordering not requested for deeper levels)
            return uniqueChildren.map((sub: any, sidx: number) => (
              <React.Fragment key={`${sub.id}-${sidx}`}>
                {renderTaskRows(sub, level + 1, sidx, task)}
              </React.Fragment>
            ));
          }
        })()}
      </React.Fragment>
    );
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <table className={cn("w-full text-left border-collapse", isMobile ? "min-w-[1000px]" : "min-w-[1600px]")}>
          <thead className="sticky top-0 z-40 bg-[var(--bg-page)] border-b border-[var(--border)]">
            <tr className="shadow-sm">
              <th className="px-6 py-4 text-[9px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] min-w-[300px]">Hierarchy & Governance</th>
              <th className="px-2 py-4 text-[9px] font-black text-[var(--accent)] uppercase tracking-widest text-center w-24">Man-Hours</th>
              <th className="px-4 py-4 text-[9px] font-black text-[var(--text-main)] uppercase tracking-widest w-40 text-center">PIC</th>
              <th className="px-4 py-4 text-[9px] font-black text-[var(--text-main)] uppercase tracking-widest w-32 text-center bg-blue-500/5">Realized Finish</th>
              <th className="px-2 py-4 text-[9px] font-black text-[var(--text-main)] uppercase tracking-widest w-24 text-center">Dev</th>
              <th className="px-2 py-4 text-[9px] font-black text-[var(--text-main)] uppercase tracking-widest w-24 text-center">QA</th>
              <th className="px-4 py-4 text-[9px] font-black text-[var(--text-main)] uppercase tracking-widest w-24 text-center">Start</th>
              <th className="px-4 py-4 text-[9px] font-black text-[var(--text-main)] uppercase tracking-widest w-24 text-center">End</th>
              <th className="px-4 py-4 text-[9px] font-black text-[var(--text-main)] uppercase tracking-widest w-32 text-center">Status</th>
              <th className="px-4 py-4 text-[9px] font-black text-[var(--accent)] uppercase tracking-widest w-[250px]"><div className="flex items-center justify-center gap-1"><UserIcon className="w-2.5 h-2.5"/> Fachrul Feedback</div></th>
              <th className="px-4 py-4 text-[9px] font-black text-[var(--accent)] uppercase tracking-widest w-[250px]"><div className="flex items-center justify-center gap-1"><UserIcon className="w-2.5 h-2.5"/> Barra Feedback</div></th>
              <th className="px-6 py-4 text-[9px] font-black text-[var(--text-main)] uppercase tracking-widest w-40 text-right">Comm Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(() => {
              const uniqueRoots = (roots || []).filter((v: any, i: number, a: any[]) => !!v && a.findIndex(t => t.id === v.id) === i);
              if (uniqueRoots.length === 0) {
                return (
                  <tr>
                    <td colSpan={12} className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 bg-slate-900/50 rounded-xl flex items-center justify-center border border-slate-800">
                          <Layers className="w-6 h-6 text-slate-700" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-slate-300 font-bold text-sm">No Governance Nodes Found</h4>
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Project scope is currently undefined</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }
              return uniqueRoots.map((task: any, idx: number) => {
                const combinedKey = `${task.id}-${revertCount}-${idx}`;
                return <React.Fragment key={combinedKey}>{renderTaskRows(task, 0, idx, null)}</React.Fragment>;
              });
            })()}
          </tbody>
        </table>
      </div>
    </DndContext>
  );
}

function MobileTaskCard({ task, onToggleExpand, isExpanded, onUpdateTask, onDeleteTask, expandedRows, revertCount, level = 0, gridStart, totalDuration }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const hasChildren = task.children && task.children.length > 0;
  
  const fromDate = task.start_time ? new Date(task.start_time) : null;
  const toDate = task.end_time ? new Date(task.end_time) : null;
  const now = new Date();
  
  const progress = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const total = toDate.getTime() - fromDate.getTime();
    if (total <= 0) return 0;
    const current = now.getTime() - fromDate.getTime();
    return Math.min(100, Math.max(0, (current / total) * 100));
  }, [fromDate, toDate, now]);

  const ganttBar = useMemo(() => {
    if (!fromDate || !toDate || !gridStart || !totalDuration) return null;
    const left = ((fromDate.getTime() - gridStart.getTime()) / totalDuration) * 100;
    const width = ((toDate.getTime() - fromDate.getTime()) / totalDuration) * 100;
    return { left: `${Math.max(0, left)}%`, width: `${Math.max(1, width)}%` };
  }, [fromDate, toDate, gridStart, totalDuration]);

  return (
    <div className={cn(
      "bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-3 shadow-xl shadow-black/20",
      level > 0 && "ml-3 border-l-2 border-l-indigo-500/30"
    )}>
      <div 
        className="p-4"
        onClick={() => hasChildren && onToggleExpand(task.id)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-slate-500 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{task.custom_id}</span>
            {hasChildren && (
              <span className={cn("transition-transform duration-200", isExpanded ? "text-indigo-400 rotate-0" : "text-slate-500 rotate-[-90deg]")}>
                <ChevronDown className="w-4 h-4" />
              </span>
            )}
          </div>
          <StatusBadge status={task.status} />
        </div>
        
        <div className="flex justify-between items-start mb-3 gap-4">
          <h3 className={cn(
            "text-white font-black tracking-tight leading-tight",
            level === 0 ? "text-base uppercase italic" : "text-sm"
          )}>
            {task.title || 'Untitled Task'}
          </h3>
          <div className="shrink-0 text-right">
             <span className="text-[10px] font-black text-indigo-400 block tracking-widest">{formatWorkday(task.man_hours || 0)}</span>
             <span className="text-[8px] font-black text-slate-600 block uppercase">Allocated</span>
          </div>
        </div>

        {/* Condensed Timeline Bar */}
        {ganttBar && (
          <div className="mb-4 space-y-1.5">
            <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">
              <span>{format(fromDate!, 'dd MMM')}</span>
              <span className="text-slate-700 italic">Timeline View</span>
              <span>{format(toDate!, 'dd MMM')}</span>
            </div>
            <div className="h-6 bg-slate-950/80 rounded-lg relative overflow-hidden border border-white/5">
              {/* Scale Tick Markers */}
              <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-10">
                {[...Array(10)].map((_, i) => <div key={i} className="w-px h-full bg-white" />)}
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                style={{ 
                  left: ganttBar.left, 
                  width: ganttBar.width,
                  transformOrigin: 'left'
                }}
                className={cn(
                  "absolute top-1 bottom-1 rounded-full shadow-[0_0_12px] z-10",
                  level === 0 
                    ? "bg-gradient-to-r from-purple-500 via-indigo-500 to-indigo-600 shadow-purple-500/40" 
                    : "bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 shadow-cyan-400/40"
                )}
              >
                {/* Progress highlight within bar */}
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20" />
              </motion.div>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
               <UserIcon className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="text-[8px] text-slate-500 font-black uppercase block leading-none mb-0.5 tracking-[0.1em]">Lead PIC</span>
              <span className="text-[11px] text-slate-200 font-black uppercase tracking-tight">{task.assignee || 'UNASSIGNED'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl transition-all active:scale-90 border border-indigo-500/20 shadow-lg shadow-indigo-900/10"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
              className="p-3 bg-rose-500/10 text-rose-400 rounded-xl transition-all active:scale-90 border border-rose-500/20 shadow-lg shadow-rose-900/10"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <MobileTaskEditModal 
            task={task}
            onClose={() => setIsEditing(false)}
            onUpdate={onUpdateTask}
          />
        )}
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-800"
          >
            <div className="p-2">
              {task.children.map((child: any) => (
                <MobileTaskCard 
                  key={`${child.id}-${revertCount}`}
                  task={child}
                  onToggleExpand={onToggleExpand}
                  isExpanded={expandedRows.has(child.id)}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                  expandedRows={expandedRows}
                  revertCount={revertCount}
                  level={level + 1}
                  gridStart={gridStart}
                  totalDuration={totalDuration}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileTaskEditModal({ task, onClose, onUpdate }: { task: Task, onClose: () => void, onUpdate: (id: string, field: string, value: any) => void }) {
  const [formData, setFormData] = useState({
    title: task.title || '',
    assignee: task.assignee || '',
    status: task.status || TaskStatus.IN_PROGRESS,
    realized_finish_date: task.realized_finish_date ? format(new Date(task.realized_finish_date), 'yyyy-MM-dd') : '',
    start_time: task.start_time ? format(new Date(task.start_time), 'yyyy-MM-dd') : '',
    end_time: task.end_time ? format(new Date(task.end_time), 'yyyy-MM-dd') : '',
    man_hours: task.man_hours || 0
  });

  const handleSave = () => {
    // Check if anything changed and update
    if (formData.title !== task.title) onUpdate(task.id, 'title', formData.title);
    if (formData.assignee !== task.assignee) onUpdate(task.id, 'assignee', formData.assignee);
    if (formData.status !== task.status) onUpdate(task.id, 'status', formData.status);
    if (formData.man_hours !== task.man_hours) onUpdate(task.id, 'man_hours', formData.man_hours);
    
    const currentRealized = task.realized_finish_date ? format(new Date(task.realized_finish_date), 'yyyy-MM-dd') : '';
    if (formData.realized_finish_date !== currentRealized) {
      const newDate = formData.realized_finish_date ? new Date(`${formData.realized_finish_date}T17:00:00`).toISOString() : null;
      onUpdate(task.id, 'realized_finish_date', newDate);
    }
    
    const currentStart = task.start_time ? format(new Date(task.start_time), 'yyyy-MM-dd') : '';
    if (formData.start_time !== currentStart) {
      const newDate = new Date(`${formData.start_time}T08:00:00`).toISOString();
      onUpdate(task.id, 'start_time', newDate);
    }
    
    const currentEnd = task.end_time ? format(new Date(task.end_time), 'yyyy-MM-dd') : '';
    if (formData.end_time !== currentEnd) {
      const newDate = new Date(`${formData.end_time}T17:00:00`).toISOString();
      onUpdate(task.id, 'end_time', newDate);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="flex-1 flex flex-col"
      >
        <div className="h-20 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
             <div onClick={onClose} className="p-2 bg-slate-800 rounded-lg text-slate-400">
                <ArrowLeft className="w-6 h-6" />
             </div>
             <div>
               <h2 className="text-lg font-black text-white italic uppercase tracking-tighter">Edit <span className="text-indigo-500">Task</span></h2>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{task.custom_id}</p>
             </div>
          </div>
          <button 
            onClick={handleSave}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-600/20"
          >
            Save Changes
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Task Title</label>
            {!task.parent_id ? (
              <L1PhaseSelector 
                value={formData.title}
                onChange={(v) => setFormData(p => ({ ...p, title: v }))}
                className="w-full"
              />
            ) : (
              <input 
                type="text"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Design UI/UX"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all text-lg"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Start Date</label>
              <CustomDatePicker 
                selectedDate={formData.start_time}
                onChange={date => setFormData(p => ({ ...p, start_time: date || '' }))}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">End Date</label>
              <CustomDatePicker 
                selectedDate={formData.end_time}
                onChange={date => setFormData(p => ({ ...p, end_time: date || '' }))}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assignee / PIC</label>
            <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 overflow-hidden">
               <UserIcon className="w-5 h-5 text-slate-500 shrink-0" />
               <input 
                 type="text"
                 value={formData.assignee}
                 onChange={e => setFormData(p => ({ ...p, assignee: e.target.value }))}
                 placeholder="Search personnel..."
                 className="flex-1 bg-transparent text-white font-bold outline-none"
               />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Realized Finish Date (Optional)</label>
            <CustomDatePicker 
              selectedDate={formData.realized_finish_date}
              minDate={formData.start_time ? new Date(formData.start_time) : undefined}
              onChange={date => {
                if (date && formData.start_time && date < formData.start_time) {
                  alert(`VALIDATION ERROR: Realized Finish tidak boleh mendahului Plan Start (${formData.start_time})`);
                  return;
                }
                setFormData(p => ({ ...p, realized_finish_date: date || '' }));
              }}
              className="w-full bg-slate-900 border border-indigo-500/30 rounded-2xl px-4 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all font-mono"
            />
            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest ml-1 italic">
              Filling this will trigger early/overdue calculations
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Task Status</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                TaskStatus.TODO,
                TaskStatus.IN_PROGRESS,
                TaskStatus.ON_HOLD,
                TaskStatus.ON_QUEUE,
                TaskStatus.DONE
              ].map(status => (
                <button
                  key={status}
                  onClick={() => setFormData(p => ({ ...p, status }))}
                  className={cn(
                    "py-4 rounded-2xl border font-black uppercase text-[10px] tracking-widest transition-all",
                    formData.status === status 
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 scale-95" 
                      : "bg-slate-900 border-slate-800 text-slate-500"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Man-Hours Alocation</label>
            <div className="flex items-center gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
               <div className="flex-1">
                 <input 
                   type="range"
                   min="0"
                   max="100"
                   step="0.5"
                   value={formData.man_hours}
                   onChange={e => setFormData(p => ({ ...p, man_hours: parseFloat(e.target.value) }))}
                   className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer"
                 />
               </div>
               <div className="w-24 shrink-0 text-right">
                  <span className="text-2xl font-black text-indigo-400">{formData.man_hours}</span>
                  <span className="text-[10px] font-black text-slate-600 ml-1">MH</span>
               </div>
            </div>
            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest text-center mt-2">
              Equivalent to ≈ {formatWorkday(formData.man_hours)}
            </p>
          </div>
          
          <div className="pt-10">
            <button 
              onClick={onClose}
              className="w-full py-5 bg-slate-900 text-slate-500 font-black uppercase text-xs tracking-widest rounded-2xl border border-slate-800"
            >
              Cancel & Discard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MobileTemporalView({ hierarchicalTasks, expandedRows, onToggleExpand, onUpdateTask, onDeleteTask, gridStart, gridEnd, totalDuration, monthIntervals }: any) {
  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Month Header for Mobile List */}
      <div className="h-10 border-b border-white/5 bg-slate-900/50 flex shrink-0 sticky top-0 z-20 backdrop-blur-md">
        {monthIntervals.map((m: any, i: number) => (
          <div 
            key={`mob-month-${i}`}
            style={{ width: `${m.width}%` }}
            className="h-full border-r border-white/5 flex items-center justify-center"
          >
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter italic">
              {format(m.date, 'MMM')}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hierarchicalTasks.roots.map((root: any) => (
          <MobileTaskCard 
            key={root.id}
            task={root}
            onToggleExpand={onToggleExpand}
            isExpanded={expandedRows.has(root.id)}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            expandedRows={expandedRows}
            gridStart={gridStart}
            totalDuration={totalDuration}
          />
        ))}
      </div>
    </div>
  );
}

function TemporalVisualizer({ user, scale, tasks, projectId, hierarchicalTasks, expandedRows, onToggleExpand, setTasks, projects, isGlobalView, onSetFocus, isMobile, onUpdateTask, onDeleteTask }: { user: any, scale: ViewScale, tasks: Task[], projectId?: string | null, hierarchicalTasks: any, expandedRows: Set<string>, onToggleExpand: (id: string) => void, setTasks: React.Dispatch<React.SetStateAction<Task[]>>, projects: Project[], isGlobalView?: boolean, onSetFocus?: (id: string) => void, isMobile?: boolean, onUpdateTask?: any, onDeleteTask?: any }) {
  const { gridStart, gridEnd, intervals, totalDuration } = useMemo(() => {
    return calculateTimelineRange(scale, tasks, projects, projectId, isGlobalView);
  }, [tasks, scale, projects, projectId, isGlobalView]);

  // Precision Header Engine
  const topIntervals = useMemo(() => {
    try {
      if (scale === 'MONTH') {
        const years = eachYearOfInterval({ start: gridStart, end: gridEnd });
        return years.map(date => {
          const nextYear = startOfYear(addYears(date, 1));
          const actualEnd = nextYear.getTime() > gridEnd.getTime() ? gridEnd : nextYear;
          const actualStart = date.getTime() < gridStart.getTime() ? gridStart : date;
          
          return {
            date,
            width: ((actualEnd.getTime() - actualStart.getTime()) / totalDuration) * 100,
            label: format(date, 'yyyy')
          };
        });
      }
      
      // Default (WEEK, DAY) show Months on top
      const months = eachMonthOfInterval({ start: gridStart, end: gridEnd });
      return months.map(date => {
        const nextMonth = startOfMonth(addMonths(date, 1));
        const actualEnd = nextMonth.getTime() > gridEnd.getTime() ? gridEnd : nextMonth;
        const actualStart = date.getTime() < gridStart.getTime() ? gridStart : date;
        
        return {
          date,
          width: ((actualEnd.getTime() - actualStart.getTime()) / totalDuration) * 100,
          label: format(date, 'MMMM yyyy')
        };
      });
    } catch (e) { return []; }
  }, [gridStart, gridEnd, totalDuration, scale]);

  const bottomIntervals = useMemo(() => {
    try {
      return intervals.map((date, i) => {
        const nextDate = intervals[i + 1] || gridEnd;
        let label: React.ReactNode = '';
        if (scale === 'MONTH') label = format(date, 'MMMM');
        else if (scale === 'WEEK') {
          const weekStart = startOfWeek(date, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
          label = (
            <span className="flex items-center gap-1">
              <span>Week {format(date, 'w')}</span>
              <span className="text-[8px] text-slate-500 lowercase font-medium tracking-tight">
                ({format(weekStart, 'dd MMM')} - {format(weekEnd, 'dd MMM yyyy')})
              </span>
            </span>
          );
        }
        else if (scale === 'DAY') label = format(date, 'dd');

        return {
          date,
          width: ((nextDate.getTime() - date.getTime()) / totalDuration) * 100,
          label
        };
      });
    } catch (e) { return []; }
  }, [intervals, gridEnd, totalDuration, scale]);

  // RED NEEDLE: Precision Today Indicator
  const todayPos = useMemo(() => {
    const now = new Date();
    const startMs = gridStart.getTime();
    if (now.getTime() < startMs || now.getTime() > gridEnd.getTime()) return null;
    return ((now.getTime() - startMs) / totalDuration) * 100;
  }, [gridStart, gridEnd, totalDuration]);

  if (isMobile) {
    return (
      <MobileTemporalView 
        hierarchicalTasks={hierarchicalTasks}
        expandedRows={expandedRows}
        onToggleExpand={onToggleExpand}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        gridStart={gridStart}
        gridEnd={gridEnd}
        totalDuration={totalDuration}
        monthIntervals={bottomIntervals}
      />
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-950 font-sans">
      <div className="flex w-full h-full relative">
        {/* Left Column: Task/Project Labels */}
        <div className="w-[300px] border-r border-slate-800 bg-slate-950/95 sticky left-0 z-30 flex flex-col shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
          <div className="h-20 border-b border-indigo-500/20 flex flex-col justify-center px-6 bg-slate-900/95 sticky top-0 z-40 backdrop-blur-md">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1">Timeline Engine</span>
            <span className="text-[9px] text-slate-500 font-bold italic tracking-tighter truncate">
              {format(gridStart, 'dd MMM')} — {format(gridEnd, 'dd MMM yyyy')}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
            {(() => {
               const uniqueRoots = (hierarchicalTasks.roots || []).filter((v: any, i: number, a: any[]) => !!v && a.findIndex(t => t.id === v.id) === i);
               if (uniqueRoots.length === 0) {
                 return (
                   <div className="py-8 px-4 text-center opacity-30 italic text-[10px] uppercase tracking-widest text-slate-500">
                     Empty Roadmap
                   </div>
                 );
               }
               return uniqueRoots.map((root: any, rIdx: number) => {
                 const isExpanded = expandedRows.has(root.id);
                 const rootKey = `${root.custom_id || root.id}-${rIdx}`;
                 return (
                   <div key={rootKey} className="flex flex-col">
                      <div 
                        onClick={() => onToggleExpand(root.id)}
                        className={cn(
                          "flex items-center px-6 border-b border-white/5 truncate tracking-widest cursor-pointer hover:bg-white/5 transition-all group border-l-4 border-l-transparent",
                          isExpanded && "border-l-indigo-600 bg-white/[0.02]",
                          isGlobalView ? "h-[64px]" : "h-[56px]"
                        )}
                      >
                        <div className="mr-3 text-cyan-400 group-hover:text-cyan-300 transition-colors">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                        <span className={cn(
                          "truncate",
                          isGlobalView ? "text-base font-bold uppercase text-white tracking-tight" : "text-sm font-semibold italic text-zinc-100 tracking-tight"
                        )}>
                          {root.title || root.custom_id}
                        </span>
                      </div>
                      
                      {isExpanded && (() => {
                        const uniqueChildren = (root.children || []).filter((v: any, i: number, a: any[]) => !!v && a.findIndex(t => t.id === v.id) === i);
                        return uniqueChildren.map((child: any, cIdx: number) => {
                          const isChildExpanded = expandedRows.has(child.id);
                          const childKey = `${child.custom_id || child.id}-${cIdx}`;
                          return (
                            <React.Fragment key={childKey}>
                              <div 
                                onClick={() => onToggleExpand(child.id)}
                                className={cn(
                                  "h-[48px] flex items-center px-6 pl-12 border-b border-white/[0.02] cursor-pointer hover:bg-white/5 transition-colors group"
                                )}
                              >
                                <div className="mr-2 text-purple-400 opacity-60 group-hover:opacity-100">
                                  {(child.children && child.children.length > 0) ? (isChildExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />) : null}
                                </div>
                                <span className="text-cyan-500 font-black text-lg mr-2 select-none">↳</span>
                                <span className={cn(
                                  "truncate",
                                  isGlobalView ? "text-sm font-semibold italic text-zinc-100 tracking-tight" : "text-xs font-medium text-zinc-200 tracking-wider"
                                )}>
                                  {child.title || child.custom_id}
                                </span>
                              </div>
                              
                              {isChildExpanded && (() => {
                                 const uniqueSubs = (child.children || []).filter((v: any, i: number, a: any[]) => !!v && a.findIndex(t => t.id === v.id) === i);
                                 return uniqueSubs.map((sub: any, sIdx: number) => {
                                   const subKey = `${sub.custom_id || sub.id}-${sIdx}`;
                                   return (
                                     <div key={subKey} className="h-[40px] flex items-center px-6 pl-16 border-b border-white/[0.01] hover:bg-white/[0.02] transition-colors group">
                                        <span className="text-purple-500 font-black text-lg mr-2 select-none opacity-60 group-hover:opacity-100">↳</span>
                                        <span className="text-zinc-200 text-xs font-medium tracking-wider truncate">
                                          {sub.title || sub.custom_id}
                                        </span>
                                     </div>
                                   );
                                 });
                              })()}
                            </React.Fragment>
                          );
                        });
                      })()}
                   </div>
                 );
               });
            })()}
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative flex flex-col h-full bg-slate-950">
          {/* Time Header Refactor */}
          <div className="sticky top-0 z-40 shrink-0 select-none backdrop-blur-xl border-b border-white/5 shadow-2xl">
            {/* Top Row */}
            <div className="h-10 flex border-b border-white/5 bg-slate-900/80">
              {topIntervals.map((m, i) => (
                <div 
                  key={`top-${i}`}
                  style={{ width: `${m.width}%` }}
                  className="shrink-0 border-r border-white/5 flex items-center justify-center px-2 bg-slate-900/50 overflow-hidden"
                >
                  <span className="text-[11px] font-black text-white italic uppercase tracking-widest drop-shadow-md whitespace-nowrap">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Bottom Row */}
            <div className="h-10 flex bg-slate-950/40">
              {bottomIntervals.map((w, i) => (
                <div 
                  key={`bottom-${i}`}
                  style={{ width: `${w.width}%` }}
                  className="shrink-0 border-r border-white/5 flex flex-col justify-center items-center px-1 group overflow-hidden"
                >
                  <span className="text-[9px] font-black text-slate-400 group-hover:text-indigo-400 transition-colors uppercase tracking-widest whitespace-nowrap">
                    {w.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 relative overflow-y-auto scrollbar-hide">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none z-0">
              {bottomIntervals.map((w, i) => (
                <div 
                  key={`grid-line-${i}`} 
                  style={{ width: `${w.width}%` }} 
                  className="h-full border-r border-white/[0.03] bg-gradient-to-b from-white/[0.01] to-transparent" 
                />
              ))}
            </div>

            {/* RED NEEDLE */}
            {todayPos !== null && (
              <div 
                className="absolute top-0 bottom-0 w-[2px] bg-rose-500 z-40 pointer-events-none shadow-[0_0_10px_rgba(244,63,94,0.6)]"
                style={{ left: `${todayPos}%` }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-rose-500 rotate-45 border-2 border-white/20 shadow-lg" />
              </div>
            )}

            {/* Task Bars aligned with Tree rows */}
            <div className="relative z-10 w-full">
              {(() => {
                const uniqueRoots = (hierarchicalTasks.roots || []).filter((v: any, i: number, a: any[]) => !!v && a.findIndex(t => t.id === v.id) === i);
                return uniqueRoots.map((root: any, rIdx: number) => {
                  const isExpanded = expandedRows.has(root.id);
                  return (
                    <div key={`${root.custom_id || root.id}-${rIdx}-timeline`} className="flex flex-col">
                      <div className={cn(
                        "flex items-center border-b border-white/[0.02] relative",
                        isGlobalView ? "h-[64px]" : "h-[56px]"
                      )}>
                        <GanttBar 
                          user={user}
                          task={root} 
                          tasks={tasks}
                          projects={projects}
                          setTasks={setTasks}
                          scale={scale} 
                          gridStart={gridStart}
                          gridEnd={gridEnd}
                          totalDuration={totalDuration}
                          isLevel1={true}
                          isProjectBar={root.isProject}
                          onSetFocus={onSetFocus}
                          index={rIdx}
                        />
                      </div>
                      
                      {isExpanded && (() => {
                        const uniqueChildren = (root.children || []).filter((v: any, i: number, a: any[]) => !!v && a.findIndex(t => t.id === v.id) === i);
                        return uniqueChildren.map((child: any, cIdx: number) => {
                          const isChildExpanded = expandedRows.has(child.id);
                          return (
                            <React.Fragment key={`${child.custom_id || child.id}-${cIdx}-timeline`}>
                              <div className="h-[48px] flex items-center border-b border-white/[0.01] relative">
                                <GanttBar 
                                  user={user}
                                  task={child} 
                                  tasks={tasks}
                                  projects={projects}
                                  setTasks={setTasks}
                                  scale={scale} 
                                  gridStart={gridStart}
                                  gridEnd={gridEnd}
                                  totalDuration={totalDuration}
                                  isLevel1={!isGlobalView}
                                  isSmall={isGlobalView}
                                  index={cIdx}
                                />
                              </div>
                              
                              {isChildExpanded && (() => {
                                 const uniqueSubs = (child.children || []).filter((v: any, i: number, a: any[]) => !!v && a.findIndex(t => t.id === v.id) === i);
                                 return uniqueSubs.map((sub: any, sIdx: number) => (
                                   <div key={`${sub.custom_id || sub.id}-${sIdx}-timeline`} className="h-[40px] flex items-center border-b border-white/[0.005] relative">
                                     <GanttBar 
                                        user={user}
                                        task={sub} 
                                        tasks={tasks}
                                        projects={projects}
                                        setTasks={setTasks}
                                        scale={scale} 
                                        gridStart={gridStart}
                                        gridEnd={gridEnd}
                                        totalDuration={totalDuration}
                                        isLevel1={false}
                                        isSmall={true}
                                        index={sIdx}
                                      />
                                   </div>
                                 ));
                              })()}
                            </React.Fragment>
                          );
                        });
                      })()}
                   </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GanttBar({ user, task, tasks, projects, setTasks, scale, gridStart, gridEnd, totalDuration, isLevel1, isProjectBar, onSetFocus, index }: any) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0); 
  const [showPopover, setShowPopover] = useState(false);

  const viewStartMs = startOfDay(gridStart).getTime();
  const totalViewRangeMs = totalDuration;

  // DUAL-DATE PRECISION ENGINE with Robust Fallbacks
  const fromMs = useMemo(() => {
    const d = task.start_time || (task as any).from_date || (task as any).start_date;
    if (!d) return null;
    const date = new Date(d);
    return isNaN(date.getTime()) ? null : startOfDay(date).getTime();
  }, [task.start_time, (task as any).from_date, (task as any).start_date]);

  const toMs = useMemo(() => {
    const d = task.end_time || (task as any).to_date || (task as any).end_date;
    if (!d) return null;
    const date = new Date(d);
    return isNaN(date.getTime()) ? null : startOfDay(date).getTime();
  }, [task.end_time, (task as any).to_date, (task as any).end_date]);

  const left = fromMs !== null ? ((fromMs - viewStartMs) / totalViewRangeMs) * 100 : 0;
  
  // 🔥 THE FIX: Inclusive End-Date (Always add 1 day to the span so it covers the final day fully)
  const dayInMs = 86400000;
  const width = (fromMs !== null && toMs !== null) ? ((toMs - fromMs + dayInMs) / totalViewRangeMs) * 100 : 0;

  const isVisible = (fromMs !== null && toMs !== null) && 
                    (toMs >= viewStartMs) && 
                    (fromMs <= gridEnd.getTime()) &&
                    fromMs > 86400000; // Ignore dates near 1970

  if (!isVisible || fromMs === null || toMs === null) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isProjectBar || task.status === TaskStatus.DONE || !user || user?.access_level === 'Viewer') return;
    
    setIsDragging(true);
    setShowPopover(false);
    const startX = e.clientX;
    const container = e.currentTarget.parentElement;
    const containerWidth = container?.clientWidth || 1000;
    
    const handleMove = (moveEvent: PointerEvent) => {
      const deltaPx = moveEvent.clientX - startX;
      const deltaTime = (deltaPx / containerWidth) * totalDuration;
      setDragOffset(deltaTime);
    };

    const handleUp = async () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);

      if (Math.abs(dragOffset) > 2 * 60000) {
        const newStart = new Date(fromMs + dragOffset);
        const currentDuration = toMs - fromMs;
        const updatedTask = { 
          ...task, 
          start_time: newStart.toISOString(),
          end_time: new Date(newStart.getTime() + currentDuration).toISOString() 
        };
        setTasks((prev: Task[]) => prev.map((t: any) => t.id === task.id ? updatedTask : t));
        setDragOffset(0);
        try {
          await taskService.updateTask(task.id, {
            start_time: updatedTask.start_time,
            end_time: updatedTask.end_time
          }, user?.email || 'Administrator');
        } catch (err) {
          console.error('Update failed:', err);
        }
      } else {
        setDragOffset(0);
      }
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  // Timeliness Stats
  const isApproved = task.status === TaskStatus.DONE;
  const health = getTaskHealth(task);
  const timeProgress = Math.min(100, Math.max(0, ((new Date().getTime() - fromMs!) / (toMs! - fromMs!)) * 100));
  
  // Normalized timeliness assessment
  const safeEnd = task.end_time || (task as any).end_date || (task as any).end;
  const safeRealized = task.realized_finish_date || (task as any).realized_date;
  const timeStats = calculateTimeliness(safeEnd, safeRealized, task.status);

  // Strict Background Color Selection - NO COMBINATION
  let barColorClass = "";
  if (timeStats.state === 'LATE') {
    barColorClass = "bg-gradient-to-r from-red-600 to-rose-700 shadow-red-900/50 ring-2 ring-red-500/30";
  } else if (isApproved) {
    barColorClass = "bg-gradient-to-r from-emerald-500 to-teal-600 opacity-80";
  } else if (health === 'OVERDUE') {
    barColorClass = "bg-gradient-to-r from-rose-500 to-red-700 shadow-rose-500/40";
  } else if (timeStats.state === 'FASTER') {
    barColorClass = "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-900/30";
  } else {
    // Default Phase Colors
    barColorClass = isLevel1 || isProjectBar 
      ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(124,58,237,0.3)]" 
      : "bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]";
  }

  return (
    <div key={`${task.id}-${index}`} className={cn("relative flex items-center w-full", isProjectBar ? "h-16" : (isLevel1 ? "h-14" : "h-10"))}>
      <motion.div
        initial={false}
        animate={{ 
          left: `${left + (dragOffset / totalViewRangeMs) * 100}%`, 
          width: `${Math.max(0.5, width)}%`,
          scale: isDragging ? 1.02 : 1,
          zIndex: isDragging ? 50 : 10
        }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        onPointerDown={handlePointerDown}
        onClick={(e) => {
          if (isProjectBar && onSetFocus) {
            e.stopPropagation();
            onSetFocus(task.id);
          } else {
            setShowPopover(!showPopover);
          }
        }}
        className={cn(
          "absolute rounded-lg flex items-center px-4 shadow-xl select-none transition-all duration-300 border border-white/10",
          barColorClass,
          isDragging && "ring-2 ring-white/50 z-[100]",
          "hover:backdrop-brightness-110 active:scale-[0.98] cursor-pointer"
        )}
      >
        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 bg-white/5 rounded-lg pointer-events-none" />
        
        <span className={cn(
          "font-black whitespace-nowrap overflow-hidden uppercase tracking-tighter text-white drop-shadow-md",
          isLevel1 || isProjectBar ? "text-[10px]" : "text-[8px]"
        )}>
           {task.title || task.custom_id}
        </span>

        {/* Progress Overlay */}
        {!isApproved && !isProjectBar && (
          <div className="absolute bottom-0 left-0 h-[2px] bg-white/30 rounded-full" style={{ width: `${timeProgress}%` }} />
        )}

        <AnimatePresence>
          {showPopover && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 border border-slate-700 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{task.title || task.custom_id}</h4>
                  <HealthBadge health={health} />
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">SLA Efficiency Status</p>
                  <p className={cn("font-bold text-[10px] uppercase tracking-tighter", timeStats.textColor)}>
                    {timeStats.label} ({timeStats.text})
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Initialization</p>
                    <p className="text-[10px] font-mono text-slate-200">{format(new Date(fromMs!), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Termination</p>
                    <p className="text-[10px] font-mono text-slate-200">{format(new Date(toMs!), 'MMM dd, yyyy')}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Node Completion</span>
                    <span className="text-indigo-400">{Math.round(timeProgress)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_10px_#6366f1]" style={{ width: `${timeProgress}%` }} />
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">SLA STATUS:</p>
                  <p className={cn("font-bold text-[10px] uppercase", timeStats.textColor)}>
                    {timeStats.label} ({timeStats.text})
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Inputted Man-Hours</span>
                  <span className="text-[11px] font-black text-indigo-400">
                    {task.man_hours || 0} HOURS
                  </span>
                </div>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
