-- Enable Row Level Security for all app tables and enforce idea ownership.

begin;

do $$
begin
  if not exists (
    select 1
    from auth.users
    where id = 'a389b178-fbd2-4844-83f5-9c8c059ff990'
  ) then
    raise exception 'Expected owner user for ideas backfill was not found in auth.users';
  end if;

  update public.ideas
  set user_id = 'a389b178-fbd2-4844-83f5-9c8c059ff990'
  where user_id is null;
end
$$;

alter table public.ideas
  alter column user_id set not null;

create index if not exists ideas_user_id_idx
  on public.ideas (user_id);

alter table public.ideas enable row level security;
alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.insights enable row level security;

drop policy if exists ideas_select_own on public.ideas;
create policy ideas_select_own
  on public.ideas
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists ideas_insert_own on public.ideas;
create policy ideas_insert_own
  on public.ideas
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists ideas_update_own on public.ideas;
create policy ideas_update_own
  on public.ideas
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists ideas_delete_own on public.ideas;
create policy ideas_delete_own
  on public.ideas
  for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists leads_select_via_owned_idea on public.leads;
create policy leads_select_via_owned_idea
  on public.leads
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.ideas
      where ideas.id = leads.idea_id
        and ideas.user_id = auth.uid()
    )
  );

drop policy if exists leads_insert_via_owned_idea on public.leads;
create policy leads_insert_via_owned_idea
  on public.leads
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.ideas
      where ideas.id = leads.idea_id
        and ideas.user_id = auth.uid()
    )
  );

drop policy if exists leads_update_via_owned_idea on public.leads;
create policy leads_update_via_owned_idea
  on public.leads
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.ideas
      where ideas.id = leads.idea_id
        and ideas.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.ideas
      where ideas.id = leads.idea_id
        and ideas.user_id = auth.uid()
    )
  );

drop policy if exists leads_delete_via_owned_idea on public.leads;
create policy leads_delete_via_owned_idea
  on public.leads
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.ideas
      where ideas.id = leads.idea_id
        and ideas.user_id = auth.uid()
    )
  );

drop policy if exists conversations_select_via_owned_idea on public.conversations;
create policy conversations_select_via_owned_idea
  on public.conversations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.leads
      join public.ideas on ideas.id = leads.idea_id
      where leads.id = conversations.lead_id
        and ideas.user_id = auth.uid()
    )
  );

drop policy if exists conversations_insert_via_owned_idea on public.conversations;
create policy conversations_insert_via_owned_idea
  on public.conversations
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.leads
      join public.ideas on ideas.id = leads.idea_id
      where leads.id = conversations.lead_id
        and ideas.user_id = auth.uid()
    )
  );

drop policy if exists conversations_update_via_owned_idea on public.conversations;
create policy conversations_update_via_owned_idea
  on public.conversations
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.leads
      join public.ideas on ideas.id = leads.idea_id
      where leads.id = conversations.lead_id
        and ideas.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.leads
      join public.ideas on ideas.id = leads.idea_id
      where leads.id = conversations.lead_id
        and ideas.user_id = auth.uid()
    )
  );

drop policy if exists conversations_delete_via_owned_idea on public.conversations;
create policy conversations_delete_via_owned_idea
  on public.conversations
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.leads
      join public.ideas on ideas.id = leads.idea_id
      where leads.id = conversations.lead_id
        and ideas.user_id = auth.uid()
    )
  );

drop policy if exists insights_select_via_owned_idea on public.insights;
create policy insights_select_via_owned_idea
  on public.insights
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.leads
      join public.ideas on ideas.id = leads.idea_id
      where leads.id = insights.lead_id
        and ideas.user_id = auth.uid()
    )
  );

drop policy if exists insights_insert_via_owned_idea on public.insights;
create policy insights_insert_via_owned_idea
  on public.insights
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.leads
      join public.ideas on ideas.id = leads.idea_id
      where leads.id = insights.lead_id
        and ideas.user_id = auth.uid()
    )
  );

drop policy if exists insights_update_via_owned_idea on public.insights;
create policy insights_update_via_owned_idea
  on public.insights
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.leads
      join public.ideas on ideas.id = leads.idea_id
      where leads.id = insights.lead_id
        and ideas.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.leads
      join public.ideas on ideas.id = leads.idea_id
      where leads.id = insights.lead_id
        and ideas.user_id = auth.uid()
    )
  );

drop policy if exists insights_delete_via_owned_idea on public.insights;
create policy insights_delete_via_owned_idea
  on public.insights
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.leads
      join public.ideas on ideas.id = leads.idea_id
      where leads.id = insights.lead_id
        and ideas.user_id = auth.uid()
    )
  );

commit;
