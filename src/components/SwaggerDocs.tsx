import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Globe, Shield, Terminal, Database, Zap, ChevronLeft, Play, Send, Loader2 } from 'lucide-react';
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
  description, 
  exampleResponse,
  parameters = []
}: { 
  method: string, 
  path: string, 
  description: string, 
  exampleResponse?: any,
  parameters?: { name: string, placeholder: string, type: string }[]
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    parameters.forEach(p => initial[p.name] = p.placeholder);
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ status: number, data: any } | null>(null);

  const getFullUrl = () => {
    let finalPath = path;
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
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setResponse({ status: res.status, data });
    } catch (error) {
      setResponse({ status: 500, data: { error: (error as Error).message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-indigo-500/10 rounded-2xl bg-white/5 overflow-hidden transition-all hover:border-indigo-500/30 shadow-lg">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-5">
          <span className={cn(
            "px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-widest border shadow-sm",
            method === 'GET' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          )}>
            {method}
          </span>
          <div>
            <code className="text-sm font-mono text-white tracking-tight">{path}</code>
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
            className="border-t border-indigo-500/10 p-6 bg-black/40 space-y-8"
          >
            {/* TRY IT OUT UI */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Live Testing Playground
                </h5>
                <div className="h-px flex-1 bg-indigo-500/10 mx-4" />
              </div>

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

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleTestRequest}
                    disabled={loading}
                    className="flex-none flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {loading ? 'Executing...' : 'Send Request'}
                  </button>
                  <code className="flex-1 overflow-hidden transition-all text-xs font-mono text-slate-500 truncate bg-black/50 px-3 py-2.5 rounded-xl border border-white/5 opacity-50 hover:opacity-100 hover:text-indigo-300">
                    {getFullUrl()}
                  </code>
                </div>

                {/* RESPONSE VIEWER CONSOLE */}
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
                            response.status >= 200 && response.status < 300 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          )}>
                            {response.status} {response.status === 200 ? 'OK' : response.status === 401 ? 'Unauthorized' : 'Error'}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-600">application/json</span>
                      </div>
                      <CodeBlock code={JSON.stringify(response.data, null, 2)} language="JSON" theme="midnight" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Database className="w-3 h-3" />
                Default Mock Schema
              </h5>
              <CodeBlock code={JSON.stringify(exampleResponse, null, 2)} language="JSON" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function SwaggerDocs() {
  const navigate = useNavigate();
  const authCode = `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubXRsam5uZmR1YWdxZHlyc29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODI0OTMsImV4cCI6MjA5MzQ1ODQ5M30.NcZe4HDiIp2dUSRKQJXeTTEwPTFLEQM1Qh7aXS3DwyQ

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubXRsam5uZmR1YWdxZHlyc29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODI0OTMsImV4cCI6MjA5MzQ1ODQ5M30.NcZe4HDiIp2dUSRKQJXeTTEwPTFLEQM1Qh7aXS3DwyQ

Content-Type: application/json`;

  const exampleResponse = [
    {
      "id": "e0e8e454-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "ticket_id": "KAL-20260513",
      "project_name": "Integrasi Payment Gateway",
      "programmer_name": "Bimo",
      "priority": "High",
      "project_type": "New Feature",
      "project_category": "Backend",
      "status_kaldev": "DEVELOPMENT ON PROGRESS",
      "status_approval": "Approved",
      "progress_percent": 75,
      "start_date": "2026-05-01",
      "planning_finish": "2026-05-15",
      "mandays": 14.5,
      "realized_days": 10.0,
      "is_late": false,
      "is_asap": true,
      "finish_date": null,
      "implementor_name": "Bimo",
      "leader_name": "Fachrul Wisnu Novianto",
      "client_name": "PT Jaya Agung",
      "project_base": "Jakarta",
      "live_spare_days": 2,
      "live_date": null,
      "created_at_kaldev": "2026-05-01T09:00:00Z",
      "created_by_kaldev": "System",
      "updated_at_kaldev": "2026-05-13T13:09:00Z",
      "updated_by_kaldev": "Fachrul",
      "last_sync_to_omdedy": "2026-05-13T13:10:00Z",
      "raw_payload": null
    }
  ];

  return (
    <div className="min-h-full bg-slate-950 text-white selection:bg-indigo-500/30 pb-20">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        
        {/* TASK 1: API OVERVIEW & BASE URL SECTION */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                  <Zap className="w-7 h-7 text-white fill-current" />
                </div>
                <div>
                  <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">OM DEDY x KALDEV</h1>
                  <p className="text-xs font-bold text-indigo-400 mt-1 uppercase tracking-[0.3em]">Integration Protocol Documentation</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">PostgREST v12.1 Live</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-[#020437]/40 border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -mr-32 -mt-32 group-hover:bg-indigo-500/10 transition-colors" />
              <div className="relative z-10 space-y-4">
                <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Global Base URL</h2>
                <div className="flex items-center gap-4 group/url">
                  <Globe className="w-6 h-6 text-indigo-400 group-hover/url:rotate-12 transition-transform" />
                  <code className="text-lg sm:text-xl font-mono text-white tracking-tight break-all">https://nnmtljnnfduagqdyrsol.supabase.co/rest/v1</code>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-white/5 rounded-3xl p-8 flex flex-col justify-center gap-3">
              <div className="flex items-center gap-3 text-slate-400 italic">
                <Database className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Protocol</span>
              </div>
              <p className="text-xl font-black uppercase tracking-tight italic">PostgreSQL RESTful v1</p>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-12 space-y-16">
            {/* TASK 2: AUTHENTICATION (POINT 4 CLARIFICATION) */}
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
               <div className="flex items-center gap-3">
                 <Shield className="w-6 h-6 text-amber-400" />
                 <h2 className="text-lg font-black uppercase tracking-tighter italic">Network Authentication</h2>
               </div>
               <div className="space-y-6">
                 <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-200/70 leading-loose font-medium max-w-3xl">
                    SECURITY NOTICE: Supabase requires <span className="text-amber-400 font-bold uppercase underline decoration-2 underline-offset-4">Dual-Header Authentication</span>. 
                    Requests failing to provide the <code className="text-white bg-white/10 px-1.5 py-0.5 rounded">apikey</code> header even with a valid Bearer token will be rejected (401).
                 </div>
                 <CodeBlock code={authCode} />
               </div>
            </section>

            {/* TASK 3: ENDPOINTS LIST (ACCORDION UI) */}
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-blue-400" />
                <h2 className="text-lg font-black uppercase tracking-tighter italic">Primary Endpoints</h2>
              </div>
              <div className="space-y-6">
                <Endpoint 
                  method="GET" 
                  path="/kaldev_projects?select=*" 
                  description="Retrieves all Kaldev projects mapped to Om Dedy dashboard."
                  exampleResponse={exampleResponse}
                />
                <Endpoint 
                  method="GET" 
                  path="/kaldev_projects?ticket_id=eq.{ticket_id}&select=*" 
                  description="Fetches a specific project by Ticket ID."
                  parameters={[
                    { name: 'ticket_id', placeholder: 'KAL-20260513', type: 'text' }
                  ]}
                />
                <Endpoint 
                  method="GET" 
                  path="/kaldev_projects?updated_at_kaldev=gte.{timestamp}&select=*" 
                  description="Sync Filter: Retrieves projects updated after specific ISO 8601 timestamp."
                  parameters={[
                    { name: 'timestamp', placeholder: '2026-05-13T00:00:00Z', type: 'text' }
                  ]}
                />
              </div>
            </section>

            {/* TASK 4: JSON RESPONSE SCHEMA */}
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-emerald-400" />
                <h2 className="text-lg font-black uppercase tracking-tighter italic">Standard Response Schema</h2>
              </div>
              <div className="bg-[#020437] rounded-3xl border border-indigo-500/20 p-2 shadow-inner">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Full Response Mockup</span>
                  </div>
                </div>
                <div className="p-4">
                  <CodeBlock code={JSON.stringify(exampleResponse, null, 2)} language="JSON" />
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="pt-20 border-t border-white/5 text-center space-y-4">
           <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
             <span>Kaldev Wisecon</span>
             <span>x</span>
             <span>Om Dedy Portfolio</span>
           </div>
           <p className="text-[8px] uppercase tracking-tighter text-slate-700">Internal Use Only • RESTful API v1.0 • Supabase Cloud Infrastructure • Playground Authorized Access</p>
        </footer>
      </div>
    </div>
  );
}
