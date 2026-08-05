-- Project and site media are displayed on public pages and need stable public URLs.
UPDATE storage.buckets
SET public = true
WHERE id IN ('project-media', 'site-media');
