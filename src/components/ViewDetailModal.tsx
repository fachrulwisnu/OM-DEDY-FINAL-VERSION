import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Star, Calendar, Clock, Activity, History, AlertCircle, CheckCircle2, TrendingUp, BarChart3, ListChecks } from 'lucide-react';
import { NotionApiProject } from '../types';
import { cn } from '../lib/utils';

interface ViewDetailModalProps {
  project: NotionApiProject | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewDetailModal({ project, isOpen, onClose }: ViewDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'feedback'>('overview');

  if (!isOpen || !project) return null;

  const raw = project.raw_data || {};

  // Helper to colorize SLA
  const getSlaColor = (status: string | any) => {
    if (typeof status !== 'string') return "text-gray-400 border-gray-600 bg-gray-800";
    if (status.includes("Achieved")) return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    if (status.includes("Not Achieved")) return "text-red-400 border-red-400/30 bg-red-400/10";
    if (status.includes("TRUE")) return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    if (status.includes("FALSE")) return "text-red-400 border-red-400/30 bg-red-400/10";
    return "text-gray-400 border-gray-600 bg-gray-800"; // default/Without/empty
  };

  const Section = ({ title, icon: Icon, children, className }: any) => (
    <div className={cn("bg-[var(--bg-page)]/20 rounded-2xl border border-[var(--border)] p-6 mb-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-[var(--accent)]" />
        <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em]">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );

  const Stat = ({ label, value, colorClass = "text-[var(--text-main)]" }: any) => (
    <div className="flex flex-col">
      <span className="text-[9px] font-black text-[var(--text-sub)] uppercase tracking-widest mb-1.5">{label}</span>
      <span className={cn("text-[13px] font-bold break-words whitespace-pre-wrap leading-relaxed", colorClass)}>
        {value === null || value === undefined || value === '' ? '-' : String(value)}
      </span>
    </div>
  );

  const Badge = ({ label, value, color = "accent" }: any) => {
    const colors: Record<string, string> = {
      accent: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
      emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
    return (
      <div className={cn("px-4 py-3 rounded-xl border flex flex-col gap-1", colors[color])}>
        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{label}</span>
        <span className="text-sm font-black">{value || '-'}</span>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl h-[90vh] bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card)]/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--accent)]/20 rounded-2xl flex items-center justify-center text-[var(--accent)] shadow-inner">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[var(--text-main)] uppercase italic tracking-tighter leading-tight">
                  {project.project_name}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-[var(--accent)] font-black uppercase tracking-widest bg-[var(--accent)]/10 px-2 py-0.5 rounded">
                    ID: {project.ticket_id || 'NO_TICKET'}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-[var(--text-sub)]/30" />
                  <span className="text-[9px] text-[var(--text-sub)] font-bold uppercase tracking-widest">
                    SYNCED FROM NOTION API
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-[var(--bg-page)] rounded-xl text-[var(--text-sub)] hover:text-[var(--text-main)] transition-all group"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-8 bg-[var(--bg-page)]/20 border-b border-[var(--border)] flex gap-8">
            {[
              { id: 'overview', label: 'Overview & SLA', icon: Activity },
              { id: 'timeline', label: 'Timeline Logs', icon: History },
              { id: 'feedback', label: 'Feedback Metrics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "py-4 flex items-center gap-2 border-b-2 transition-all relative",
                  activeTab === tab.id 
                    ? "border-[var(--accent)] text-[var(--text-main)] font-black" 
                    : "border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)] font-bold"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-[var(--accent)]" : "text-current")} />
                <span className="text-xs uppercase tracking-widest">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-[var(--accent)]/5 blur-xl -z-10"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                       <Section title="Project Metadata" icon={ListChecks}>
                          <Stat label="Project Name" value={raw["Project Name"] || project.project_name} />
                          <Stat label="Ticket ID" value={raw["Ticket"] || project.ticket_id} />
                          <Stat label="Project Type" value={raw["Type Project"] || project.project_type} />
                          <Stat label="PIC Name" value={raw["PIC Name"] || project.pic_name} />
                          <Stat label="Owner Name" value={raw["Owner Name"] || project.owner_name} />
                          <Stat label="Division" value={raw["Owner Div"] || project.owner_div} />
                       </Section>

                      {/* Performance & Effort Metrics Dashboard */}
                      <div className="space-y-6">
                        {/* Top Meta Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Effective Days</p>
                            <p className="text-2xl font-black text-white">{raw["Total Effective days"] || "-"} <span className="text-xs font-normal text-slate-600 italic">Days</span></p>
                          </div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Diajukan</p>
                            <p className="text-2xl font-black text-white">{raw["Project diajukan"] || "-"}</p>
                          </div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress PMA</p>
                            <p className="text-2xl font-black text-white">{raw["Progress PMA"] || "-"}</p>
                          </div>
                        </div>

                        {/* Phase Performance Grid */}
                        <div className="bg-black/20 rounded-2xl border border-white/5 p-6">
                          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                             <TrendingUp className="w-4 h-4 text-indigo-400" />
                             <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Phase Performance (SLA & Late Days)</h3>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { phase: "FSD Performance", sla: raw["FSD SLA Status"], late: raw["(FSD) Late Days"], elapse: raw["(FSD) Elapse Days"] },
                              { phase: "DEV Performance", sla: raw["DEV SLA"], late: raw["(Dev) Late Days"], elapse: raw["(Dev) Elapse Days"] },
                              { phase: "SIT Performance", sla: raw["SIT SLA Status"], late: raw["(SIT) Late Days"], elapse: raw["(SIT) Elapse Days"] },
                              { phase: "UAT Performance", sla: raw["UAT SLA Status"], late: raw["(UAT) Late Days"], elapse: raw["(UAT) Elapse Days"] },
                            ].map((item, i) => (
                              <div key={i} className={cn("p-4 rounded-2xl border border-white/5 flex flex-col gap-3 transition-all", getSlaColor(item.sla))}>
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-80">{item.phase}</p>
                                <div className="space-y-2 text-[11px] font-bold">
                                  <div className="flex justify-between items-center"><span className="opacity-40 uppercase text-[9px]">SLA</span> <span className={cn(item.sla === 'Achieved' ? 'text-emerald-400' : '')}>{item.sla || "-"}</span></div>
                                  <div className="flex justify-between items-center"><span className="opacity-40 uppercase text-[9px]">Late</span> <span>{item.late || "-"}</span></div>
                                  <div className="flex justify-between items-center"><span className="opacity-40 uppercase text-[9px]">Elapse</span> <span>{item.elapse || "-"} <span className="opacity-30 text-[9px]">Days</span></span></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Effective Days Breakdown */}
                        <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                          <div className="flex items-center gap-2 mb-3">
                             <Clock className="w-4 h-4 text-indigo-400" />
                             <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Effective Days Breakdown</h4>
                          </div>
                          <pre className="text-[11px] text-slate-400 whitespace-pre-wrap font-mono leading-relaxed bg-black/20 p-5 rounded-2xl border border-white/10 shadow-inner">
                            {raw["Effective days"] || "Tidak ada detail waktu."}
                          </pre>
                        </div>
                      </div>
                     </div>

                     <div className="space-y-6">
                        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6 shadow-xl">
                           <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Activity className="w-4 h-4" />
                              Current Execution State
                           </h3>
                           <div className="space-y-4">
                              <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Global Status</span>
                                 <span className="text-sm font-black text-white">{raw["Last Status"] || project.last_status}</span>
                              </div>
                              <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">FSD Status</span>
                                 <span className="text-sm font-black text-white">{raw["(FSD) Status"] || project.fsd_status || '-'}</span>
                              </div>
                              <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">UAT Status</span>
                                 <span className="text-sm font-black text-white">{raw["(UAT) Status"] || project.uat_status || '-'}</span>
                              </div>
                           </div>
                        </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'timeline' && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="h-full flex flex-col gap-6"
                >
                  <div className="bg-black/20 rounded-3xl border border-white/5 flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                       <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <History className="w-4 h-4 text-indigo-400" />
                          Activity Execution Logs
                       </h3>
                    </div>
                    <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                       <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-white/5">
                          <div className="relative pl-10">
                             <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                             </div>
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Last Update Log</span>
                             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-slate-300 leading-relaxed font-medium">
                                {project.last_update_log || 'No logs available for this project.'}
                             </div>
                          </div>

                          {raw['(Dev) Progress Updated'] && (
                            <div className="relative pl-10">
                              <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-amber-600/20 border border-amber-500/40 flex items-center justify-center">
                                 <div className="w-2 h-2 rounded-full bg-amber-500" />
                              </div>
                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block mb-1">Dev Progress Update</span>
                              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-slate-300 leading-relaxed font-medium">
                                 {raw['(Dev) Progress Updated']}
                              </div>
                            </div>
                          )}

                          {raw['(FSD) Progress Updated'] && (
                            <div className="relative pl-10">
                              <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              </div>
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1">FSD Progress Update</span>
                              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-slate-300 leading-relaxed font-medium">
                                 {raw['(FSD) Progress Updated']}
                              </div>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'feedback' && (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-8 mb-8">
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                           <BarChart3 className="w-10 h-10 text-white" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Overall Performance Score</h3>
                           <p className="text-indigo-400 text-xs font-bold mt-1 uppercase tracking-widest">Weighted metric based on user feedback categories</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Rata-rata Nilai Feedback User New</div>
                        <div className="text-6xl font-black text-indigo-500 tracking-tighter drop-shadow-lg flex items-baseline gap-2">
                           {project.feedback_overall_score || raw['Rata-rata Nilai Feedback User New :'] || '0.0'}
                           <span className="text-xl text-indigo-400/40 italic">/ 5.0</span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { label: "Pemahaman Kebutuhan Klien", val: raw["Nilai Feedback User : Memahami kebutuhan klien dengan tepat."] },
                      { label: "Kejelasan Komunikasi", val: raw["Nilai Feedback User :\nKejelasan komunikasi dan mudah dihubungi."] },
                      { label: "Manajemen Konflik", val: raw["Nilai Feedback User :\nMembantu menyelesaikan konflik di dalam Project."] },
                      { label: "Keterampilan Teknis & Dok", val: raw["Nilai Feedback User :\nKeterampilan teknis dan dokumentasi Project yang lengkap."] },
                      { label: "Ketepatan Waktu", val: raw["Nilai Feedback User :\nMemenuhi terget waktu Project."] },
                      { label: "Kolaborasi Antar Dept", val: raw["Nilai Feedback User :\nDapat berkolaborasi dengan Department lain dengan baik dalam Project"] },
                      { label: "Review FSD & IT Internal", val: raw["Nilai Feedback User :\nPembuatan FSD dan Review Internal IT"] },
                      { label: "Development & Fixing", val: raw["Nilai Feedback User :\nDevelopment (include Fixing temuan selama Testing PIC dan SIT)"] },
                      { label: "UAT & Change Request", val: raw["Nilai Feedback User :\nUAT (include perbaikan temuan UAT) dan Change Request 1"] },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex flex-col gap-2">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.label}</span>
                           <div className="flex items-center gap-2">
                              {item.val === null || item.val === "" || item.val === undefined ? (
                                <span className="text-[11px] text-slate-600 italic font-medium italic">Belum dinilai</span>
                              ) : (
                                <>
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  <span className="text-lg font-black text-white leading-none">{item.val}</span>
                                  <span className="text-[10px] text-slate-500 italic font-bold">Points</span>
                                </>
                              )}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-[var(--border)] bg-[var(--bg-card)]/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--text-sub)]">
               <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] italic opacity-60">
                 Read-only Data Node • Protocol: HTTPS/REST
               </span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="px-8 py-2.5 bg-[var(--bg-page)] hover:bg-[var(--bg-card)] text-[var(--text-main)] text-[11px] font-black uppercase tracking-widest rounded-xl transition-all border border-[var(--border)]"
              >
                Dismiss View
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

