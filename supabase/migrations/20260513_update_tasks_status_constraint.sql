-- Update constraint pada tasks agar menerima status 'LIVE'
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS status_check;

ALTER TABLE public.tasks 
ADD CONSTRAINT status_check 
CHECK (upper(status) = ANY (ARRAY['TODO', 'IN PROGRESS', 'ON HOLD', 'ON QUEUE', 'DONE', 'CANCEL', 'LIVE']));
