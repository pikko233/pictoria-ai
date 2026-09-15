/**
* USERS
* 用户资料表。用户只能读写自己的数据，且只能改 full_name / avatar_url，
* billing_address 与 payment_method 由 Stripe webhook 以 service_role 写入。
*/
create table public.users (
  -- 对应 auth.users.id；删号时一并清理
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  -- 账单地址，JSON 格式
  billing_address jsonb,
  -- 支付方式
  payment_method jsonb
);
alter table public.users enable row level security;

create policy "Can view own user data." on public.users
  for select to authenticated using ((select auth.uid()) = id);

-- with check 必须有，否则用户可以把 id 改成别人的
create policy "Can update own user data." on public.users
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 列级权限：支付信息只允许 service_role 写
revoke update on public.users from anon, authenticated;
grant update (full_name, avatar_url) on public.users to authenticated;
revoke insert, delete on public.users from anon, authenticated;

/**
* 新用户注册时自动建立资料行。
* on conflict 兜底，避免 insert 失败导致整个注册事务回滚。
*/
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

/**
* CUSTOMERS
* user_id 到 Stripe customer id 的私有映射表，不对外暴露。
*/
create table public.customers (
  id uuid references auth.users on delete cascade not null primary key,
  -- Stripe 的 customer id，用户不可见也不可改
  stripe_customer_id text
);
alter table public.customers enable row level security;
-- 不建任何 policy：RLS 开启且无 policy 即拒绝一切非 service_role 访问

-- webhook 只带 cus_xxx，必须能反查 user_id —— 这是计费流程最高频的查询
create unique index customers_stripe_customer_id_idx
  on public.customers (stripe_customer_id);

/**
* PRODUCTS
* 在 Stripe 侧管理，通过 webhook 同步过来。
*/
create table public.products (
  -- Stripe product id，如 prod_1234
  id text primary key,
  active boolean,
  name text,
  description text,
  image text,
  metadata jsonb
);
alter table public.products enable row level security;
create policy "Allow public read-only access." on public.products
  for select to anon, authenticated using (true);
revoke insert, update, delete on public.products from anon, authenticated;

/**
* PRICES
*/
create type pricing_type as enum ('one_time', 'recurring');
create type pricing_plan_interval as enum ('day', 'week', 'month', 'year');

create table public.prices (
  -- Stripe price id，如 price_1234
  id text primary key,
  product_id text references public.products on delete cascade,
  active boolean,
  description text,
  -- 最小货币单位的整数，如 100 表示 US$1.00
  unit_amount bigint,
  -- 三位小写 ISO 货币代码
  currency text check (char_length(currency) = 3),
  type pricing_type,
  interval pricing_plan_interval,
  interval_count integer,
  trial_period_days integer,
  metadata jsonb
);
alter table public.prices enable row level security;
create policy "Allow public read-only access." on public.prices
  for select to anon, authenticated using (true);
revoke insert, update, delete on public.prices from anon, authenticated;

create index prices_product_id_idx on public.prices (product_id);

/**
* SUBSCRIPTIONS
* 在 Stripe 侧管理，通过 webhook 同步过来。
*/
create type subscription_status as enum (
  'trialing', 'active', 'canceled', 'incomplete',
  'incomplete_expired', 'past_due', 'unpaid'
);

create table public.subscriptions (
  -- Stripe subscription id，如 sub_1234
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  status subscription_status,
  metadata jsonb,
  price_id text references public.prices,
  quantity integer,
  cancel_at_period_end boolean,
  created timestamptz default now() not null,
  current_period_start timestamptz default now() not null,
  current_period_end timestamptz default now() not null,
  -- 以下字段「发生了才有值」，默认必须是 null，
  -- 否则每条活跃订阅看起来都已被取消
  ended_at timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  trial_start timestamptz,
  trial_end timestamptz
);
alter table public.subscriptions enable row level security;
create policy "Can only view own subs data." on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);
revoke insert, update, delete on public.subscriptions from anon, authenticated;

-- RLS 策略按 user_id 过滤，没有索引就是全表扫
create index subscriptions_user_id_idx on public.subscriptions (user_id);
create index subscriptions_price_id_idx on public.subscriptions (price_id);
-- 「该用户当前是否有有效订阅」是每次鉴权都要跑的查询
create index subscriptions_user_active_idx on public.subscriptions (user_id)
  where status in ('trialing', 'active');

/**
* 不要 drop publication supabase_realtime：
* 那会清空 Dashboard 里已勾选的所有 realtime 表。
* 价格数据是静态的，本来也不需要 realtime。
*/
