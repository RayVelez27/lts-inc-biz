-- ============================================================================
-- 0003 — Storage bucket for customer-uploaded designs (logos, artwork).
-- ============================================================================
-- Uploaded by the product customizer, rendered back into the preview, saved
-- onto cart items, and eventually reviewed by your embroiderers when the
-- order lands.
--
-- Design decisions:
--   * Bucket is PUBLIC READ so the cart/checkout/admin UIs can <img src=...>
--     the uploaded design without having to mint signed URLs every time.
--   * 5 MB per-file limit (enforced by Supabase at upload time).
--   * Anonymous uploads are allowed — many customers customize before signing
--     in. Path convention is designs/<user_id_or_session>/<filename>.
--   * Users can only modify/delete objects they own (owner = auth.uid()).
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'designs',
  'designs',
  true,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public can read any file in the bucket.
drop policy if exists "designs: public read" on storage.objects;
create policy "designs: public read"
  on storage.objects for select
  using (bucket_id = 'designs');

-- Anyone (signed in or not) can upload a design.
-- Size + mime checks are enforced by the bucket configuration above.
drop policy if exists "designs: anyone can upload" on storage.objects;
create policy "designs: anyone can upload"
  on storage.objects for insert
  with check (bucket_id = 'designs');

-- Only the uploader can replace or delete their design.
drop policy if exists "designs: owner update" on storage.objects;
create policy "designs: owner update"
  on storage.objects for update
  using (bucket_id = 'designs' and auth.uid() = owner)
  with check (bucket_id = 'designs' and auth.uid() = owner);

drop policy if exists "designs: owner delete" on storage.objects;
create policy "designs: owner delete"
  on storage.objects for delete
  using (bucket_id = 'designs' and auth.uid() = owner);
