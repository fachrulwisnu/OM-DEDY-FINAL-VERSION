import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Globe, Shield, Terminal, Database, Zap, ChevronLeft, Play, Send, Loader2, Trash2, Edit3, PlusCircle, List } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const CodeBlock = ({ code, language = 'HTTP', theme = 'dark' }: { code: string; language?: string; theme?: 'dark' | 'midnight' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className={cn(
        "rounded-xl border overflow-hidden shadow-2xl",
        theme === 'dark' ? "bg-[#020437] border-indigo-500/20" : "bg-[#050b14] border-slate-800"
      )}>
        <div className={cn(
          "flex items-center justify-between px-4 py-2 border-b",
          theme === 'dark' ? "border-indigo-500/10 bg-indigo-500/5" : "border-slate-800 bg-slate-900/50"
        )}>
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">{language}</span>
          </div>
        </div>
        <pre className="p-4 text-[11px] font-mono text-indigo-100 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed max-h-[400px]">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const Endpoint = ({ 
  method, 
  path, 
  realPath,
  description, 
  exampleResponse,
  parameters = [],
  defaultBody
}: { 
  method: string, 
  path: string, 
  realPath: string,
  description: string, 
  exampleResponse?: any,
  parameters?: { name: string, placeholder: string, type: string }[],
  defaultBody?: any
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    parameters.forEach(p => initial[p.name] = p.placeholder);
    return initial;
  });
  const [bodyData, setBodyData] = useState(() => 
    defaultBody ? JSON.stringify(defaultBody, null, 2) : ''
  );
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ status: number, data: any } | null>(null);

  const getFullUrl = () => {
    let finalPath = realPath;
    Object.entries(inputs).forEach(([key, val]) => {
      finalPath = finalPath.replace(`{${key}}`, val);
    });
    return `https://nnmtljnnfduagqdyrsol.supabase.co/rest/v1${finalPath}`;
  };

  const handleTestRequest = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubXRsam5uZmR1YWdxZHlyc29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODI0OTMsImV4cCI6MjA5MzQ1ODQ5M30.NcZe4HDiIp2dUSRKQJXeTTEwPTFLEQM1Qh7aXS3DwyQ";
      const url = getFullUrl();
      
      const fetchOptions: RequestInit = {
        method: method === 'DELETE' ? 'PATCH' : method, // Map DELETE to PATCH for soft delete as per requirement
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(method === 'POST' ? { 'Prefer': 'return=representation' } : {})
        }
      };

      if (method !== 'GET' && bodyData) {
        fetchOptions.body = bodyData;
      }

      const res = await fetch(url, fetchOptions);
      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = { message: 'Success (No Content)' };
      }
      setResponse({ status: res.status, data });
    } catch (error) {
      setResponse({ status: 500, data: { error: (error as Error).message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-slate-800 rounded-2xl bg-slate-900/40 overflow-hidden transition-all hover:border-indigo-500/30 shadow-lg">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-5">
          <span className={cn(
            "px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-widest border shadow-sm",
            method === 'GET' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : 
            method === 'POST' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
            method === 'DELETE' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
            "bg-amber-500/10 text-amber-400 border-amber-500/20"
          )}>
            {method}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-white tracking-tight">{path}</code>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-[0.2em] font-black">{description}</p>
          </div>
        </div>
        <div className="p-2 rounded-full bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors text-slate-500 group-hover:text-white">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-800 p-6 bg-black/40 space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Live Testing Playground
                </h5>
                <div className="h-px flex-1 bg-indigo-500/10 mx-4" />
              </div>

              <div className="space-y-6">
                {parameters.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {parameters.map(p => (
                      <div key={p.name} className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{p.name}</label>
                        <input 
                          type={p.type}
                          value={inputs[p.name]}
                          onChange={(e) => setInputs(prev => ({ ...prev, [p.name]: e.target.value }))}
                          placeholder={p.placeholder}
                          className="w-full bg-[#020437] border border-indigo-500/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {method !== 'GET' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1">JSON Body</label>
                    <textarea 
                      value={bodyData}
                      onChange={(e) => setBodyData(e.target.value)}
                      rows={8}
                      className="w-full bg-[#020437] border border-indigo-500/20 rounded-xl px-4 py-3 text-[11px] font-mono text-indigo-100 placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all leading-relaxed"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleTestRequest}
                    disabled={loading}
                    className="flex-none flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-95"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {loading ? 'Executing...' : 'Send Request'}
                  </button>
                  <code className="flex-1 overflow-hidden transition-all text-[10px] font-mono text-slate-500 truncate bg-black/50 px-3 py-2.5 rounded-xl border border-white/5 opacity-50 hover:opacity-100 hover:text-indigo-300">
                    {method} /rest/v1{realPath.replace(`{${Object.keys(inputs)[0]}}`, inputs[Object.keys(inputs)[0]])}
                  </code>
                </div>

                <AnimatePresence>
                  {response && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">HTTP Status:</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-black transition-colors",
                            response.status >= 200 && response.status < 400 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          )}>
                            {response.status} {response.status >= 200 && response.status < 300 ? 'SUCCESS' : 'ERROR'}
                          </span>
                        </div>
                      </div>
                      <CodeBlock code={JSON.stringify(response.data, null, 2)} language="JSON" theme="midnight" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function PmaIntegration() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-slate-950 text-white selection:bg-indigo-500/30 pb-20">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        
        {/* HEADER SECTION */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-400">PMA x OM DEDY</h1>
                  <p className="text-xs font-bold text-indigo-400 mt-1 uppercase tracking-[0.3em]">External Data Sync Protocol</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#020437]/40 border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-xl space-y-4">
              <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Base Endpoint</h2>
              <code className="block text-sm font-mono text-white tracking-tight break-all bg-black/40 p-4 rounded-xl border border-white/5">
                https://nnmtljnnfduagqdyrsol.supabase.co/rest/v1
              </code>
            </div>
            <div className="bg-gradient-to-br from-indigo-600/10 to-indigo-800/10 border border-white/5 rounded-3xl p-8 space-y-4">
              <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Auth Strategy</h2>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold uppercase tracking-widest text-slate-300">Dual-Header (APIKey + Bearer)</span>
              </div>
            </div>
          </div>
        </section>

        {/* MAPPING SECTION */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
           <div className="flex items-center gap-3">
             <Database className="w-6 h-6 text-indigo-400" />
             <h2 className="text-lg font-black uppercase tracking-tighter italic">PMA to Master Mapping</h2>
           </div>
           
           <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
             <table className="w-full text-left text-xs">
               <thead>
                 <tr className="bg-indigo-500/10 border-b border-indigo-500/20">
                   <th className="px-6 py-4 font-black uppercase tracking-widest text-indigo-400">PMA Field</th>
                   <th className="px-6 py-4 font-black uppercase tracking-widest text-indigo-400">Master Field</th>
                   <th className="px-6 py-4 font-black uppercase tracking-widest text-indigo-400">Notes</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                 {[
                   { pma: 'ticket_id', master: 'ticket_id', note: 'Primary Key' },
                   { pma: 'project_name', master: 'project_name', note: '-' },
                   { pma: 'status', master: 'status', note: 'CANCEL/DELETED logic' },
                   { pma: 'pic_name', master: 'pic_name', note: 'Person in Charge' },
                   { pma: 'owner', master: 'owner_name', note: 'Stakeholder' },
                   { pma: 'division', master: 'div_owner', note: 'Origin Division' },
                   { pma: 'priority', master: 'priority', note: 'High / Med / Low' },
                   { pma: 'update_desc', master: 'last_update_text', note: 'Last activity text' },
                 ].map((row, i) => (
                   <tr key={i} className="hover:bg-white/5 transition-colors group">
                     <td className="px-6 py-4 font-mono font-bold text-white group-hover:text-indigo-400">{row.pma}</td>
                     <td className="px-6 py-4 font-mono text-slate-400 italic">→ {row.master}</td>
                     <td className="px-6 py-4 text-slate-500 font-medium">{row.note}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </section>

        {/* ENDPOINTS SECTION */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-indigo-400" />
            <h2 className="text-lg font-black uppercase tracking-tighter italic">PMA API Playground</h2>
          </div>
          
          <div className="space-y-4">
            <Endpoint 
              method="GET"
              path="/api/pma/projects"
              realPath="/master_projects?deleted_at=is.null&select=*"
              description="Fetch all active projects from master_projects."
            />
            
            <Endpoint 
              method="GET"
              path="/api/pma/projects/{ticketId}"
              realPath="/master_projects?ticket_id=eq.{ticketId}&select=*"
              description="Fetch single project record by Ticket ID."
              parameters={[{ name: 'ticketId', placeholder: 'PMA-2026-001', type: 'text' }]}
            />
            
            <Endpoint 
              method="POST"
              path="/api/pma/projects"
              realPath="/master_projects"
              description="Insert new record. Only allow if status is 'OPEN' or 'ON QUEUE'."
              defaultBody={{
                "ticket_id": "PMA-2026-NEW",
                "project_name": "PMA Integration Core",
                "status": "ON QUEUE",
                "pic_name": "Bimo",
                "owner_name": "Fachrul",
                "div_owner": "IT KALDEV",
                "priority": "High",
                "last_update_text": "Initial push from PMA system"
              }}
            />
            
            <Endpoint 
              method="PUT"
              path="/api/pma/projects/{ticketId}"
              realPath="/master_projects?ticket_id=eq.{ticketId}"
              description="Update existing record. Handle CANCEL logic."
              parameters={[{ name: 'ticketId', placeholder: 'PMA-2026-NEW', type: 'text' }]}
              defaultBody={{
                "status": "CANCEL",
                "last_update_text": "Project cancelled by owner via PMA"
              }}
            />
            
            <Endpoint 
              method="DELETE"
              path="/api/pma/projects/{ticketId}"
              realPath="/master_projects?ticket_id=eq.{ticketId}"
              description="Soft Delete: Sets deleted_at = now() and status = 'DELETED'."
              parameters={[{ name: 'ticketId', placeholder: 'PMA-2026-NEW', type: 'text' }]}
              defaultBody={{
                "deleted_at": new Date().toISOString(),
                "status": "DELETED",
                "last_update_text": "Soft deleted by PMA system"
              }}
            />
          </div>
        </section>

        <footer className="pt-20 border-t border-slate-800 text-center space-y-4">
           <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
             <span>PMA Service Integration</span>
             <span>x</span>
             <span>Om Dedy Master</span>
           </div>
           <p className="text-[8px] uppercase tracking-tighter text-slate-700">Authorized Personnel Only • REST v1.0 • Supabase Internal Architecture</p>
        </footer>
      </div>
    </div>
  );
}
