CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  companion text CHECK (companion IN ('fox','pip','mia','leo')),
  level text NOT NULL DEFAULT 'beginner',
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.mission_progress (
  user_id uuid NOT NULL,
  mission_id text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  score int NOT NULL DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, mission_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_progress TO authenticated;
GRANT ALL ON public.mission_progress TO service_role;
ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own missions" ON public.mission_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.learned_words (
  user_id uuid NOT NULL,
  word_id text NOT NULL,
  times_seen int NOT NULL DEFAULT 1,
  last_seen timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, word_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learned_words TO authenticated;
GRANT ALL ON public.learned_words TO service_role;
ALTER TABLE public.learned_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own words" ON public.learned_words FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.activity_log (
  user_id uuid NOT NULL,
  day date NOT NULL DEFAULT current_date,
  PRIMARY KEY (user_id, day)
);
GRANT SELECT, INSERT, DELETE ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own activity" ON public.activity_log FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)));
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();