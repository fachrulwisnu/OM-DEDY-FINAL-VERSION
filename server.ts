import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to find Notion property by keyword
const getVal = (props: any, keyword: string) => {
  if (!props) return null;
  const key = Object.keys(props).find(k => k.toLowerCase().includes(keyword.toLowerCase()));
  if (!key) return null;
  const p = props[key];
  // Handle different Notion types
  if (p.type === 'rich_text') return p.rich_text[0]?.plain_text || null;
  if (p.type === 'title') return p.title[0]?.plain_text || null;
  if (p.type === 'select') return p.select?.name || null;
  if (p.type === 'date') return p.date?.start || null;
  if (p.type === 'number') return p.number || null;
  if (p.type === 'status') return p.status?.name || null;
  if (p.type === 'formula') {
    if (p.formula.type === 'string') return p.formula.string;
    if (p.formula.type === 'number') return p.formula.number;
  }
  if (p.type === 'multi_select') return p.multi_select?.map((s: any) => s.name).join(', ') || null;
  return null;
};

// Mapping helper
function getPropertyValue(prop: any): any {
  if (!prop) return null;
  switch (prop.type) {
    case 'title':
      return prop.title[0]?.plain_text || null;
    case 'rich_text':
      return prop.rich_text[0]?.plain_text || null;
    case 'select':
      return prop.select?.name || null;
    case 'multi_select':
      return prop.multi_select?.map((s: any) => s.name).join(', ') || null;
    case 'number':
      return prop.number;
    case 'date':
      return prop.date?.start || null;
    case 'checkbox':
      return prop.checkbox;
    case 'status':
      return prop.status?.name || null;
    case 'people':
      return prop.people?.map((p: any) => p.name).join(', ') || null;
    case 'url':
      return prop.url;
    case 'email':
      return prop.email;
    case 'phone_number':
      return prop.phone_number;
    case 'formula':
      if (prop.formula.type === 'string') return prop.formula.string;
      if (prop.formula.type === 'number') return prop.formula.number;
      return null;
    default:
      return null;
  }
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is alive!" });
});

