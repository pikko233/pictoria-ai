/**
* 补齐表级权限。
*
* RLS policy 决定「能看到哪些行」，表级 GRANT 决定「能不能碰这张表」，
* 两者相互独立。上一份 migration 只写了 revoke，grant 那半边依赖
* Supabase 的默认权限，但本项目的 default privileges 未覆盖这些新建表，
* 导致所有角色（包括 bypass RLS 的 service_role）访问时报 42501。
*/

-- service_role 供 webhook 等无用户会话的服务端流程使用，自身已 bypass RLS
grant all on
  public.users,
  public.customers,
  public.products,
  public.prices,
  public.subscriptions
to service_role;

-- 以下只放开表级访问，实际可见的行仍由各表的 RLS policy 约束

-- 价格与产品对所有访客只读
grant select on public.products, public.prices to anon, authenticated;

-- 用户只能读到自己的资料与订阅（由 policy 限定）
grant select on public.users, public.subscriptions to authenticated;

-- 资料仅允许改这两列，支付信息只能由 service_role 写入
grant update (full_name, avatar_url) on public.users to authenticated;

-- customers 是 user_id ↔ stripe_customer_id 的私有映射表，
-- 不给 anon / authenticated 任何权限
