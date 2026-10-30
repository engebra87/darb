-- «أرض طلبة العلم»: بيت لكل لاعب يُبنى جزءًا جزءًا (١٢ جزءًا = ٤ مستويات × ٣ حارات)
-- يُشغَّل مرة واحدة في Supabase → SQL Editor. آمن لإعادة التشغيل.

create table if not exists public.darb_house (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  parts       int  not null default 0 check (parts between 0 and 12),
  country     text check (country ~ '^[A-Z]{2}$'),
  findable    boolean not null default true,   -- يسمح لغيره أن يجده بالبريد
  updated_at  timestamptz not null default now()
);
create index if not exists darb_house_country_idx on public.darb_house (country, parts desc);

-- لا وصول مباشر للجدول؛ كل شيء عبر الدوال بالأسفل
alter table public.darb_house enable row level security;
revoke all on public.darb_house from anon, authenticated;

-- عدد الأجزاء من التقدّم: الحارات المنتهية في المستويات السابقة + المستوى الحالي
create or replace function public.darb_parts_from(p_round int, p_done jsonb)
returns int language sql immutable as $$
  select least(12, greatest(0,
    (greatest(coalesce(p_round,1),1) - 1) * 3
    + (case when coalesce((p_done->>'fiqh')::boolean,false)   then 1 else 0 end)
    + (case when coalesce((p_done->>'sira')::boolean,false)   then 1 else 0 end)
    + (case when coalesce((p_done->>'hadith')::boolean,false) then 1 else 0 end)))
$$;

-- كلما حُفظ التقدّم يكبر البيت، ولا يصغر أبدًا (حتى لو بدأ اللاعب من الأول)
create or replace function public.darb_house_sync()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.darb_house as h (user_id, parts)
  values (new.user_id, public.darb_parts_from(new.round, to_jsonb(new.done)))
  on conflict (user_id) do update
    set parts = greatest(h.parts, excluded.parts),
        updated_at = case when excluded.parts > h.parts then now() else h.updated_at end;
  return new;
end $$;

drop trigger if exists darb_house_sync on public.darb_progress;
create trigger darb_house_sync after insert or update on public.darb_progress
  for each row execute function public.darb_house_sync();

-- بناء بيوت اللاعبين الحاليين من تقدّمهم المحفوظ
insert into public.darb_house (user_id, parts)
select p.user_id, public.darb_parts_from(p.round, to_jsonb(p.done)) from public.darb_progress p
on conflict (user_id) do update set parts = greatest(public.darb_house.parts, excluded.parts);

-- آخر جدار في المستوى الرابع: اللعبة تعيد اللاعب للبداية فورًا، فنُكمل البيت هنا
create or replace function public.darb_house_finish()
returns int language plpgsql security definer set search_path = public as $$
declare r int; d jsonb; n int;
begin
  if auth.uid() is null then return 0; end if;
  select round, to_jsonb(done) into r, d from public.darb_progress where user_id = auth.uid();
  if r = 4 and public.darb_parts_from(r, d) >= 11 then
    insert into public.darb_house (user_id, parts) values (auth.uid(), 12)
    on conflict (user_id) do update set parts = 12, updated_at = now();
  end if;
  select parts into n from public.darb_house where user_id = auth.uid();
  return coalesce(n, 0);
end $$;

-- بيتي: الأجزاء والبلد وإعداد البحث
create or replace function public.darb_my_house()
returns table(parts int, country text, findable boolean, display_name text)
language sql stable security definer set search_path = public as $$
  select coalesce(h.parts,0), h.country, coalesce(h.findable,true), p.display_name
  from (select auth.uid() as uid) me
  left join public.darb_house h on h.user_id = me.uid
  left join public.darb_progress p on p.user_id = me.uid
  where me.uid is not null
$$;

create or replace function public.darb_set_country(p_country text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_country !~ '^[A-Z]{2}$' then raise exception 'bad country'; end if;
  insert into public.darb_house (user_id, country) values (auth.uid(), p_country)
  on conflict (user_id) do update set country = excluded.country;
end $$;

create or replace function public.darb_set_findable(p_on boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into public.darb_house (user_id, findable) values (auth.uid(), p_on)
  on conflict (user_id) do update set findable = excluded.findable;
end $$;

-- البلدان وعدد البيوت في كل حيّ
create or replace function public.darb_land_countries()
returns table(country text, houses int, built int)
language sql stable security definer set search_path = public as $$
  select h.country, count(*)::int, count(*) filter (where h.parts = 12)::int
  from public.darb_house h where h.country is not null
  group by h.country order by count(*) desc
$$;

-- بيوت حيّ واحد: الاسم والأجزاء فقط (بدون بريد ولا معرّف)
create or replace function public.darb_land(p_country text)
returns table(display_name text, parts int, is_me boolean)
language sql stable security definer set search_path = public as $$
  select coalesce(nullif(p.display_name,''),'لاعب'), h.parts, h.user_id = auth.uid()
  from public.darb_house h left join public.darb_progress p on p.user_id = h.user_id
  where h.country = p_country
  order by (h.user_id = auth.uid()) desc nulls last, h.parts desc, h.updated_at desc
  limit 200
$$;

-- البحث عن شخص تعرفه بالبريد الكامل (لا يرجع البريد، ولا يجد من أخفى نفسه)
create or replace function public.darb_find_house(p_email text)
returns table(display_name text, parts int, country text)
language sql stable security definer set search_path = public, auth as $$
  select coalesce(nullif(p.display_name,''),'لاعب'), coalesce(h.parts,0), h.country
  from auth.users u
  join public.darb_house h on h.user_id = u.id
  left join public.darb_progress p on p.user_id = u.id
  where auth.uid() is not null
    and lower(u.email) = lower(trim(p_email))
    and (h.findable or u.id = auth.uid())
  limit 1
$$;

revoke all on function public.darb_house_finish(), public.darb_my_house(), public.darb_set_country(text),
  public.darb_set_findable(boolean), public.darb_land_countries(), public.darb_land(text),
  public.darb_find_house(text), public.darb_house_sync(), public.darb_parts_from(int,jsonb) from public, anon;
grant execute on function public.darb_house_finish(), public.darb_my_house(), public.darb_set_country(text),
  public.darb_set_findable(boolean), public.darb_find_house(text) to authenticated;
grant execute on function public.darb_land_countries(), public.darb_land(text) to anon, authenticated;