app.post("/webhook-kaldev", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const secretToken = process.env.KALDEV_SECRET_TOKEN;

  // For testing, if secretToken is not set in env, we might want to warn
  if (!secretToken) {
    console.warn("KALDEV_SECRET_TOKEN is not configured in environment variables.");
  }

  if (secretToken && token !== secretToken) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const payload = req.body;
  const { ticket_id, project_name } = payload;

  if (!ticket_id || !project_name) {
    return res.status(400).json({ success: false, error: "ticket_id and project_name are required" });
  }

  try {
    // Perform upsert based on ticket_id
    const { error } = await supabase
      .from('kaldev_projects')
      .upsert({
        ...payload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'ticket_id' });

    if (error) throw error;

    return res.status(200).json({ success: true, message: "Data Synced Successfully" });
  } catch (error: any) {
    console.error("Kaldev Webhook Error:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

app.post("/sync-notion", async (req, res) => {
  // CORS (redundant but requested)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const notionKey = process.env.NOTION_API_KEY;

    if (!databaseId || !notionKey) {
      return res.status(400).json({ 
        success: false, 
        error: "Notion credentials (API Key or Database ID) are not configured." 
      });
    }

    const logs: string[] = ["Initializing Notion Sync API via Direct Fetch..."];
    
    let allRecords: any[] = [];
    let hasMore = true;
    let cursor: string | undefined = undefined;

    while (hasMore) {
      const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start_cursor: cursor,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Notion API Error: ${errorData.message || response.statusText}`);
      }

      const data: any = await response.json();
      allRecords = [...allRecords, ...data.results];
      hasMore = data.has_more;
      cursor = data.next_cursor || undefined;
    }

    logs.push(`Found ${allRecords.length} records in Notion.`);

    const projectsToUpsert = allRecords.map((page: any) => {
      const props = page.properties;
      
      // Flatten properties first to meet "flatData" assumption
      const flatData: any = {};
      Object.keys(props).forEach(key => {
        flatData[key] = getPropertyValue(props[key]);
      });

      const project_name = flatData["Project Name"] || flatData["Name"];
      if (!project_name) return null;

      const last_status = flatData["Last Status"] || 'On Queue';

      return {
        // Core Metadata
        ticket_id: flatData["Ticket"] || null,
        project_name,
        last_status,
        pic_name: flatData["PIC Name"] || 'Unassigned',
        owner_name: flatData["Owner Name"] || null,
        owner_div: flatData["Owner Div"] || null,
        project_type: flatData["Type Project"] || 'Uncategorized',
        last_update_log: flatData["Last Update"] || flatData["(Dev) Progress Updated"] || flatData["(SIT) Progress Updated"],
        notion_last_edited: page.last_edited_time,
        prioritas_mgmt: flatData["Prioritas Mgmt"] || null,
        pic_short_name: flatData["PIC Short Name"] || null,

        // Timeline & Sequential Data
        tgl_fps_disetujui: flatData["Tgl FPS disetujui"] || null,
        fsd_plan_week: flatData["(FSD) Plan in Week"] || null,
        fsd_status: flatData["(FSD) Status"] || null,
        fsd_realized_owner_approved: flatData["(FSD) Realized in Date Diisi saat Approval Digital FSD by Owner selesai"] || null,
        
        dev_plan_week: flatData["(Dev) Plan in Week"] || null,
        dev_realized_date: flatData["(Dev) Realized In Date"] || null,
        dev_late_days: flatData["(Dev) Late Days"] || null,

        sit_plan_week: flatData["(SIT) Plan in Week"] || null,
        sit_batch: flatData["(SIT) Batch.\nMisal isinya :\n1 (21-11-2021 to 24-11-2021)\n2 (28-11-2021 to 01-12-2021)"] || null,

        uat_plan_week: flatData["(UAT) Plan in Week"] || null,
        uat_batch: flatData["(UAT) Batch\nMisal isinya :\n1 (23-11-2021)\n2 (29-11-2021, dilanjutkan 02-12-2021)"] || flatData["(UAT) Batch"] || null,
        uat_status: flatData["(UAT) Status"] || null,
        uat_late_days: flatData["(UAT) Late Days"] || null,
        
        live_realized: flatData["(Live) Realized in Date"] || null,
        monitoring_days: flatData["Monitoring After Live\n15, 30, 60 Hari (Kecil/Menengah/Besar)"] || flatData["Monitoring After Live"] || null,
        
        sla_mandays: flatData["SLA Mandays"] || null,
        reschedule_uat: flatData["Reschedule UAT"] || null,
        jumlah_reminder_uat: flatData["Jumlah Reminder UAT"] || null,
        feedback_overall_score: flatData["Rata-rata Nilai Feedback User New :"] || 0,
        
        raw_data: flatData,
        updated_at: new Date().toISOString()
      };
    }).filter(Boolean);

    let updatedCount = 0;
    let insertedCount = 0;

    if (projectsToUpsert.length > 0) {
      // Individual upserts to track counts correctly
      for (const project of projectsToUpsert as any[]) {
        if (!project.ticket_id) {
          const { error } = await supabase.from('notion_api_projects').insert({
            ...project,
            created_at: new Date().toISOString()
          });
          if (!error) insertedCount++;
          continue;
        }

        const { data: existing } = await supabase
          .from('notion_api_projects')
          .select('id')
          .eq('ticket_id', project.ticket_id)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('notion_api_projects')
            .update(project)
            .eq('id', existing.id);
          if (!error) updatedCount++;
        } else {
          const { error } = await supabase
            .from('notion_api_projects')
            .insert({
              ...project,
              created_at: new Date().toISOString()
            });
          if (!error) insertedCount++;
        }
      }
    }

    logs.push(`Sync Complete: ${updatedCount} records updated, ${insertedCount} new inserted.`);

    return res.json({
      success: true,
      message: `Sync Complete: ${updatedCount} records updated, ${insertedCount} new inserted.`,
      logs,
      updated: updatedCount,
      inserted: insertedCount
    });
  } catch (error: any) {
    console.error("Sync Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Internal Server Error",
      logs: [ `[ERROR] ${error.message}` ] 
    });
  }
});

async function startServer() {
  const appInstance = express();
  appInstance.use(express.json());
  
  // Routes go FIRST
  appInstance.use("/api", app);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    appInstance.use(vite.middlewares);
  } else {
    appInstance.use(express.static(path.join(process.cwd(), "dist")));
    appInstance.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  appInstance.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
