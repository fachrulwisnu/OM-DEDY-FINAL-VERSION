ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_type TEXT, -- 'New Feature' | 'Improvement'
ADD COLUMN IF NOT EXISTS components TEXT[], -- Array for multiple select: ['web', 'api', ...]
ADD COLUMN IF NOT EXISTS detail_keterangan TEXT; 
