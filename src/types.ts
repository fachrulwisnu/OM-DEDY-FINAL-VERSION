export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN PROGRESS',
  ON_HOLD = 'ON HOLD',
  ON_QUEUE = 'ON QUEUE',
  DONE = 'DONE',
  CANCEL = 'CANCEL'
}

export type Status = TaskStatus; 

export enum ProjectStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN PROGRESS',
  FSD_PROGRESS = 'FSD ON PROGRESS',
  DEV_PROGRESS = 'DEVELOPMENT ON PROGRESS',
  SIT_PROGRESS = 'SIT ON PROGRESS',
  UAT_PROGRESS = 'UAT ON PROGRESS',
  LIVE = 'LIVE',
  HOLD = 'HOLD',
  CANCEL = 'CANCEL',
  CANCELED = 'CANCEL',
  LATE = 'PROJECT LATE'
}

export interface Project {
  id: string;
  ticket_id?: string;
  project_name: string;
  status: ProjectStatus;
  leader_email?: string;
  pic_name?: string; 
  owner_name?: string;
  div_owner?: string;
  owner_div?: string; // Matching DB column mapping
  start_date?: string;
  end_date?: string;
  project_diajukan?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  access_level: string; // Dropdown: Superadmin/Admin/PIC/etc.
  role: string;         // Input Text: Developer/QA/etc.
  created_at: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  parent_id: string | null;
  project_id: string | null;
  title: string;
  assignee: string; // Used as display name (free text)
  developer_name?: string;
  qa_name?: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  start_hour: number;  // 0-23
  start_minute: number; // 0-59
  duration_hours: number;
  duration_minutes: number;
  man_hours?: number; // Manual man-hours input
  target_sla_date: string | null;
  created_by_name?: string;
  status: TaskStatus;
  custom_id: string; // Visible ID like #PH-XXXX or #TS-XXXX
  task_type?: 'New Feature' | 'Improvement';
  components?: string[];
  detail_task?: string;
  approval_fachrul: string | null;
  suggestion_fachrul: string | null;
  approval_barra: string | null;
  suggestion_barra: string | null;
  created_at: string;
  updated_at: string;
  level?: number;
  realized_finish_date?: string | null;
  is_manual_override?: boolean;
  current_status?: string;
  phase_type?: string;
}

export interface AuditLog {
  id: string;
  task_id?: string;
  project_id?: string;
  user_id?: string;
  actor: string;
  action: string;
  authorized_by?: string;
  log_type?: string;
  reason_justification?: string;
  old_payload: any;
  new_payload: any;
  created_at: string;
  updated_at?: string;
}

export type ViewScale = 'MONTH' | 'WEEK' | 'DAY';
export type AppView = 'PROJECTS' | 'KANBAN' | 'PERSONEL' | 'AUDIT' | 'GANTT_DETAIL' | 'SCHEDULE' | 'RESCHEDULE' | 'LOGIN' | 'MASTER_PROJECT' | 'TOR_MONITOR' | 'TIMELINE' | 'NOTION_MIGRATE' | 'NOTION_MONITORING' | 'NOTION_API' | 'NOTION_API_RESULTS' | 'OM_DEDY_KALDEV' | 'API_DOCS';

export interface KaldevProject {
  id: string;
  ticket_id: string;
  project_name: string;
  programmer_name: string | null;
  priority: string | null;
  project_type: string | null;
  status_kaldev: string | null;
  progress_percent: number | null;
  mandays: number | null;
  realized_days: number | null;
  is_late: boolean | null;
  is_asap: boolean | null;
  leader_name: string | null;
  client_name: string | null;
  project_diajukan?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MigrateNotion {
  id: string;
  ticket_id: string | null;
  project_name: string;
  last_status: string;
  pic_name: string;
  owner_div: string | null;
  owner_name: string | null;
  project_type: string;
  last_update_log: string | null;
  raw_data: any;
  created_at: string;
  updated_at?: string;
}

export interface NotionApiProject {
  id: string;
  ticket_id: string | null;
  project_name: string;
  last_status: string;
  pic_name: string;
  owner_div: string | null;
  owner_name: string | null;
  project_type: string;
  last_update_log: string | null;
  notion_last_edited?: string | null;
  tgl_fps_disetujui?: string | null;
  fsd_plan_week?: string | null;
  fsd_realized_owner_approved?: string | null;
  fsd_status?: string | null;
  dev_plan_week?: string | null;
  dev_realized_date?: string | null;
  sit_plan_week?: string | null;
  sit_batch?: string | null;
  uat_plan_week?: string | null;
  uat_batch?: string | null;
  uat_late_days?: number | null;
  reschedule_uat?: string | null;
  jumlah_reminder_uat?: number | null;
  prioritas_mgmt?: string | null;
  pic_short_name?: string | null;
  dev_plan?: string | null;
  dev_realized?: string | null;
  uat_status?: string | null;
  live_realized?: string | null;
  dev_late_days?: string | null;
  sla_mandays?: string | null;
  monitoring_days?: string | null;
  feedback_overall_score?: number | null;
  raw_data: any;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  pic_name: string;
  schedule_date: string; // ISO date string
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RescheduleRequest {
  id: string;
  pic_name: string;
  schedule_date: string;
  original_status: string;
  new_status: string;
  reason: string;
  requested_by: string; // email or name
  status: 'Pending' | 'Approved' | 'Rejected';
  swap_date?: string;
  swap_status?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectRescheduleLog {
  id: string;
  project_id: string;
  changed_by: string;
  old_start_date: string;
  old_end_date: string;
  new_start_date: string;
  new_end_date: string;
  reason: string;
  created_at: string;
}

export interface MasterProject {
  id: string;
  ticket_id: string;
  project_name: string;
  status: string; // Used for "Global Status" (e.g. OPEN, LIVE, etc)
  global_status?: string; // Explicit field as per request
  pic_name: string;
  owner_name: string;
  div_owner: string;
  plan_start_date?: string;
  plan_end_date?: string;
  total_man_hours?: number;
  created_at: string;
  updated_at: string;
}

export interface MasterProjectAuditLog {
  id: string;
  master_project_id: string;
  actor: string;
  action: 'IMPORT' | 'CREATE' | 'UPDATE' | 'DELETE';
  note: string;
  changed_fields?: string;
  created_at: string;
}

export interface HistoryEditProject {
  id: string;
  project_id: string;
  task_id?: string | null;
  pic_name: string;
  field_name: string;
  before_value: string | null;
  after_value: string | null;
  created_at: string;
}
