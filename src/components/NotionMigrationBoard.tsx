import React, { useState, useEffect, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import { MigrateNotion } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import CreatableSelect from 'react-select/creatable';
import { 
  Upload, 
  Database, 
  LayoutGrid, 
  ChevronDown, 
  ChevronRight, 
  User, 
  Trash2, 
  Loader2, 
  Filter,
  CheckCircle2,
  Clock,
  PlayCircle,
  PauseCircle,
  XCircle,
  MoreHorizontal,
  Search,
  History,
  Pencil,
  Eye,
  RotateCcw
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { cn } from '../lib/utils';
import { MIGRATION_STATUSES, STATUS_COLORS } from '../constants/migration';

export default function NotionMigrationBoard() {
  const [data, setData] = useState<MigrateNotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedProject, setSelectedProject] = useState<MigrateNotion | null>(null);
  const [editedNotes, setEditedNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'HISTORY'>('DETAILS');
  const [initialPic, setInitialPic] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tempProject, setTempProject] = useState<MigrateNotion | null>(null);
  
  // Filters
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [picFilters, setPicFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const CACHE_KEY = 'om_dedy_notion_migration_cache';

  const fetchMigrateData = async (force = false) => {
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
      }
    }
    try {
      const { data: migrateData, error } = await supabase
        .from('migrate_notion')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(migrateData || []);
      localStorage.setItem(CACHE_KEY, JSON.stringify(migrateData || []));
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
    fetchMigrateData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      setEditedNotes(selectedProject.last_update_log || '');
      setTempProject({ ...selectedProject });
      setActiveTab('DETAILS');
      if (selectedProject.ticket_id) fetchHistory(selectedProject.ticket_id);
    } else {
      setTempProject(null);
    }
  }, [selectedProject]);

  const handleSaveClick = () => {
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    if (!tempProject || !selectedProject) return;
    setIsUpdating(true);
    try {
      const changes: Record<string, any> = {};
      const logPromises: Promise<void>[] = [];

      // Check for changes
      const fieldsToTrack: (keyof MigrateNotion)[] = ['ticket_id', 'project_name', 'last_status', 'pic_name', 'owner_div', 'owner_name', 'project_type', 'last_update_log'];
      
      fieldsToTrack.forEach(field => {
        if (tempProject[field] !== selectedProject[field]) {
          changes[field] = tempProject[field];
          logPromises.push(logChange(tempProject.ticket_id || tempProject.id, field.replace(/_/g, ' '), selectedProject[field], tempProject[field]));
        }
      });

      // Raw data changes
      if (JSON.stringify(tempProject.raw_data) !== JSON.stringify(selectedProject.raw_data)) {
        changes.raw_data = tempProject.raw_data;
        logPromises.push(logChange(tempProject.ticket_id || tempProject.id, 'Raw Metadata', 'Changed', 'Updated'));
      }

      if (Object.keys(changes).length === 0) {
        setIsEditing(false);
        return;
      }

      const { error } = await supabase
        .from('migrate_notion')
        .update(changes)
        .eq('id', selectedProject.id);

      if (error) throw error;

      await Promise.all(logPromises);
      
      setData(prev => prev.map(p => p.id === selectedProject.id ? { ...p, ...changes } : p));
      setSelectedProject({ ...selectedProject, ...changes });
      localStorage.removeItem(CACHE_KEY);
      
      if (selectedProject.ticket_id) fetchHistory(selectedProject.ticket_id);
      setIsEditing(false);
    } catch (err) {
      console.error('Save Error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

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
      
      setData(prev => prev.map(p => p.id === selectedProject.id ? { ...p, last_update_log: editedNotes } : p));
      setSelectedProject(prev => prev ? { ...prev, last_update_log: editedNotes } : null);
      if (selectedProject.ticket_id) fetchHistory(selectedProject.ticket_id);
      alert('Notes updated successfully!');
    } catch (err) {
      console.error('Update Error:', err);
      alert('Failed to update notes.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearAndImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      // 1. Delete existing data (Standard idiom for "delete all")
      const { error: deleteError } = await supabase
        .from('migrate_notion')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) throw deleteError;

      // 2. Parse and Insert
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const { data: rows } = results;
          
          // 1. Map raw data
          const mappedData = rows.map((row: any) => {
            const rawStatus = row['Last Status'] ? row['Last Status'].trim() : '';
            
            return {
              ticket_id: row['Ticket'] || null,
              project_name: row['Name'] || row['Project Name'] || '',
              last_status: rawStatus,
              pic_name: row['PIC Name'] || 'Unassigned',
              owner_div: row['Owner Div'] || null,
              owner_name: row['Owner Name'] || null,
              project_type: row['Type Project'] || 'Uncategorized',
              last_update_log: row['Last Update'] || row['(Dev) Progress Updated'] || row['(SIT) Progress Updated'] || null,
              raw_data: row
            };
          });

          // 2. Filter out ghost rows and excluded statuses
          const cleanData = mappedData.filter(row => {
            // A. Remove Ghost Rows
            if (!row.project_name || row.project_name.trim() === '') {
              return false;
            }

            // B. Exclude "Live", "Monitoring", "Done"
            const statusLower = row.last_status.toLowerCase();
            if (
              statusLower.includes('live') || 
              statusLower.includes('monitoring') || 
              statusLower.includes('done') ||
              statusLower === 'live on monitoring'
            ) {
              return false;
            }

            return true;
          });

          // 3. Normalize Fallback and Match Constants
          const finalDataToInsert = cleanData.map(row => {
            const raw = row.last_status === '' ? 'On Queue' : row.last_status;
            // Match with MIGRATION_STATUSES if possible for exact casing
            const sanitized = MIGRATION_STATUSES.find(
              s => s.toLowerCase() === raw.toLowerCase()
            ) || raw;

            return {
              ...row,
              last_status: sanitized
            };
          });

          if (finalDataToInsert.length === 0) {
            alert('No valid projects found to import (or all were Live/Monitoring).');
            setIsImporting(false);
            return;
          }

          // 4. Batch insert 
          const { error: insertError } = await supabase.from('migrate_notion').insert(finalDataToInsert);
          
          if (insertError) {
            console.error('Insert Error:', insertError);
            alert('Failed to import data!');
          } else {
            alert(`Successfully imported ${finalDataToInsert.length} projects!`);
            localStorage.removeItem('om_dedy_notion_data'); // Cleanup cache
            fetchMigrateData();
          }
          
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      });
    } catch (err) {
      console.error('Import Error:', err);
      alert('An error occurred during re-import.');
      setIsImporting(false);
    }
  };

  // Memoized Data Processing
  const { picCounts, statusCounts, groupedData } = useMemo(() => {
    // 1. Calculate Summary (always based on full data fetched)
    const picAcc: Record<string, number> = {};
    const statusAcc: Record<string, number> = {};
    
    // Initialize statusAcc with all statuses
    MIGRATION_STATUSES.forEach(status => {
      statusAcc[status] = 0;
    });

    data.forEach(item => {
      // PIC
      const pic = item.pic_name || 'Unassigned';
      picAcc[pic] = (picAcc[pic] || 0) + 1;

      // Status for Summary Cards - exact match
      const status = item.last_status || 'On Queue';
      if (statusAcc.hasOwnProperty(status)) {
        statusAcc[status]++;
      }
    });

    // 2. Filter Content
    let result = data;
    
    if (statusFilters.length > 0) {
      result = result.filter(item => statusFilters.includes(item.last_status));
    }

    if (picFilters.length > 0) {
      result = result.filter(item => picFilters.includes(item.pic_name || 'Unassigned'));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.project_name.toLowerCase().includes(q) || 
        (item.ticket_id || '').toLowerCase().includes(q) ||
        (item.pic_name || '').toLowerCase().includes(q)
      );
    }

    // 3. Grouping
    const groups: Record<string, MigrateNotion[]> = {};
    result.forEach(item => {
      const type = item.project_type || 'Uncategorized';
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    });

    return { 
      picCounts: picAcc, 
      statusCounts: statusAcc,
      groupedData: groups 
    };
  }, [data, statusFilters, picFilters, searchQuery]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  return (
    <div className="p-6 bg-[#0a0f1d] min-h-screen text-slate-300">
      {/* Loading Overlay */}
      {isImporting && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#1a1f30] p-10 rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center max-w-sm">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
            <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Processing Notion Data</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
              Clearing existing records and inserting new transactions. Please do not close this tab.
            </p>
            <div className="w-full bg-white/5 h-1 rounded-full mt-8 overflow-hidden">
              <div className="bg-indigo-500 h-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
            <Database className="w-8 h-8 text-indigo-500" />
            Om Dedy <span className="text-indigo-500">Notion Migrate</span>
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Migration Sandbox • Production Exclusion Logic Active</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => fetchMigrateData(true)}
            className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            title="Force Refresh Data"
          >
            <Loader2 className={cn("w-4 h-4 text-indigo-400", loading ? "animate-spin" : "")} />
          </button>

          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="SEARCH PROJECTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-indigo-500/50 transition-all w-48 md:w-64"
            />
          </div>

          <button 
            onClick={() => {
              setStatusFilters([]);
              setPicFilters([]);
              setSearchQuery('');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
            title="Reset All Filters"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
            disabled={isImporting}
          >
            <Database className="w-4 h-4" />
            Clear & Re-import Data
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleClearAndImport} 
            />
          </button>
        </div>
      </div>

      {/* Summary Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {/* 1. ABSOLUTE TOTAL CARD (Always Visible, Unfiltered Count) */}
        <div className="p-3 rounded-xl border border-teal-600 bg-gradient-to-br from-[#1a1f30] to-teal-900/20 shadow-lg shadow-teal-900/10 flex flex-col justify-between h-24">
          <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest min-h-[30px]">TOTAL PROJECTS</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl text-white font-black">{data.length}</h2>
            <span className="text-[10px] text-gray-500 mb-1">ALL STATUSES</span>
          </div>
        </div>

        {MIGRATION_STATUSES.map((status) => {
          const count = statusCounts[status] || 0;
          const isActive = statusFilters.includes(status);
          return (
            <button 
              key={status}
              onClick={() => {
                setStatusFilters(prev => 
                  prev.includes(status) 
                    ? prev.filter(s => s !== status) 
                    : [...prev, status]
                );
              }}
              className={cn(
                "p-3 rounded-xl border text-left transition flex flex-col justify-between h-24 relative group",
                isActive ? "bg-indigo-600/40 border-indigo-500 ring-1 ring-indigo-500 shadow-xl shadow-indigo-600/40" : "bg-[#1a1f30] border-gray-700 hover:border-gray-500"
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

      {/* PIC Filter Dropdown - Redesigned to 5-column grid */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-3 h-3 text-indigo-500" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Filter PIC Name:</span>
          {picFilters.length > 0 && (
            <button onClick={() => setPicFilters([])} className="text-[10px] text-indigo-400 font-bold hover:underline ml-2 uppercase tracking-widest">Reset PIC Filters</button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Object.entries(picCounts).sort((a,b) => b[1] - a[1]).map(([pic, count]) => {
            const isActive = picFilters.includes(pic);
            return (
              <button 
                key={pic}
                onClick={() => {
                  setPicFilters(prev => 
                    prev.includes(pic)
                      ? prev.filter(p => p !== pic)
                      : [...prev, pic]
                  );
                }}
                className={cn(
                  "flex justify-between items-center bg-[#1a1f30] rounded-xl border transition-all h-10 overflow-hidden group",
                  isActive ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-600/20" : "border-white/5 hover:border-indigo-500/50"
                )}
              >
                <span className={cn(
                  "px-3 font-black text-[10px] uppercase truncate tracking-widest",
                  isActive ? "text-white" : "text-yellow-500/80 group-hover:text-yellow-400"
                )} title={pic}>
                  {pic}
                </span>
                <span className={cn(
                  "px-3 h-full flex items-center bg-white/5 text-[10px] font-black",
                  isActive ? "bg-indigo-600/40 text-white" : "text-slate-500"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : Object.keys(groupedData).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-3xl">
          <Database className="w-12 h-12 text-slate-700 mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No matching projects found</p>
          {(statusFilters.length > 0 || picFilters.length > 0 || searchQuery) && (
             <button onClick={() => { setStatusFilters([]); setPicFilters([]); setSearchQuery(''); }} className="mt-4 text-indigo-500 text-[10px] font-black uppercase tracking-widest hover:underline">Clear all filters</button>
          )}
        </div>
      ) : (
        <div className="space-y-8 pb-32">
          {Object.entries(groupedData).sort().map(([type, items]) => (
            <div key={type} className="space-y-4">
              <button 
                onClick={() => toggleGroup(type)}
                className="flex items-center gap-3 w-full text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/20 transition-colors">
                  {expandedGroups[type] !== false ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">{type}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-slate-500">
                    {items.length} PROJECTS
                  </span>
                </div>
                <div className="h-px grow bg-gradient-to-r from-white/10 to-transparent ml-4" />
              </button>

              {expandedGroups[type] !== false && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map((project) => (
                    <motion.div 
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={cn(
                        "bg-[#1a1f30] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-5 flex flex-col gap-3 transition-all group relative hover:shadow-2xl hover:shadow-indigo-500/10"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            setSelectedProject(project);
                            setIsEditing(false);
                          }}
                        >
                          <h3 className="text-white font-bold text-sm leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2">{project.project_name}</h3>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => {
                              setSelectedProject(project);
                              setIsEditing(true);
                            }}
                            className="p-2 bg-white/5 hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-400 rounded-lg transition-all"
                            title="Edit Project"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedProject(project);
                              setIsEditing(false);
                            }}
                            className="p-2 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded-md border font-black uppercase tracking-widest",
                          STATUS_COLORS[project.last_status] || "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        )}>
                          {project.last_status}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-[9px] font-black border border-indigo-500/20">
                            {project.pic_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{project.pic_name}</span>
                        </div>
                      </div>

                      <div 
                        className="mt-2 pt-4 border-t border-white/5 cursor-pointer"
                        onClick={() => {
                          setSelectedProject(project);
                          setIsEditing(false);
                        }}
                      >
                        <p className="text-slate-500 text-[11px] font-medium leading-relaxed whitespace-pre-wrap italic line-clamp-4 group-hover:line-clamp-none transition-all">
                          {project.last_update_log || 'No recent updates or comments...'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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
                                  options={Object.keys(picCounts).map(pic => ({ value: pic, label: pic }))}
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
