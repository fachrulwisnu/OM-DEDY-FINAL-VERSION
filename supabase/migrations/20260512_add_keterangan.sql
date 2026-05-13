ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS keterangan TEXT NULL;

-- If project_tasks is used instead (as per user request mentioning both)
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS keterangan TEXT NULL;
