import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../src/config/env';

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || '';
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

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

export default async function handler(req: any, res: any) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const databaseId = getEnv('NOTION_DATABASE_ID');
    const notionKey = getEnv('NOTION_API_KEY');

    if (!databaseId || !notionKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Notion credentials (API Key or Database ID) are not configured' 
      });
    }

    const maskedDbId = databaseId.length > 10 ? `${databaseId.slice(0, 8)}...${databaseId.slice(-8)}` : databaseId;
    const logs: string[] = [
      "Initializing Notion Sync ENGINE...",
      `Connecting to Notion Database ID: ${maskedDbId} (Active)`
    ];
    
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

    logs.push(`Fetched ${allRecords.length} records.`);

    const projectsToUpsert = allRecords.map((page: any) => {
      const props = page.properties;
      
      const ticket_id = getPropertyValue(props['Ticket']) || getPropertyValue(props['Ticket ID']);
      const project_name = getPropertyValue(props['Name']) || getPropertyValue(props['Project Name']);
      
      if (!ticket_id || !project_name) return null;

      const last_status_raw = getPropertyValue(props['Last Status']) || getPropertyValue(props['Status']) || 'On Queue';
      
      // Auto-normalize to match MIGRATION_STATUSES if it's almost the same
      const MIGRATION_STATUSES = [
        'On Queue', 'FSD On Progress', 'Dev On Queue', 'Dev On Progress', 'SIT On Progress',
        'UAT On Queue', 'UAT On Progress', 'Change Request On Progress', 'Hold By Owner',
        'Hold By IT', 'Hold By Client/Vendor', 'Canceled', 'Live On Queue', 'Live On Monitoring'
      ];
      const last_status = MIGRATION_STATUSES.find(s => s.toLowerCase() === last_status_raw.toLowerCase()) || last_status_raw;

      const pic_name = getPropertyValue(props['PIC Name']) || 'Unassigned';
      const owner_div = getPropertyValue(props['Owner Div']);
      const owner_name = getPropertyValue(props['Owner Name']);
      const project_type = getPropertyValue(props['Type Project']) || 'Uncategorized';
      const last_update_log = getPropertyValue(props['Last Update']) || getPropertyValue(props['(Dev) Progress Updated']) || getPropertyValue(props['(SIT) Progress Updated']);

      // Extra fields requested
      const tgl_fps_disetujui = getPropertyValue(props['Tgl FPS disetujui']);
      const fsd_plan_week = getPropertyValue(props['(FSD) Plan in Week']);
      const fsd_realized_owner_approved = getPropertyValue(props['Realized (Owner Approved)']) || getPropertyValue(props['Realized']);
      const fsd_status = getPropertyValue(props['(FSD) Status']);
      const dev_plan_week = getPropertyValue(props['(Dev) Plan in Week']);
      const dev_realized_date = getPropertyValue(props['(Dev) Realized In Date']);
      const sit_plan_week = getPropertyValue(props['(SIT) Plan in Week']);
      const sit_batch = getPropertyValue(props['(SIT) Batch']);
      const uat_plan_week = getPropertyValue(props['(UAT) Plan in Week']);
      const uat_batch = getPropertyValue(props['(UAT) Batch\nMisal isinya :\n1 (23-11-2021)\n2 (29-11-2021, dilanjutkan 02-12-2021)']) || getPropertyValue(props['(UAT) Batch']);
      const uat_late_days = getPropertyValue(props['(UAT) Late Days']);
      const reschedule_uat = getPropertyValue(props['Reschedule UAT']);
      const jumlah_reminder_uat = getPropertyValue(props['Jumlah Reminder UAT']);
      const feedback_overall_score = getPropertyValue(props['Feedback Overall Score']) || getPropertyValue(props['Score']);

      return {
        ticket_id,
        project_name,
        last_status,
        pic_name,
        owner_div,
        owner_name,
        project_type,
        last_update_log,
        tgl_fps_disetujui,
        fsd_plan_week,
        fsd_realized_owner_approved,
        fsd_status,
        dev_plan_week,
        dev_realized_date,
        sit_plan_week,
        sit_batch,
        uat_plan_week,
        uat_batch,
        uat_late_days,
        reschedule_uat,
        jumlah_reminder_uat,
        feedback_overall_score,
        raw_data: page, // Keep full Notion page object for debugging
        updated_at: new Date().toISOString()
      };
    }).filter(Boolean);

    const rawMappedData = projectsToUpsert;
    
    // TASK 1: Deduplication Logic
    const uniqueDataMap = new Map();
    rawMappedData.forEach((item: any) => {
      // Overwrites duplicates, keeping the last occurrence
      uniqueDataMap.set(item.ticket_id, item);
    });
    
    const deduplicatedData = Array.from(uniqueDataMap.values());
    const duplicateCount = rawMappedData.length - deduplicatedData.length;
    
    if (duplicateCount > 0) {
      logs.push(`Filtered out ${duplicateCount} duplicate ticket_ids.`);
    }

    // TASK 2: Diffing Logic
    const { data: existingProjects } = await supabase
      .from('notion_api_projects')
      .select('ticket_id, last_status');
    
    const existingMap = new Map(existingProjects?.map(p => [p.ticket_id, p.last_status]) || []);
    
    const syncReport: {
      newItemsCount: number;
      updatedItemsCount: number;
      changes: { ticket_id: string; action: 'NEW_INSERT' | 'STATUS_UPDATE'; old: string | null; new: string; name: string }[];
    } = {
      newItemsCount: 0,
      updatedItemsCount: 0,
      changes: []
    };

    deduplicatedData.forEach((item: any) => {
      if (!existingMap.has(item.ticket_id)) {
        syncReport.newItemsCount++;
        syncReport.changes.push({
          ticket_id: item.ticket_id,
          action: 'NEW_INSERT',
          old: null,
          new: item.last_status,
          name: item.project_name
        });
        logs.push(`[NEW] ${item.ticket_id}: ${item.project_name}`);
      } else {
        const oldStatus = existingMap.get(item.ticket_id);
        if (oldStatus !== item.last_status) {
          syncReport.updatedItemsCount++;
          syncReport.changes.push({
            ticket_id: item.ticket_id,
            action: 'STATUS_UPDATE',
            old: oldStatus,
            new: item.last_status,
            name: item.project_name
          });
          logs.push(`[UPDATE] ${item.ticket_id} status: ${oldStatus} -> ${item.last_status}`);
        }
      }
    });

    if (deduplicatedData.length > 0) {
      const { error } = await supabase
        .from('notion_api_projects')
        .upsert(deduplicatedData, { 
          onConflict: 'ticket_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error("Supabase Upsert Error:", error);
        throw new Error(`Supabase Sync failed: ${error.message}`);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Sync Complete: ${deduplicatedData.length} records processed.`,
      count: deduplicatedData.length,
      report: syncReport,
      databaseId: maskedDbId,
      logs
    });
  } catch (error: any) {
    console.error("Vercel API Sync Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Internal Server Error",
      logs: [ `[ERROR] ${error.message}` ]
    });
  }
}
