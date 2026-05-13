import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { MigrateNotion } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import CreatableSelect from 'react-select/creatable';
import { 
  Database, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  XCircle,
  Loader2,
  Check,
  Clock,
  History,
  Pencil,
  Eye,
  RotateCcw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MIGRATION_STATUSES, STATUS_COLORS } from '../constants/migration';
import { ConfirmDialog } from './ConfirmDialog';

export function NotionMonitoring() {
  const [projects, setProjects] = useState<MigrateNotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<MigrateNotion | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProject, setTempProject] = useState<MigrateNotion | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(MIGRATION_STATUSES);
  const [picFilters, setPicFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPicFilterOpen, setIsPicFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'HISTORY'>('DETAILS');
  const [initialPic, setInitialPic] = useState('');

  const CACHE_KEY = 'om_dedy_notion_monitoring_cache';

  const fetchProjects = async (force = false) => {
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setProjects(JSON.parse(cached));
        setLoading(false);
      }
    }

    try {
      const { data, error } = await supabase
        .from('migrate_notion')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data || []));
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('migrate_notion_logs')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });
      
      if (!error) setHistoryLogs(data || []);
    } catch (err) {
      console.error('History Fetch Error:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      setEditedNotes(selectedProject.last_update_log || '');
      setTempProject({ ...selectedProject });
      setActiveTab('DETAILS');
      if (selectedProject.ticket_id) {
        fetchHistory(selectedProject.ticket_id);
      }
    } else {
      setIsEditing(false);
      setTempProject(null);
    }
  }, [selectedProject]);

  const logChange = async (ticketId: string, field: string, oldVal: any, newVal: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('migrate_notion_logs').insert({
        ticket_id: ticketId,
        changed_by: user?.email || 'System',
        field_name: field,
        old_value: String(oldVal),
        new_value: String(newVal),
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Logging Error:', err);
    }
  };

  const handleSaveClick = () => {
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    if (!tempProject || !selectedProject) return;
    setIsUpdating(true);
    setShowConfirm(false);

    try {
      const { error } = await supabase
        .from('migrate_notion')
        .update({
          project_name: tempProject.project_name,
          ticket_id: tempProject.ticket_id,
          last_status: tempProject.last_status,
          pic_name: tempProject.pic_name,
          owner_div: tempProject.owner_div,
          owner_name: tempProject.owner_name,
          project_type: tempProject.project_type,
          last_update_log: tempProject.last_update_log,
          raw_data: tempProject.raw_data
        })
        .eq('id', tempProject.id);

      if (error) throw error;

      // Log changes
      const ticketId = tempProject.ticket_id || tempProject.id;
      if (tempProject.project_name !== selectedProject.project_name) await logChange(ticketId, 'Project Name', selectedProject.project_name, tempProject.project_name);
      if (tempProject.last_status !== selectedProject.last_status) await logChange(ticketId, 'Status', selectedProject.last_status, tempProject.last_status);
      if (tempProject.pic_name !== selectedProject.pic_name) await logChange(ticketId, 'PIC Name', selectedProject.pic_name, tempProject.pic_name);
      if (tempProject.last_update_log !== selectedProject.last_update_log) await logChange(ticketId, 'Notes', selectedProject.last_update_log, tempProject.last_update_log);

      setProjects(prev => prev.map(p => p.id === tempProject.id ? { ...tempProject } : p));
      setSelectedProject({ ...tempProject });
      setIsEditing(false);
      localStorage.removeItem(CACHE_KEY);
      if (tempProject.ticket_id) fetchHistory(tempProject.ticket_id);
    } catch (err) {
      console.error('Update Error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedProject) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('migrate_notion')
        .update({ last_update_log: editedNotes })
        .eq('id', selectedProject.id);

      if (error) throw error;
      
      await logChange(selectedProject.ticket_id || selectedProject.id, 'Notes', selectedProject.last_update_log, editedNotes);
      
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, last_update_log: editedNotes } : p));
      setSelectedProject(prev => prev ? { ...prev, last_update_log: editedNotes } : null);
      if (selectedProject.ticket_id) fetchHistory(selectedProject.ticket_id);
      alert('Notes updated!');
    } catch (err) {
      console.error('Update Error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    MIGRATION_STATUSES.forEach(s => acc[s] = 0);
    projects.forEach(p => {
      if (acc.hasOwnProperty(p.last_status)) acc[p.last_status]++;
    });
    return acc;
  }, [projects]);

  const availablePics = useMemo(() => {
    const pics = new Set(projects.map(p => p.pic_name || 'Unassigned'));
    return Array.from(pics).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let res = projects;
    if (statusFilter) {
      res = res.filter(p => p.last_status === statusFilter);
    }
    if (picFilters.length > 0) {
      res = res.filter(p => picFilters.includes(p.pic_name || 'Unassigned'));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(p => 
        p.project_name.toLowerCase().includes(q) || 
        (p.ticket_id || '').toLowerCase().includes(q) ||
        (p.pic_name || '').toLowerCase().includes(q)
      );
    }
    return res;
  }, [projects, searchQuery, statusFilter, picFilters]);

  return (
    <div className="h-screen bg-[#0a0f1d] text-slate-300 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
            <Database className="w-6 h-6 text-indigo-500" />
            Notion <span className="text-indigo-500">Monitoring Board</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time Project Synchronization</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => fetchProjects(true)}
            className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            title="Force Refresh Data"
          >
            <Loader2 className={cn("w-4 h-4 text-indigo-400", loading ? "animate-spin" : "")} />
          </button>

          {/* Multi-select Status Filter */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-500/50 transition-all text-slate-300"
            >
              <Filter className="w-4 h-4 text-indigo-500" />
              Monitor Statuses ({selectedStatuses.length})
              <ChevronDown className={cn("w-3 h-3 transition-transform", isFilterOpen ? "rotate-180" : "")} />
            </button>
            
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-[#1a1f30] border border-white/10 rounded-2xl shadow-2xl z-[120] p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Select Columns</span>
                  <button 
                    onClick={() => setSelectedStatuses(selectedStatuses.length === MIGRATION_STATUSES.length ? [] : MIGRATION_STATUSES)}
                    className="text-[8px] font-black text-slate-500 uppercase hover:text-white transition-colors"
                  >
                    {selectedStatuses.length === MIGRATION_STATUSES.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {MIGRATION_STATUSES.map(status => (
                    <button 
                      key={status}
                      onClick={() => {
                        setSelectedStatuses(prev => 
                          prev.includes(status) 
                            ? prev.filter(s => s !== status) 
                            : [...prev, status]
                        );
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold transition-all",
                        selectedStatuses.includes(status) ? "bg-indigo-600/20 text-white" : "text-slate-500 hover:bg-white/5"
                      )}
                    >
                      <span className="truncate mr-2">{status}</span>
                      {selectedStatuses.includes(status) && <Check className="w-3 h-3 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Multi-select PIC Filter */}
          <div className="relative">
            <button 
              onClick={() => setIsPicFilterOpen(!isPicFilterOpen)}
              className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-500/50 transition-all text-slate-300"
            >
              PIC ({picFilters.length || 'ALL'})
              <ChevronDown className={cn("w-3 h-3 transition-transform", isPicFilterOpen ? "rotate-180" : "")} />
            </button>
            
            {isPicFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-[#1a1f30] border border-white/10 rounded-2xl shadow-2xl z-[120] p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Filter by PIC</span>
                  <button 
                    onClick={() => setPicFilters([])}
                    className="text-[8px] font-black text-slate-500 uppercase hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {availablePics.map(pic => (
                    <button 
                      key={pic}
                      onClick={() => {
                        setPicFilters(prev => 
                          prev.includes(pic) 
                            ? prev.filter(s => s !== pic) 
                            : [...prev, pic]
                        );
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold transition-all",
                        picFilters.includes(pic) ? "bg-indigo-600/20 text-white" : "text-slate-500 hover:bg-white/5"
                      )}
                    >
                      <span>{pic}</span>
                      {picFilters.includes(pic) && <Check className="w-3 h-3 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-white/5 mx-1" />

          <button 
            onClick={() => {
              setSearchQuery('');
              setStatusFilter(null);
              setSelectedStatuses(MIGRATION_STATUSES);
              setPicFilters([]);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-rose-400 transition-all group"
            title="Reset All Filters"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            RESET
          </button>

          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="SEARCH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-indigo-500/50 transition-all w-full md:w-48"
            />
          </div>
        </div>
      </div>

      {/* Summary Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 py-4 px-6 bg-[#0a0f1d] border-b border-white/5">
        {/* 1. ABSOLUTE TOTAL CARD (Always Visible, Unfiltered Count) */}
        <div className="p-3 rounded-xl border border-teal-600 bg-gradient-to-br from-[#1a1f30] to-teal-900/20 shadow-lg shadow-teal-900/10 flex flex-col justify-between h-24">
          <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest min-h-[30px]">TOTAL PROJECTS</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl text-white font-black">{projects.length}</h2>
            <span className="text-[10px] text-gray-400 mb-1">ALL STATUSES</span>
          </div>
        </div>

        {MIGRATION_STATUSES.map((status) => {
          const count = statusCounts[status] || 0;
          const isActive = statusFilter === status;
          return (
            <button 
              key={status}
              onClick={() => {
                setStatusFilter(isActive ? null : status);
                if (!selectedStatuses.includes(status)) {
                  setSelectedStatuses(prev => [...prev, status]);
                }
              }}
              className={cn(
                "p-3 rounded-xl border text-left transition flex flex-col justify-between h-24 relative group",
                isActive ? "bg-indigo-600/40 border-indigo-500 ring-1 ring-indigo-500 shadow-xl shadow-indigo-600/40" : "bg-[#1a1f30] border-white/5 hover:border-white/10"
              )}
            >
              <div className={cn("text-[10px] font-black uppercase tracking-widest line-clamp-2 leading-tight min-h-[24px]", isActive ? "text-white/60" : "text-slate-500")}>
                {status}
              </div>
              <div className="text-2xl font-black text-white">{count}</div>
              {isActive && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>
          );
        })}
      </div>

      {/* Board Area */}
      <div className="flex-1 overflow-x-auto p-6 scrollbar-hide">
        {selectedStatuses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
             <Filter className="w-16 h-16 opacity-10" />
             <div className="text-center">
               <p className="text-sm font-black uppercase tracking-[0.2em]">Board Empty</p>
               <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Please select at least one status to monitor.</p>
             </div>
          </div>
        ) : (
          <div className="flex flex-wrap lg:flex-nowrap gap-4 items-start h-full min-w-max">
            {selectedStatuses.map(status => {
              const laneProjects = filteredProjects.filter(p => p.last_status === status);
              const colorClass = STATUS_COLORS[status] || 'bg-gray-800 text-gray-300 border-gray-600';
              const borderClass = colorClass.split(' ').find(c => c.startsWith('border-')) || 'border-white/5';

              return (
                <div key={status} className={cn(
                  "w-full md:w-80 flex-shrink-0 flex flex-col bg-[#121620]/50 border border-white/5 rounded-2xl max-h-full shadow-2xl transition-all",
                  statusFilter === status ? "ring-2 ring-indigo-500/50 shadow-indigo-500/10" : "shadow-black/40"
                )}>
                  {/* Lane Header with color-coded accent */}
                  <div className={cn(
                    "p-4 border-b-2 flex items-center justify-between bg-[#1a1f30] rounded-t-2xl sticky top-0 z-10",
                    borderClass
                  )}>
                    <h3 className={cn("font-black text-[10px] uppercase tracking-widest truncate flex-1 pr-2", colorClass.split(' ')[1])}>
                      {status}
                    </h3>
                    <span className="px-2 py-1 rounded-lg bg-black/40 text-[9px] font-black text-white shadow-inner">
                      {laneProjects.length}
                    </span>
                  </div>

                  {/* Card Container */}
                  <div className="p-3 overflow-y-auto space-y-3 custom-scrollbar flex-1 max-h-[calc(100vh-320px)]">
                    <AnimatePresence mode="popLayout">
                      {laneProjects.map(project => (
                        <motion.div 
                          key={project.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-[#1a1f30] border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 flex flex-col gap-3 transition-all cursor-pointer group hover:shadow-xl hover:shadow-indigo-500/5 relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => {
                                setSelectedProject(project);
                                setIsEditing(false);
                              }}
                            >
                              <h4 className="text-white font-bold text-xs leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2 pr-2">{project.project_name}</h4>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProject(project);
                                  setIsEditing(true);
                                }}
                                className="p-1.5 bg-white/5 hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-400 rounded-lg transition-all"
                                title="Edit Project"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProject(project);
                                  setIsEditing(false);
                                }}
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-lg transition-all"
                                title="View Details"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => {
                              setSelectedProject(project);
                              setIsEditing(false);
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black border border-white/10">
                                {project.pic_name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[100px]">{project.pic_name}</span>
                            </div>
                            <div className="text-[9px] font-mono text-slate-700 bg-black/20 px-1.5 py-0.5 rounded uppercase">{project.ticket_id || '---'}</div>
                          </div>

                          {project.last_update_log && (
                            <div 
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedProject(project);
                                setIsEditing(false);
                              }}
                            >
                              <p className="text-[9px] text-slate-500 italic line-clamp-2 border-t border-white/5 pt-2 leading-relaxed">
                                {project.last_update_log}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {laneProjects.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 opacity-20">
                        <Database className="w-8 h-8 mb-2" />
                        <p className="text-[9px] font-black uppercase tracking-widest">No Projects</p>
                      </div>
                    )}
                  </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* Property Detail Modal */}
      {selectedProject && tempProject && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={() => setSelectedProject(null)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#0f1423] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-8 border-b border-white/5 flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {isEditing ? (
                    <input 
                      value={tempProject.ticket_id || ''}
                      onChange={(e) => setTempProject({ ...tempProject, ticket_id: e.target.value })}
                      placeholder="TICKET-ID"
                      className="px-3 py-1 bg-indigo-600 rounded text-[10px] font-black text-white uppercase outline-none w-32 placeholder:text-white/40 ring-2 ring-white/20 focus:ring-white transition-all shadow-lg"
                    />
                  ) : (
                    <div className="px-3 py-1 bg-indigo-600 rounded text-[10px] font-black text-white uppercase tracking-widest">
                      {selectedProject.ticket_id || 'NO TICKET'}
                    </div>
                  )}
                  
                  <div className="relative group/status">
                    {isEditing ? (
                      <select 
                        value={tempProject.last_status}
                        onChange={(e) => setTempProject({ ...tempProject, last_status: e.target.value })}
                        className={cn(
                          "text-[10px] px-3 py-1 rounded-lg border font-black uppercase tracking-widest bg-transparent cursor-pointer focus:outline-none appearance-none pr-8 outline-none ring-2 ring-white/10 focus:ring-white/30",
                          STATUS_COLORS[tempProject.last_status] || "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        )}
                      >
                        {MIGRATION_STATUSES.map(s => (
                          <option key={s} value={s} className="bg-[#1a1f30] text-white uppercase tracking-widest font-black">{s}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={cn(
                        "text-[10px] px-3 py-1 rounded-lg border font-black uppercase tracking-widest",
                        STATUS_COLORS[selectedProject.last_status] || "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      )}>
                        {selectedProject.last_status}
                      </span>
                    )}
                    {isEditing && <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-current pointer-events-none" />}
                  </div>
                </div>

                {isEditing ? (
                  <input 
                    value={tempProject.project_name}
                    onChange={(e) => setTempProject({ ...tempProject, project_name: e.target.value })}
                    className="text-3xl font-black text-white leading-tight bg-white/5 border-none outline-none w-full rounded-xl px-3 py-2 transition-all ring-2 ring-transparent focus:ring-indigo-500/50"
                    placeholder="Enter project name..."
                  />
                ) : (
                  <h2 className="text-3xl font-black text-white leading-tight px-1">{selectedProject.project_name}</h2>
                )}
              </div>
              <div className="flex items-center gap-3">
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-2xl transition-all flex items-center gap-2 group"
                  >
                    <Pencil className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest pr-1">Edit Project</span>
                  </button>
                )}
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="p-3 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 rounded-2xl transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex px-8 border-b border-white/5">
              <button 
                onClick={() => setActiveTab('DETAILS')}
                className={cn(
                  "px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                  activeTab === 'DETAILS' ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
                )}
              >
                PROPERTIES & NOTES
                {activeTab === 'DETAILS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
              </button>
              <button 
                onClick={() => setActiveTab('HISTORY')}
                className={cn(
                  "px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                  activeTab === 'HISTORY' ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
                )}
              >
                HISTORY LOG ({historyLogs.length})
                {activeTab === 'HISTORY' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {activeTab === 'DETAILS' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-2">Primary Assignment</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">PIC Name</label>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-black text-white shrink-0">
                              {(isEditing ? tempProject.pic_name : selectedProject.pic_name).charAt(0)}
                            </div>
                            <div className="flex-1 relative">
                              {isEditing ? (
                                <CreatableSelect
                                  isClearable
                                  options={availablePics.map(pic => ({ value: pic, label: pic }))}
                                  value={{ value: tempProject.pic_name, label: tempProject.pic_name }}
                                  onChange={(val: any) => setTempProject({ ...tempProject, pic_name: val?.value || 'Unassigned' })}
                                  placeholder="Select or type new PIC..."
                                  className="react-select-container"
                                  classNamePrefix="react-select"
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      background: 'rgba(255, 255, 255, 0.05)',
                                      borderColor: 'rgba(255, 255, 255, 0.1)',
                                      borderRadius: '0.75rem',
                                      fontSize: '0.875rem',
                                      color: 'white',
                                      '&:hover': {
                                        borderColor: 'rgba(99, 102, 241, 0.5)'
                                      }
                                    }),
                                    menu: (base) => ({
                                      ...base,
                                      background: '#1a1f30',
                                      border: '1px border-white/10',
                                      borderRadius: '0.75rem',
                                      overflow: 'hidden'
                                    }),
                                    option: (base, state) => ({
                                      ...base,
                                      background: state.isFocused ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                      color: 'white',
                                      fontSize: '0.75rem',
                                      fontWeight: '600',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em'
                                    }),
                                    singleValue: (base) => ({
                                      ...base,
                                      color: 'white',
                                      fontWeight: '700'
                                    }),
                                    input: (base) => ({
                                      ...base,
                                      color: 'white'
                                    })
                                  }}
                                />
                              ) : (
                                <div className="text-white font-bold text-lg">{selectedProject.pic_name}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Owner Division</label>
                            {isEditing ? (
                              <input 
                                value={tempProject.owner_div || ''}
                                onChange={(e) => setTempProject({ ...tempProject, owner_div: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 outline-none font-bold text-white w-full uppercase text-xs"
                                placeholder="DIVISION..."
                              />
                            ) : (
                              <div className="font-bold text-white uppercase">{selectedProject.owner_div || 'N/A'}</div>
                            )}
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Owner Name</label>
                            {isEditing ? (
                              <input 
                                value={tempProject.owner_name || ''}
                                onChange={(e) => setTempProject({ ...tempProject, owner_name: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 outline-none font-bold text-white w-full text-xs"
                                placeholder="Owner Name..."
                              />
                            ) : (
                              <div className="text-sm text-slate-500 font-medium">{selectedProject.owner_name || 'N/A'}</div>
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Project Category</label>
                          {isEditing ? (
                            <input 
                              value={tempProject.project_type || ''}
                              onChange={(e) => setTempProject({ ...tempProject, project_type: e.target.value })}
                              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 outline-none font-bold text-white w-full uppercase text-xs"
                              placeholder="CATEGORY..."
                            />
                          ) : (
                            <div className="font-bold text-white uppercase">{selectedProject.project_type}</div>
                          )}
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                         <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Project Notes</h3>
                      </div>
                      <div className="relative group">
                        {isEditing ? (
                          <textarea 
                            value={tempProject.last_update_log || ''}
                            onChange={(e) => setTempProject({ ...tempProject, last_update_log: e.target.value })}
                            className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-6 text-xs text-slate-300 font-medium leading-[1.8] focus:border-indigo-500/50 outline-none resize-none transition-all ring-2 ring-transparent focus:ring-indigo-500/10 placeholder:text-slate-700"
                            placeholder="Add project updates here..."
                          />
                        ) : (
                          <div className="w-full min-h-[16rem] bg-black/20 border border-white/5 rounded-2xl p-6 text-xs text-slate-400 font-medium leading-[1.8] whitespace-pre-wrap">
                            {selectedProject.last_update_log || 'No notes available...'}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-2">Raw Metadata & Properties</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {Object.entries((isEditing ? tempProject.raw_data : selectedProject.raw_data) || {}).map(([k, v]) => {
                          if (!v || v === 'null') return null;
                          const isSpecial = k.toLowerCase().includes('date') || k.toLowerCase().includes('time') || k.toLowerCase().includes('status');
                          return (
                            <div key={k} className="p-3 bg-white/5 rounded-xl border border-white/5 group/row">
                              <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block mb-1 opacity-60 transition-opacity">{k}</span>
                              {isEditing ? (
                                <input 
                                  value={String(v)}
                                  onChange={(e) => {
                                    const newRaw = { ...tempProject.raw_data, [k]: e.target.value };
                                    setTempProject({ ...tempProject, raw_data: newRaw });
                                  }}
                                  className={cn(
                                    "text-[10px] text-white font-bold bg-white/5 rounded px-2 py-1 outline-none w-full",
                                    isSpecial && "text-yellow-500/80"
                                  )}
                                />
                              ) : (
                                <div className={cn(
                                  "text-[10px] text-white font-bold px-2",
                                  isSpecial && "text-yellow-500/80"
                                )}>
                                  {String(v)}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20">
                      <Clock className="w-16 h-16 mb-4" />
                      <p className="font-black uppercase tracking-[0.2em]">No History Records</p>
                    </div>
                  ) : (
                    <div className="space-y-4 opacity-100">
                      {historyLogs.map((log, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx} 
                          className="p-6 bg-white/5 border border-white/5 rounded-2xl group flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{log.field_name}</span>
                              <span className="text-[10px] text-slate-500 font-bold">• {new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] text-rose-400 font-medium line-through opacity-50">
                                {log.old_value}
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-700" />
                              <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded text-[10px] text-green-400 font-bold">
                                {log.new_value}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-xl border border-white/5">
                            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
                              {log.changed_by.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{log.changed_by.split('@')[0]}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            {isEditing && (
              <div className="p-8 border-t border-white/5 bg-black/20 flex items-center justify-end gap-3">
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    if (selectedProject) setTempProject({ ...selectedProject });
                  }}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all"
                >
                  Discard Changes
                </button>
                <button 
                  onClick={handleSaveClick}
                  disabled={isUpdating}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-indigo-600/40"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Save Changes'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmSave}
        title="Save Changes?"
        message={`Are you sure you want to save the modifications made to project "${tempProject?.project_name}"? This action will be logged in the history.`}
        confirmText="Yes, Save Changes"
      />
    </div>
  );
}
