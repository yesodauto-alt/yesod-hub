-- profile-avatars
DROP POLICY IF EXISTS "avatars readable" ON storage.objects;
CREATE POLICY "avatars readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS "avatars own insert" ON storage.objects;
CREATE POLICY "avatars own insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars own update" ON storage.objects;
CREATE POLICY "avatars own update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars own delete" ON storage.objects;
CREATE POLICY "avatars own delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- project-media
DROP POLICY IF EXISTS "project media readable" ON storage.objects;
CREATE POLICY "project media readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-media');

DROP POLICY IF EXISTS "project media admin insert" ON storage.objects;
CREATE POLICY "project media admin insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "project media admin update" ON storage.objects;
CREATE POLICY "project media admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "project media admin delete" ON storage.objects;
CREATE POLICY "project media admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));

-- site-media
DROP POLICY IF EXISTS "site media readable" ON storage.objects;
CREATE POLICY "site media readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-media');

DROP POLICY IF EXISTS "site media admin insert" ON storage.objects;
CREATE POLICY "site media admin insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "site media admin update" ON storage.objects;
CREATE POLICY "site media admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "site media admin delete" ON storage.objects;
CREATE POLICY "site media admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));