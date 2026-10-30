-- حذف الحساب من داخل اللعبة (شرط من Google Play للتطبيقات التي فيها حسابات).
-- يُشغَّل مرة واحدة في Supabase → SQL Editor. آمن لإعادة التشغيل.
create or replace function public.darb_delete_account()
returns void language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not signed in'; end if;
  delete from public.darb_house    where user_id = uid;
  delete from public.darb_progress where user_id = uid;
  delete from auth.users where id = uid;
end $$;
revoke all on function public.darb_delete_account() from public, anon;
grant execute on function public.darb_delete_account() to authenticated;
