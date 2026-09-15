/**
* credits 表的表级权限与 RLS。
*
* 该表建表时未随 stripe_billing migration 一起授权，导致订阅 webhook
* 调用 updateUserCredits 时报 42501 permission denied，额度发放整条链路
* 静默失败（service_role 虽然 bypass RLS，但表级 GRANT 依然必需）。
*/

-- webhook 以 service_role 身份发放额度，需要读写权限
grant all on public.credits to service_role;

-- 用户只能读自己的额度，写入一律经由 service_role
grant select on public.credits to authenticated;
revoke insert, update, delete on public.credits from anon, authenticated;

alter table public.credits enable row level security;

drop policy if exists "Can only view own credits." on public.credits;
create policy "Can only view own credits." on public.credits
  for select using (auth.uid() = user_id);
