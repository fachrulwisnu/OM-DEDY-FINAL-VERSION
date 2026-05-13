import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Rocket, 
  Zap,
  Loader2,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

type SyncStatus = 'IDLE' | 'SYNCING' | 'COMPLETED';

export function NotionSyncDashboard() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('IDLE');
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<{ updated: number; inserted: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isSyncing = syncStatus === 'SYNCING';

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const handleSync = async () => {
    setSyncStatus('SYNCING');
    setLogs(["Initializing Notion Sync Engine..."]);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/sync-notion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const text = await response.text();
      if (!text) throw new Error("Empty response from server.");
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON response from server.");
      }

      if (data.success) {
        setLogs(prev => [...prev, ...(data.logs || [])]);
        if (data.updated !== undefined && data.inserted !== undefined) {
          setResult({
            updated: data.updated,
            inserted: data.inserted
          });
        } else {
          const match = data.message?.match(/(\d+) records updated, (\d+) new inserted/);
          if (match) {
            setResult({
              updated: parseInt(match[1]),
              inserted: parseInt(match[2])
            });
          }
        }
        setSyncStatus('COMPLETED');
      } else {
        throw new Error(data.error || 'Unknown error occurred during sync');
      }
    } catch (err: any) {
      setError(err.message);
      setLogs(prev => [...prev, `[ERROR] ${err.message}`]);
      setSyncStatus('IDLE');
    }
  };

  return (
    <div className="p-6 bg-[#0a0f1d] min-h-screen text-slate-300">
      {/* Header */}
      <div className="mb-10 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            Om Dedy <span className="text-indigo-500">Notion API</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Direct Notion Database Connector • Real-time Sync Engine
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sync Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1a1f30] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-indigo-600/10 transition-colors" />
            
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Sync Hardware
            </h2>

            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source</span>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Notion DB</span>
                </div>
                <p className="text-[11px] font-bold text-white truncate opacity-60">ID: 3a214cd8...cce3b260</p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Destination</span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Supabase</span>
                </div>
                <p className="text-[11px] font-bold text-white truncate opacity-60">Table: notion_api_projects</p>
              </div>

              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className={cn(
                  "w-full py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative overflow-hidden",
                  isSyncing 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed animate-pulse" 
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/20 active:scale-[0.98]"
                )}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className={cn("w-5 h-5", isSyncing && "animate-spin")} />
                    Synchronize Now
                  </>
                )}
                {isSyncing && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
                    <motion.div 
                      className="h-full bg-white/30"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      style={{ width: "30%" }}
                    />
                  </div>
                )}
              </button>
            </div>
          </div>

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Sync Successful</h3>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Protocol Executed</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Updated</span>
                  <span className="text-2xl font-black text-white">{result.updated}</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Inserted</span>
                  <span className="text-2xl font-black text-white">{result.inserted}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/notion-api-results')}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 group"
              >
                View Synced Results
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Sync Failure</h3>
                  <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Error Detected</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                {error}
              </p>
            </motion.div>
          )}
        </div>

        {/* Sync Logs */}
        <div className="lg:col-span-2">
          <div className="bg-[#0f172a] border border-white/5 rounded-3xl shadow-2xl h-[600px] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Process Logs</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] space-y-1.5 custom-scrollbar bg-black/10">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-30 select-none">
                  <Rocket className="w-12 h-12 mb-4" />
                  <p className="font-black uppercase tracking-[0.3em]">Awaiting Ignition...</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex gap-3",
                      log.startsWith('[ERROR]') ? "text-rose-400" : 
                      log.startsWith('Sync Complete') ? "text-emerald-400 font-bold" : "text-slate-400"
                    )}
                  >
                    <span className="text-slate-700 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span className="flex-1 leading-relaxed">
                      {log.startsWith('Updated Ticket') || log.startsWith('Inserted New Ticket') ? (
                        <>
                          <span className="text-indigo-400">⚡</span> {log}
                        </>
                      ) : log}
                    </span>
                  </motion.div>
                ))
              )}
              <div ref={logEndRef} />
            </div>

            <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", isSyncing ? "bg-amber-500 animate-pulse" : "bg-indigo-500")} />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Engine Status: {isSyncing ? "Transferring Data" : "Standby"}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setLogs([])}
                className="p-2 hover:bg-white/5 rounded-lg text-slate-600 hover:text-slate-400 transition-all"
                title="Clear Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
