-- Separate login from membership entitlement and editorial permissions.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS membership_status text;

-- Require approval for existing and new members while keeping administrators
-- able to manage the approval queue.
UPDATE public.profiles
SET membership_status = CASE
  WHEN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = profiles.id AND role = 'admin'
  ) THEN 'active'
  ELSE 'pending'
END
WHERE membership_status IS NULL;

UPDATE public.profiles AS profile
SET email = auth_user.email
FROM auth.users AS auth_user
WHERE auth_user.id = profile.id
  AND profile.email IS DISTINCT FROM auth_user.email;

ALTER TABLE public.profiles
  ALTER COLUMN membership_status SET DEFAULT 'pending',
  ALTER COLUMN membership_status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_membership_status_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_membership_status_check
      CHECK (membership_status IN ('pending', 'active', 'suspended'));
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.content_editors (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.content_editors TO authenticated;
GRANT ALL ON public.content_editors TO service_role;
ALTER TABLE public.content_editors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content editors read own assignment" ON public.content_editors;
CREATE POLICY "content editors read own assignment" ON public.content_editors
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'));

DROP POLICY IF EXISTS "admins assign content editors" ON public.content_editors;
CREATE POLICY "admins assign content editors" ON public.content_editors
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin') AND assigned_by = (SELECT auth.uid()));

DROP POLICY IF EXISTS "admins remove content editors" ON public.content_editors;
CREATE POLICY "admins remove content editors" ON public.content_editors
  FOR DELETE TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

CREATE OR REPLACE FUNCTION public.can_manage_exclusive_content()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role((SELECT auth.uid()), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.content_editors
      WHERE user_id = (SELECT auth.uid())
    );
$$;

CREATE OR REPLACE FUNCTION public.can_view_exclusive_content()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.can_manage_exclusive_content()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND membership_status = 'active'
    );
$$;

REVOKE ALL ON FUNCTION public.can_manage_exclusive_content() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_view_exclusive_content() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_exclusive_content() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_exclusive_content() TO authenticated;

CREATE OR REPLACE FUNCTION public.prevent_self_membership_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = NEW.id AND NOT public.has_role((SELECT auth.uid()), 'admin') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.membership_status := 'pending';
    ELSE
      NEW.membership_status := OLD.membership_status;
    END IF;
    IF TG_OP = 'UPDATE' THEN
      NEW.email := OLD.email;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_self_membership_changes ON public.profiles;
CREATE TRIGGER profiles_prevent_self_membership_changes
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_membership_changes();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_account_type text := nullif(meta->>'account_type','');
  v_employee_count integer;
BEGIN
  IF v_account_type IS NOT NULL AND v_account_type NOT IN ('individual','company') THEN
    v_account_type := NULL;
  END IF;
  BEGIN
    v_employee_count := nullif(meta->>'employee_count','')::integer;
  EXCEPTION WHEN others THEN
    v_employee_count := NULL;
  END;
  IF v_employee_count IS NOT NULL AND v_employee_count < 1 THEN
    v_employee_count := NULL;
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, company, phone, community_goal,
    account_type, employee_count, newsletter_opt_in, membership_status
  ) VALUES (
    new.id, new.email, nullif(meta->>'full_name',''), nullif(meta->>'company',''),
    nullif(meta->>'phone',''), nullif(meta->>'community_goal',''), v_account_type,
    v_employee_count, coalesce((meta->>'newsletter_opt_in')::boolean, false), 'pending'
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'member')
  ON CONFLICT DO NOTHING;
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_email_after_auth_update ON auth.users;
CREATE TRIGGER sync_profile_email_after_auth_update
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.sync_profile_email();

DROP POLICY IF EXISTS "admins read member profiles" ON public.profiles;
CREATE POLICY "admins read member profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

DROP POLICY IF EXISTS "admins update member access" ON public.profiles;
CREATE POLICY "admins update member access" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

DROP POLICY IF EXISTS "members read published exclusive content" ON public.exclusive_contents;
DROP POLICY IF EXISTS "admins insert exclusive content" ON public.exclusive_contents;
DROP POLICY IF EXISTS "admins update exclusive content" ON public.exclusive_contents;
DROP POLICY IF EXISTS "admins delete exclusive content" ON public.exclusive_contents;

CREATE POLICY "active members and editors read exclusive content" ON public.exclusive_contents
  FOR SELECT TO authenticated
  USING (
    (published = true AND public.can_view_exclusive_content())
    OR public.can_manage_exclusive_content()
  );
CREATE POLICY "content editors insert exclusive content" ON public.exclusive_contents
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_exclusive_content());
CREATE POLICY "content editors update exclusive content" ON public.exclusive_contents
  FOR UPDATE TO authenticated
  USING (public.can_manage_exclusive_content())
  WITH CHECK (public.can_manage_exclusive_content());
CREATE POLICY "content editors delete exclusive content" ON public.exclusive_contents
  FOR DELETE TO authenticated
  USING (public.can_manage_exclusive_content());

DROP POLICY IF EXISTS "exclusive media members read" ON storage.objects;
DROP POLICY IF EXISTS "exclusive media admin insert" ON storage.objects;
DROP POLICY IF EXISTS "exclusive media admin update" ON storage.objects;
DROP POLICY IF EXISTS "exclusive media admin delete" ON storage.objects;

CREATE POLICY "active members read exclusive media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'exclusive-media' AND public.can_view_exclusive_content());
CREATE POLICY "content editors upload exclusive media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'exclusive-media' AND public.can_manage_exclusive_content());
CREATE POLICY "content editors update exclusive media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'exclusive-media' AND public.can_manage_exclusive_content())
  WITH CHECK (bucket_id = 'exclusive-media' AND public.can_manage_exclusive_content());
CREATE POLICY "content editors delete exclusive media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'exclusive-media' AND public.can_manage_exclusive_content());
