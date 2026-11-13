CREATE TABLE public.pam_training_state (
  user_id uuid PRIMARY KEY,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.pam_training_state TO authenticated;
GRANT ALL ON public.pam_training_state TO service_role;
ALTER TABLE public.pam_training_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Learners can read their own PAM training state"
  ON public.pam_training_state FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Learners can create their own PAM training state"
  ON public.pam_training_state FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Learners can update their own PAM training state"
  ON public.pam_training_state FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);