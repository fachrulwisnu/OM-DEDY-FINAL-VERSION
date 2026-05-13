-- 1. Clean up mistakenly added columns from the projects table
ALTER TABLE projects 
DROP COLUMN IF EXISTS project_type, 
DROP COLUMN IF EXISTS components, 
DROP COLUMN IF EXISTS detail_keterangan;

-- 2. Add the correct columns to the 'tasks' (L2) table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS task_type TEXT, -- e.g., 'New Feature' | 'Improvement'
ADD COLUMN IF NOT EXISTS components TEXT[], -- Array: ['Web', 'Android', 'API', etc.]
ADD COLUMN IF NOT EXISTS detail_task TEXT; -- The large description field
