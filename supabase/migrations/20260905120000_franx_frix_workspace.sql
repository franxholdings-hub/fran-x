-- ============================================================
-- FRIX AI WORKSPACE — authenticated member experience
-- Extends the EXISTING ai_conversations / ai_messages tables
-- (no duplicate tables). Adds:
--   title : human-readable conversation name (renameable)
--   mode  : the FRIX mode selected for the conversation
--           (normal | pidgin | exam | lowdata)
-- Conversations remain owner-scoped via user_id + existing RLS.
-- ============================================================

alter table public.ai_conversations add column if not exists title text;
alter table public.ai_conversations add column if not exists mode text;
