-- حذف الحساب من داخل اللعبة (شرط من Google Play للتطبيقات التي فيها حسابات).
-- الحسابات مشتركة مع تطبيق آخر في نفس المشروع (جدول profiles وما يرتبط به)،
-- لذلك: بيانات اللعبة تُحذف دائمًا، والحساب نفسه يُحذف فقط إذا لم يكن له أي بيانات في ذلك التطبيق.
-- يُرجع 'full' إذا حُذف الحساب كاملًا، و'game_only' إذا حُذفت بيانات اللعبة وبقي الحساب.
-- يُشغَّل في Supabase → SQL Editor. آمن لإعادة التشغيل.
drop function if exists public.darb_delete_account();
create function public.darb_delete_account()
returns text language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid(); r record; used boolean := false;
begin
  if uid is null then raise exception 'not signed in'; end if;
  delete from public.darb_house    where user_id = uid;
  delete from public.darb_progress where user_id = uid;
  -- هل يستخدم هذا الحساب التطبيق الآخر؟ أي صف في جدول يشير إلى profiles لهذا المستخدم
  if to_regclass('public.profiles') is not null then
    for r in
      select c.conrelid::regclass as t, a.attname as col
      from pg_constraint c
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
      where c.contype = 'f' and c.confrelid = 'public.profiles'::regclass
    loop
      execute format('select exists(select 1 from %s where %I = $1)', r.t, r.col) into used using uid;
      exit when used;
    end loop;
  end if;
  if used then return 'game_only'; end if;
  delete from auth.users where id = uid;
  return 'full';
end $$;
revoke all on function public.darb_delete_account() from public, anon;
grant execute on function public.darb_delete_account() to authenticated;
