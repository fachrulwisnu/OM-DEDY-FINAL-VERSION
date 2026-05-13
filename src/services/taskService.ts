import { supabase } from '../lib/supabase';
import { Task, AuditLog, TaskStatus, ProjectStatus, Project, AppUser, Schedule, RescheduleRequest, ProjectRescheduleLog, MasterProject, MasterProjectAuditLog } from '../types';
import { format, endOfMonth } from 'date-fns';

const sanitizeDate = (value: any) => {
  if (!value || value === '') return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : (typeof value === 'string' ? value : date.toISOString());
};

/**
 * Service to manage tasks and their audit trails.
 * Enforces the requirement that every mutation triggers an audit log.
 */
export const taskService = {
  // --- Tasks ---
  async getTasks(projectId?: string): Promise<Task[]> {
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: true });
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getAllTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*');
    if (error) throw error;
    return data || [];
  },

  // --- Projects ---
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async searchMasterProjects(term: string): Promise<MasterProject[]> {
    const { data, error } = await supabase
      .from('master_projects')
      .select('*')
      .or(`ticket_id.ilike.%${term}%,project_name.ilike.%${term}%`)
      .limit(10);
    if (error) throw error;
    return data || [];
  },

  async createProject(project: Partial<Project>, actor: string): Promise<Project> {
    const { data: { user } } = await supabase.auth.getUser();
    const finalActor = user?.email || actor;

    const payload = {
      project_name: project.project_name || 'Untitled Project',
      status: project.status || ProjectStatus.TODO,
      leader_email: project.leader_email || finalActor,
      pic_name: project.pic_name || null,
      owner_name: project.owner_name || null,
      owner_div: project.owner_div || project.div_owner || null,
      div_owner: project.div_owner || null,
      project_diajukan: project.project_diajukan || null,
      ticket_id: project.ticket_id || null,
      start_date: sanitizeDate(project.start_date),
      end_date: sanitizeDate(project.end_date),
      created_by: finalActor,
      updated_at: new Date().toISOString()
    };

    // 1. Save to main project table
    const { data, error } = await supabase
      .from('projects')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;

    // 2. Sync to master_projects
    if (project.ticket_id) {
      const { data: existingMaster } = await supabase
        .from('master_projects')
        .select('*')
        .eq('ticket_id', project.ticket_id)
        .maybeSingle();

      if (existingMaster) {
        // Update if exists to keep in sync
        await this.updateMasterProject(existingMaster.id, {
          project_name: project.project_name,
          owner_name: project.owner_name,
          div_owner: project.div_owner,
          pic_name: project.pic_name,
          status: 'OPEN' // Ensure it's marked as OPEN when a project is created/updated
        }, finalActor);
      } else {
        // Insert new master entry
        await this.createMasterProject({
          ticket_id: project.ticket_id,
          project_name: project.project_name || 'N/A',
          pic_name: project.pic_name || 'N/A',
          owner_name: project.owner_name || 'N/A',
          div_owner: project.div_owner || 'N/A',
          status: 'OPEN'
        }, finalActor);
      }
    }

    await this.logAudit({ project_id: data.id, actor: finalActor, action: 'Created Project', newValue: data });
    return data;
  },

  async deleteProject(id: string, actor: string): Promise<void> {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    await this.logAudit({ project_id: id, actor, action: 'Deleted Project' });
  },

  // --- Users ---
  async getUsers(): Promise<AppUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createUser(user: Partial<AppUser>, actor: string): Promise<AppUser> {
    const payload = {
      ...user,
      access_level: user.access_level || 'PIC',
      role: user.role || 'Staff',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .insert([payload])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        const err = new Error('Email ini sudah terdaftar dalam sistem.');
        (err as any).code = '23505';
        throw err;
      }
      throw error;
    }
    await this.logAudit({ user_id: data.id, actor, action: 'Created User', newValue: data });
    return data;
  },

  async deleteUser(id: string, actor: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    await this.logAudit({ user_id: id, actor, action: 'Deleted User' });
  },

  async updateUser(id: string, updates: Partial<AppUser>, actor: string): Promise<AppUser> {
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (updateError) throw updateError;

    await this.logAudit({ user_id: id, actor, action: 'Updated User', oldValue: existing, newValue: updated });
    return updated;
  },

  // --- Reschedule Requests ---
  async getRescheduleRequests(): Promise<any[]> {
    const { data, error } = await supabase
      .from('reschedule_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching reschedule requests:', error);
      throw error;
    }
    return data || [];
  },

  async checkExistingRescheduleRequest(pic_name: string, schedule_date: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('reschedule_requests')
      .select('id')
      .eq('pic_name', pic_name)
      .eq('schedule_date', schedule_date)
      .eq('status', 'Pending')
      .limit(1);
    
    if (error) {
      console.error('Error checking existing reschedule request:', error);
      return false; 
    }
    return (data && data.length > 0);
  },

  async createRescheduleRequest(payload: any | any[]): Promise<void> {
    const payloads = Array.isArray(payload) ? payload : [payload];
    const formattedPayloads = payloads.map(p => ({
      pic_name: p.pic_name,
      schedule_date: sanitizeDate(p.schedule_date),
      original_status: p.original_status,
      new_status: p.new_status,
      reason: p.reason,
      requested_by: p.requested_by,
      swap_date: p.swap_date || null,
      swap_status: p.swap_status || null,
      status: p.status || 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('reschedule_requests')
      .insert(formattedPayloads);
    
    if (error) {
      console.error('Error creating reschedule request:', error);
      throw error;
    }
  },

  async deleteRescheduleRequest(id: string, actor: string): Promise<void> {
    const { error } = await supabase
      .from('reschedule_requests')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await this.logAudit({ actor, action: 'Deleted Reschedule Request', newValue: { id } });
  },

  async updateRescheduleRequestStatus(id: string, status: 'Approved' | 'Rejected', actor: string): Promise<void> {
    const { data: request, error: fetchError } = await supabase
      .from('reschedule_requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('reschedule_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;

    if (status === 'Approved') {
      // If approved, update the actual schedule
      const upserts = [{
        pic_name: request.pic_name,
        schedule_date: request.schedule_date,
        status: request.new_status
      }];

      // Handle Two-Way Swap
      if (request.swap_date && request.swap_status) {
        upserts.push({
          pic_name: request.pic_name,
          schedule_date: request.swap_date,
          status: request.swap_status
        });
      }

      await this.upsertSchedules(upserts);
    }

    await this.logAudit({ 
      actor, 
      action: `Reschedule Request ${status}`, 
      oldValue: request,
      newValue: { ...request, status }
    });
  },

  async getProjectRescheduleLogs(projectId: string): Promise<ProjectRescheduleLog[]> {
    const { data, error } = await supabase
      .from('project_reschedule_logs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createProjectRescheduleLog(log: Partial<ProjectRescheduleLog>): Promise<void> {
    const sanitizeDate = (d: any) => (d === 'N/A' || !d || d === 'null' || d === 'undefined') ? null : d;
    const sanitizedLog = {
      ...log,
      old_start_date: sanitizeDate(log.old_start_date),
      old_end_date: sanitizeDate(log.old_end_date),
      new_start_date: sanitizeDate(log.new_start_date),
      new_end_date: sanitizeDate(log.new_end_date),
    };
    const { error } = await supabase
      .from('project_reschedule_logs')
      .insert([sanitizedLog]);
    if (error) throw error;
    
    await this.logAudit({ 
      project_id: log.project_id, 
      actor: log.changed_by || 'System', 
      action: 'Project Rescheduled', 
      newValue: sanitizedLog 
    });
  },

  async updateProject(id: string, updates: Partial<Project>, actor: string, options?: { isAutoSync?: boolean }): Promise<Project> {
    const { data: existing, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    const finalUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    if (updates.start_date !== undefined) finalUpdates.start_date = sanitizeDate(updates.start_date);
    if (updates.end_date !== undefined) finalUpdates.end_date = sanitizeDate(updates.end_date);
    if (updates.project_diajukan !== undefined) finalUpdates.project_diajukan = updates.project_diajukan || null;

    const { data: updated, error: updateError } = await supabase
      .from('projects')
      .update(finalUpdates)
      .eq('id', id)
      .select()
      .single();
    if (updateError) throw updateError;

    // Sync to master_projects if ticket_id exists
    if (updated.ticket_id) {
      const { data: master } = await supabase.from('master_projects').select('id').eq('ticket_id', updated.ticket_id).maybeSingle();
      if (master) {
        await this.updateMasterProject(master.id, {
          project_name: updated.project_name,
          pic_name: updated.pic_name,
          owner_name: updated.owner_name,
          div_owner: updated.div_owner
        }, actor);
      }
    }

    const isAutoSync = options?.isAutoSync || actor.toLowerCase().includes('system') || actor.toLowerCase().includes('auto');

    if (isAutoSync) {
      // ➡️ ROUTE 1: SYSTEM LOGS
      await this.logAudit({ 
        project_id: id, 
        actor: actor, // Fixed column name (removed authorized_by in logAudit)
        action: 'Auto-sync update', 
        oldValue: existing, 
        newValue: updated 
      });
    } else {
      // ➡️ ROUTE 2: HISTORY EDIT (Manual changes)
      const ignoredFields = ['updated_at', 'created_at', 'id', 'project_id', 'raw_data'];
      const changesToLog: any[] = [];

      for (const key in updates) {
        if (ignoredFields.includes(key)) continue;

        const oldVal = (existing as any)[key];
        const newVal = (updated as any)[key];

        if (String(oldVal || "") !== String(newVal || "")) {
          const formattedFieldName = key.replace(/_/g, ' ').toUpperCase();

          changesToLog.push({
            project_id: id,
            pic_name: actor,
            field_name: formattedFieldName,
            before_value: oldVal !== undefined && oldVal !== null ? String(oldVal) : "-",
            after_value: newVal !== undefined && newVal !== null ? String(newVal) : "-"
          });
        }
      }

      if (changesToLog.length > 0) {
        const { error: historyErr } = await supabase.from('history_edit_project').insert(changesToLog);
        if (historyErr) console.error("🚨 HISTORY EDIT INSERT FAILED:", historyErr);
      }

      // Avoid double logging in audit_logs for manual edits.
      // They are recorded in history_edit_project and master_project_audit_logs.
      await this.logAudit({ 
        project_id: id, 
        actor, 
        action: 'Manual Update', 
        oldValue: existing, 
        newValue: updated,
        skipAuditLogs: true 
      });
    }

    return updated;
  },

  // --- Audit Logs ---
  async getAuditLogs(params?: { taskId?: string, projectId?: string, userId?: string }): Promise<AuditLog[]> {
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (params?.taskId) query = query.eq('task_id', params.taskId);
    if (params?.projectId) query = query.eq('project_id', params.projectId);
    if (params?.userId) query = query.eq('user_id', params.userId);
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getHistoryEditProjects(projectId?: string, taskId?: string): Promise<any[]> {
    let query = supabase.from('history_edit_project').select('*').order('created_at', { ascending: false });
    if (projectId) query = query.eq('project_id', projectId);
    if (taskId) query = query.eq('task_id', taskId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async logAudit({ task_id, project_id, user_id, actor, action, oldValue, newValue, skipAuditLogs }: { 
    task_id?: string, 
    project_id?: string, 
    user_id?: string, 
    actor: string, 
    action: string, 
    oldValue?: any, 
    newValue?: any,
    skipAuditLogs?: boolean
  }) {
    // 1. Insert into specific audit_logs table (used by Task Detail / Project Detail UI)
    if (!skipAuditLogs) {
      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert([{
          task_id,
          project_id,
          user_id,
          actor,
          action,
          old_payload: oldValue || null,
          new_payload: newValue || null,
          created_at: new Date().toISOString()
        }]);

      if (auditError) {
        console.error("🚨 AUDIT LOG INSERT FAILED (audit_logs):", auditError.message, auditError.details, {
          task_id, project_id, actor, action
        });
      }
    }

    // 2. Determine note and master_project_id for master_project_audit_logs
    const note = `Action: ${action}${oldValue ? ` | From: ${JSON.stringify(oldValue)}` : ''}${newValue ? ` | To: ${JSON.stringify(newValue)}` : ''}`;
    
    let masterProjectId = null;
    if (project_id) {
       const { data: proj } = await supabase.from('projects').select('ticket_id').eq('id', project_id).maybeSingle();
       if (proj?.ticket_id) {
          const { data: master } = await supabase.from('master_projects').select('id').eq('ticket_id', proj.ticket_id).maybeSingle();
          masterProjectId = master?.id;
       }
    }

    const { error: masterError } = await supabase
      .from('master_project_audit_logs')
      .insert([{
        master_project_id: masterProjectId,
        actor,
        action: action.includes('IMPORT') ? 'IMPORT' : (action.includes('CREATE') ? 'CREATE' : (action.includes('DELETE') ? 'DELETE' : 'UPDATE')),
        note: note.substring(0, 1000), 
        changed_fields: JSON.stringify({ oldValue, newValue }),
        created_at: new Date().toISOString()
      }]);
    
    if (masterError) {
       console.error("🚨 AUDIT LOG INSERT FAILED (master_project_audit_logs):", masterError.message, masterError.details, {
         masterProjectId, actor, action
       });
    }
  },

  async deleteTask(id: string, actor: string) {
    const { data: existing } = await supabase.from('tasks').select('*').eq('id', id).single();
    
    // Level 1 Delete: Cascade to all children (Level 2)
    const { data: children } = await supabase.from('tasks').select('id').eq('parent_id', id);
    if (children && children.length > 0) {
      const childIds = children.map(c => c.id);
      await supabase.from('tasks').delete().in('id', childIds);
    }

    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;

    await this.logAudit({ 
      task_id: id, 
      project_id: existing?.project_id,
      actor, 
      action: 'DELETED', 
      oldValue: existing 
    });
  },

  async createTask(task: Partial<Task>, actor: string): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    const created_by = user?.email || actor;
    
    // Safety calculation for end_time if start_time and durations are present
    let calculatedEndTime = task.end_time;
    if (!calculatedEndTime && task.start_time) {
      try {
        const start = new Date(task.start_time);
        const mins = ((task.duration_hours || 0) * 60) + (task.duration_minutes || 0);
        if (mins > 0) {
          calculatedEndTime = new Date(start.getTime() + mins * 60000).toISOString();
        }
      } catch (e) {
        console.warn("Could not calculate end_time", e);
      }
    }

    const { id: tid, ...taskToInsert } = task;
    // Strip IDs if they are temporary or null
    const finalTaskId = (tid && typeof tid === 'string' && !tid.startsWith('temp-')) ? tid : undefined;

    let finalStatus = (task.status || TaskStatus.TODO).toUpperCase();
    if (finalStatus === 'DRAFT' || finalStatus === 'Draft') finalStatus = 'TODO';

    const finalPayload: any = {
      ...taskToInsert,
      ...(finalTaskId ? { id: finalTaskId } : {}),
      custom_id: task.custom_id || `#TS-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      man_hours: Number(task.man_hours) || 0,
      start_time: sanitizeDate(task.start_time),
      end_time: sanitizeDate(calculatedEndTime),
      assignee: task.assignee || created_by,
      created_by_name: created_by,
      start_hour: parseInt(String(task.start_hour ?? 0)) || 0,
      start_minute: parseInt(String(task.start_minute ?? 0)) || 0,
      duration_hours: parseInt(String(task.duration_hours ?? 0)) || 0,
      duration_minutes: parseInt(String(task.duration_minutes ?? 0)) || 0,
      status: finalStatus,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([finalPayload])
      .select()
      .single();

    if (error) throw error;

    await this.logAudit({ 
      task_id: data.id, 
      project_id: data.project_id || undefined, 
      actor, 
      action: 'Created Task', 
      newValue: data 
    });
    return data;
  },

  async createTasks(tasks: Partial<Task>[], actor: string): Promise<Task[]> {
    if (tasks.length === 0) return [];
    
    const { data: { user } } = await supabase.auth.getUser();
    const created_by = user?.email || actor;

    const formattedTasks = tasks.map(task => {
      let calculatedEndTime = task.end_time;
      if (!calculatedEndTime && task.start_time) {
        try {
          const start = new Date(task.start_time);
          const mins = ((task.duration_hours || 0) * 60) + (task.duration_minutes || 0);
          if (mins > 0) {
            calculatedEndTime = new Date(start.getTime() + mins * 60000).toISOString();
          }
        } catch (e) {}
      }

      // Strip IDs if they are temporary or null
      const { id: tid, ...taskWithoutId } = task;
      const finalTaskId = (tid && typeof tid === 'string' && !tid.startsWith('temp-')) ? tid : undefined;

      let finalStatus = (task.status || TaskStatus.TODO).toUpperCase();
      if (finalStatus === 'DRAFT' || finalStatus === 'Draft') finalStatus = 'TODO';

      return {
        ...taskWithoutId,
        ...(finalTaskId ? { id: finalTaskId } : {}),
        custom_id: task.custom_id || `#TS-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        man_hours: Number(task.man_hours) || 0,
        start_time: sanitizeDate(task.start_time),
        end_time: sanitizeDate(calculatedEndTime),
        assignee: task.assignee || created_by,
        created_by_name: created_by,
        start_hour: parseInt(String(task.start_hour ?? 0)) || 0,
        start_minute: parseInt(String(task.start_minute ?? 0)) || 0,
        duration_hours: parseInt(String(task.duration_hours ?? 0)) || 0,
        duration_minutes: parseInt(String(task.duration_minutes ?? 0)) || 0,
        status: finalStatus,
        updated_at: new Date().toISOString()
      };
    });

    const { data, error } = await supabase
      .from('tasks')
      .insert(formattedTasks)
      .select();

    if (error) throw error;

    // Log individually or collectively? Collectively is better for performance
    await this.logAudit({ 
      actor, 
      action: `Batch Created ${data.length} Tasks`, 
      newValue: { count: data.length, project_id: data[0]?.project_id } 
    });

    return data || [];
  },

  async upsertTasks(tasks: Partial<Task>[], actor: string): Promise<Task[]> {
    if (tasks.length === 0) return [];
    const { data: { user } } = await supabase.auth.getUser();
    const actorEmail = user?.email || actor;

    const formattedTasks = tasks.map(task => {
      const { id: tid, ...taskRest } = task;
      const finalTaskId = (tid && typeof tid === 'string' && !tid.startsWith('temp-')) ? tid : undefined;

      let finalStatus: string = (task.status || TaskStatus.TODO).toUpperCase();
      if (finalStatus === 'DRAFT') finalStatus = 'TODO';

      return {
        ...taskRest,
        ...(finalTaskId ? { id: finalTaskId } : {}),
        status: finalStatus as TaskStatus,
        updated_at: new Date().toISOString(),
        man_hours: Number(task.man_hours) || 0,
        start_time: sanitizeDate(task.start_time) || null,
        end_time: sanitizeDate(task.end_time) || null
      };
    });

    const { data, error } = await supabase
      .from('tasks')
      .upsert(formattedTasks)
      .select();

    if (error) throw error;

    await this.logAudit({ 
      actor, 
      action: `Batch Upserted ${data.length} Tasks`, 
      newValue: { count: data.length, project_id: data[0]?.project_id } 
    });

    return data || [];
  },

  async updateTask(id: string, updates: Partial<Task>, actor: string, options?: { isAutoSync?: boolean }): Promise<Task> {
    const { data: existing, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const updatesToApply: any = { 
      ...updates, 
      updated_at: new Date().toISOString() 
    };

    // Always ensure status is valid even if not being explicitly updated
    // to satisfy DB constraints for pre-existing rows
    if (updates.status !== undefined || (existing.status === null || existing.status === undefined)) {
      let currentStatus: string = String(updates.status || existing.status || TaskStatus.TODO).toUpperCase();
      if (currentStatus === 'DRAFT') currentStatus = 'TODO';
      updatesToApply.status = currentStatus as TaskStatus;
    }

    if (updates.man_hours !== undefined) updatesToApply.man_hours = Number(updates.man_hours) || 0;
    if (updates.start_time !== undefined) updatesToApply.start_time = sanitizeDate(updates.start_time) || null;
    if (updates.end_time !== undefined) updatesToApply.end_time = sanitizeDate(updates.end_time) || null;

    const { data: updated, error: updateError } = await supabase
      .from('tasks')
      .update(updatesToApply)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    const isAutoSync = options?.isAutoSync || actor.toLowerCase().includes('system') || actor.toLowerCase().includes('auto');

    if (isAutoSync) {
      // ➡️ ROUTE 1: SYSTEM LOGS
      await this.logAudit({ 
        task_id: id, 
        project_id: updated.project_id || undefined, 
        actor, 
        action: 'Auto-sync task update', 
        oldValue: existing, 
        newValue: updated 
      });
    } else {
      // ➡️ ROUTE 2: HISTORY EDIT (Manual changes)
      const ignoredFields = ['updated_at', 'created_at', 'id', 'project_id', 'raw_data'];
      const changesToLog: any[] = [];
      const taskPrefix = `[WBS: ${existing.title || existing.task_name || existing.name || 'Task'}] `;

      for (const key in updates) {
        if (ignoredFields.includes(key)) continue;

        const oldVal = (existing as any)[key];
        const newVal = (updated as any)[key];

        if (String(oldVal || "") !== String(newVal || "")) {
          const formattedFieldName = taskPrefix + key.replace(/_/g, ' ').toUpperCase();

          changesToLog.push({
            project_id: updated.project_id,
            task_id: id,
            pic_name: actor,
            field_name: formattedFieldName,
            before_value: oldVal !== undefined && oldVal !== null ? String(oldVal) : "-",
            after_value: newVal !== undefined && newVal !== null ? String(newVal) : "-"
          });
        }
      }

      if (changesToLog.length > 0) {
        const { error: historyErr } = await supabase.from('history_edit_project').insert(changesToLog);
        if (historyErr) console.error("🚨 WBS HISTORY EDIT INSERT FAILED:", historyErr);
      }

      // Avoid double logging in audit_logs for manual WBS edits as per Task 4.
      // But still log to master_project_audit_logs via logAudit.
      await this.logAudit({ 
        task_id: id, 
        project_id: updated.project_id || undefined, 
        actor, 
        action: 'Manual Task Update', 
        oldValue: existing, 
        newValue: updated,
        skipAuditLogs: true 
      });
    }
    
    return updated;
  },

  // --- Master Projects ---
  async getMasterProjects(): Promise<MasterProject[]> {
    const { data, error } = await supabase
      .from('master_projects')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async previewImportMasterProjects(projects: any[]): Promise<{ total: number, updated: number, inserted: number, skipped: number, diffs: any[] }> {
    const stats: any = { total: projects.length, updated: 0, inserted: 0, skipped: 0, diffs: [] };
    
    // 1. Get all existing master projects for comparison
    const { data: existing } = await supabase.from('master_projects').select('*');
    const existingMap = new Map((existing || []).map(p => [p.ticket_id, p]));

    for (const p of projects) {
      const ticketId = String(p.ticket_id).trim();
      if (!ticketId) {
        stats.skipped++;
        continue;
      }

      const existingRecord = existingMap.get(ticketId);

      if (existingRecord) {
        // Branching Logic: REPLACE/UPDATE
        const normalize = (v: any) => v === null || v === undefined ? '' : String(v).trim();
        
        const changes: any = {};
        ['status', 'pic_name', 'owner_name', 'div_owner', 'project_name'].forEach(field => {
          if (normalize(existingRecord[field]) !== normalize(p[field])) {
            changes[field] = { from: existingRecord[field], to: p[field] };
          }
        });

        if (Object.keys(changes).length > 0) {
          stats.updated++;
          stats.diffs.push({ ticket_id: ticketId, name: p.project_name || existingRecord.project_name, type: 'UPDATE', changes });
        } else {
          stats.skipped++;
        }
      } else {
        // INSERT
        stats.inserted++;
        stats.diffs.push({ ticket_id: ticketId, name: p.project_name, type: 'INSERT', data: p });
      }
    }

    return stats;
  },

  async getMasterProjectAuditLogs(masterProjectId: string): Promise<MasterProjectAuditLog[]> {
    const { data, error } = await supabase
      .from('master_project_audit_logs')
      .select('*')
      .eq('master_project_id', masterProjectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createMasterProject(project: Partial<MasterProject>, actor: string): Promise<MasterProject> {
    const { data, error } = await supabase
      .from('master_projects')
      .insert([{
        ...project,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;

    await this.logMasterProjectAudit({
      master_project_id: data.id,
      actor,
      action: 'CREATE',
      note: 'Manual entry creation.'
    });

    return data;
  },

  async updateMasterProject(id: string, updates: Partial<MasterProject>, actor: string): Promise<MasterProject> {
    const { data: existing } = await supabase.from('master_projects').select('*').eq('id', id).single();
    
    const { data: updated, error } = await supabase
      .from('master_projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    const changedFields: any = {};
    Object.keys(updates).forEach(key => {
      if ((updates as any)[key] !== (existing as any)[key]) {
        changedFields[key] = { from: (existing as any)[key], to: (updates as any)[key] };
      }
    });

    await this.logMasterProjectAudit({
      master_project_id: id,
      actor,
      action: 'UPDATE',
      note: `Updated: ${Object.keys(changedFields).join(', ')}`,
      changed_fields: JSON.stringify(changedFields)
    });

    return updated;
  },

  async deleteMasterProject(id: string, actor: string): Promise<void> {
    const { error } = await supabase.from('master_projects').delete().eq('id', id);
    if (error) throw error;
    await this.logMasterProjectAudit({
      master_project_id: id,
      actor,
      action: 'DELETE',
      note: 'The record was permanently deleted from the Master Repository.'
    });
  },

  async importMasterProjects(projects: any[], actor: string): Promise<{ total: number, updated: number, inserted: number, skipped: number }> {
    const stats = { total: projects.length, updated: 0, inserted: 0, skipped: 0 };
    
    // 1. Get all existing master projects for comparison
    const { data: existing } = await supabase.from('master_projects').select('*');
    const existingMap = new Map((existing || []).map(p => [p.ticket_id, p]));

    for (const p of projects) {
      const ticketId = String(p.ticket_id).trim();
      if (!ticketId) {
        stats.skipped++;
        continue;
      }

      const existingRecord = existingMap.get(ticketId);

      if (existingRecord) {
        // Branching Logic: REPLACE/UPDATE
        // Compare values, normalize nulls/empty strings
        const normalize = (v: any) => v === null || v === undefined ? '' : String(v).trim();
        
        const hasChanges = 
          normalize(existingRecord.status) !== normalize(p.status) || 
          normalize(existingRecord.pic_name) !== normalize(p.pic_name) || 
          normalize(existingRecord.owner_name) !== normalize(p.owner_name) ||
          normalize(existingRecord.div_owner) !== normalize(p.div_owner) ||
          normalize(existingRecord.project_name) !== normalize(p.project_name) ||
          normalize(existingRecord.plan_start_date) !== normalize(p.plan_start_date) ||
          normalize(existingRecord.plan_end_date) !== normalize(p.plan_end_date) ||
          Number(existingRecord.total_man_hours || 0) !== Number(p.total_man_hours || 0);

        if (hasChanges) {
          const changedFields: any = {};
          if (normalize(existingRecord.status) !== normalize(p.status)) changedFields.status = { from: existingRecord.status, to: p.status };
          if (normalize(existingRecord.pic_name) !== normalize(p.pic_name)) changedFields.pic_name = { from: existingRecord.pic_name, to: p.pic_name };
          if (normalize(existingRecord.owner_name) !== normalize(p.owner_name)) changedFields.owner_name = { from: existingRecord.owner_name, to: p.owner_name };
          if (normalize(existingRecord.div_owner) !== normalize(p.div_owner)) changedFields.div_owner = { from: existingRecord.div_owner, to: p.div_owner };
          if (normalize(existingRecord.project_name) !== normalize(p.project_name)) changedFields.project_name = { from: existingRecord.project_name, to: p.project_name };
          if (normalize(existingRecord.plan_start_date) !== normalize(p.plan_start_date)) changedFields.plan_start_date = { from: existingRecord.plan_start_date, to: p.plan_start_date };
          if (normalize(existingRecord.plan_end_date) !== normalize(p.plan_end_date)) changedFields.plan_end_date = { from: existingRecord.plan_end_date, to: p.plan_end_date };
          if (Number(existingRecord.total_man_hours || 0) !== Number(p.total_man_hours || 0)) changedFields.total_man_hours = { from: existingRecord.total_man_hours, to: p.total_man_hours };

          await supabase
            .from('master_projects')
            .update({
              ...p,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingRecord.id);

          await this.logMasterProjectAudit({
            master_project_id: existingRecord.id,
            actor,
            action: 'UPDATE',
            note: 'IMPORT_UPDATE: Data synced from CSV.',
            changed_fields: JSON.stringify(changedFields)
          });
          stats.updated++;
        } else {
          // SKIP
          stats.skipped++;
        }
      } else {
        // INSERT
        const { data: inserted, error: insertError } = await supabase
          .from('master_projects')
          .insert([{
            ...p,
            owner_name: p.owner_name || 'N/A',
            div_owner: p.div_owner || 'N/A',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Failed to insert master project during import:', insertError);
          stats.skipped++;
          continue;
        }

        await this.logMasterProjectAudit({
          master_project_id: inserted.id,
          actor,
          action: 'CREATE',
          note: 'NEW_SYNC: Added as new row from CSV import.',
        });
        stats.inserted++;
      }
    }

    return stats;
  },

  async logMasterProjectAudit(log: Partial<MasterProjectAuditLog>): Promise<void> {
    const { error } = await supabase
      .from('master_project_audit_logs')
      .insert([{
        ...log,
        created_at: new Date().toISOString()
      }]);
    if (error) console.error('Failed to log master project audit:', error);
  },

  // --- Om Dedy Schedules ---
  async getSchedules(monthStart?: Date): Promise<Schedule[]> {
    let query = supabase.from('schedules').select('*');
    
    if (monthStart) {
      const start = format(monthStart, 'yyyy-MM-01');
      const end = format(endOfMonth(monthStart), 'yyyy-MM-dd');
      query = query.gte('schedule_date', start).lte('schedule_date', end);
    }

    const { data, error } = await query.order('schedule_date', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async upsertSchedules(schedules: Partial<Schedule>[]): Promise<void> {
    const { error } = await supabase
      .from('schedules')
      .upsert(schedules, { onConflict: 'pic_name,schedule_date' });
    if (error) throw error;
  },

  async seedSampleData(actor: string): Promise<void> {
    const now = new Date();
    const day = (d: number) => new Date(now.getTime() + (d - 1) * 24 * 60 * 60 * 1000).toISOString();
    
    // 1. Create Projects
    const prj1 = await this.createProject({ project_name: 'Digitalisasi SPPK Phase 2', status: ProjectStatus.IN_PROGRESS }, actor);
    const prj2 = await this.createProject({ project_name: 'Enhancement Asset Management', status: ProjectStatus.IN_PROGRESS }, actor);

    // 2. Create Users
    await this.createUser({ name: 'Hari', access_level: 'PIC', role: 'PIC' }, actor);
    await this.createUser({ name: 'William', access_level: 'PIC', role: 'Developer' }, actor);
    await this.createUser({ name: 'Salvador', access_level: 'PIC', role: 'Developer' }, actor);
    await this.createUser({ name: 'Syahid', access_level: 'Admin', role: 'QA' }, actor);
    await this.createUser({ name: 'Danuh', access_level: 'PIC', role: 'PIC' }, actor);

    // 3. Create Tasks for Project 1
    const p1_root = await this.createTask({
      title: 'Project Timeline',
      assignee: 'Head Manager',
      start_time: day(1),
      end_time: day(34),
      project_id: prj1.id
    }, actor);

    await this.createTask({ title: 'Breakdown FSD', parent_id: p1_root.id, project_id: prj1.id, assignee: 'Hari', start_time: day(1), end_time: day(2) }, actor);
    await this.createTask({ title: 'Create FSD', parent_id: p1_root.id, project_id: prj1.id, assignee: 'Hari', start_time: day(3), end_time: day(5) }, actor);
    await this.createTask({ 
      title: 'Feature: Auth Module', 
      parent_id: p1_root.id, 
      project_id: prj1.id, 
      assignee: 'William', 
      developer_name: 'William',
      start_time: day(8), 
      end_time: day(15) 
    }, actor);

    // 4. Create Tasks for Project 2 (Collision)
    const p2_root = await this.createTask({
      title: 'Enhancement Timeline',
      assignee: 'Manager 2',
      start_time: day(10),
      end_time: day(20),
      project_id: prj2.id
    }, actor);

    await this.createTask({ 
      title: 'Asset Module Dev (Collision with William)', 
      parent_id: p2_root.id, 
      project_id: prj2.id, 
      assignee: 'William', 
      developer_name: 'William',
      start_time: day(12), 
      end_time: day(18) 
    }, actor);
  }
};
