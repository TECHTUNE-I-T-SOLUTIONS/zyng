-- replies_policy.sql
-- Grants authenticated users the ability to insert replies through their own persona.
-- Safe to run multiple times.

ALTER TABLE IF EXISTS public.replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS replies_select_all ON public.replies;
CREATE POLICY replies_select_all
ON public.replies
FOR SELECT
USING (true);

DROP POLICY IF EXISTS replies_insert_own_persona ON public.replies;
CREATE POLICY replies_insert_own_persona
ON public.replies
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.personas p
    WHERE p.id = persona_id
      AND p.user_id = auth.uid()
  )
);
