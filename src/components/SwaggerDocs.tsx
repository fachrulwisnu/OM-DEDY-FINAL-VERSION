import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Om Dedy - Kaldev Integration API",
    version: "1.4.0",
    description: "API for real-time data push from Kaldev Wisecon to Om Dedy Dashboard."
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    "/api/webhook-kaldev": {
      post: {
        summary: "Push/Update Project Data from Kaldev",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ticket_id", "project_name"],
                properties: {
                  ticket_id: { type: "string", example: "REF-2026-001" },
                  project_name: { type: "string", example: "Enhancement Core System" },
                  programmer_name: { type: "string", example: "Mufid Nur Tamam" },
                  priority: { type: "string", example: "High" },
                  project_type: { type: "string", example: "New Feature" },
                  status_kaldev: { type: "string", example: "On Progress" },
                  progress_percent: { type: "number", example: 75.5 },
                  mandays: { type: "number", example: 10 },
                  realized_days: { type: "number", example: 8 },
                  is_late: { type: "boolean", example: false },
                  is_asap: { type: "boolean", example: true },
                  leader_name: { type: "string", example: "Fachrul Wisnu" },
                  client_name: { type: "string", example: "Internal IT" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Data Synced Successfully" },
          "401": { description: "Unauthorized" }
        }
      }
    }
  }
};

export default function SwaggerDocs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden flex flex-col">
      {/* Custom Header */}
      <div className="bg-slate-800 border-b border-white/5 py-4 px-8 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">
              Om Dedy <span className="text-indigo-500">API Documentation</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase mt-1">Live Swagger UI • v1.4.0</p>
          </div>
        </div>
        
        <div className="bg-indigo-600/20 border border-indigo-500/30 px-4 py-2 rounded-xl">
           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
             Endpoint Live
           </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0a0f1d] swagger-dark pl-4 md:pl-20 pr-4 md:pr-20">
        <style>{`
          .swagger-ui .topbar { display: none }
          .swagger-ui .info { margin: 30px 0 }
          .swagger-ui .info .title { color: #fff }
          .swagger-ui .info .title small { background: #6366f1 }
          .swagger-ui .scheme-container { background: transparent; box-shadow: none; border-bottom: 1px solid rgba(255,255,255,0.05) }
          .swagger-ui .opblock { border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); background: rgba(26, 31, 48, 0.5) }
          .swagger-ui .opblock-summary { padding: 15px 20px }
          .swagger-ui .opblock.opblock-post { border-color: rgba(99, 102, 241, 0.2); background: rgba(99, 102, 241, 0.05) }
          .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #6366f1; border-radius: 8px }
          .swagger-ui section.models { display: none }
          .swagger-ui select { background: #1a1f30; color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 4px 8px }
          .swagger-ui input { background: #1a1f30; color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; height: 35px; padding: 0 10px }
          .swagger-ui .btn.authorize { background: transparent; border: 2px solid #6366f1; color: #6366f1; border-radius: 12px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px }
          .swagger-ui .btn.authorize svg { fill: #6366f1 }
          .swagger-ui .opblock-body { padding: 20px }
          .swagger-ui .tab li button.tablinks { color: #fff; font-weight: 800; text-transform: uppercase; font-size: 10px }
          .swagger-ui table thead tr td, .swagger-ui table thead tr th { color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px }
          .swagger-ui p, .swagger-ui li, .swagger-ui td { color: #94a3b8; font-size: 13px }
          .swagger-ui .opblock-description-wrapper p, .swagger-ui .opblock-external-docs-wrapper p, .swagger-ui .opblock-title_normal p { color: #e2e8f0 }
          .swagger-ui .response-col_status { font-weight: 900; color: #fff }
          .swagger-ui pre { background: #000 !important; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1) !important }
        `}</style>
        <SwaggerUI spec={swaggerSpec} />
      </div>
    </div>
  );
}
