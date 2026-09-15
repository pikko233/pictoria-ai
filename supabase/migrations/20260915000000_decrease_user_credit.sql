/**
* 出图扣减额度。
*
* generated_images 每插入一行，就从该用户的 credits 里扣 1 次出图额度。
* 注意这是「记账」而非「限流」：AFTER INSERT 时图片记录已经落库，
* 额度不足的拦截仍需在生成之前由应用层完成。
*/

-- 每个用户只应有一行额度记录；同时为下面 update 的 where user_id 提供索引
create unique index if not exists credits_user_id_key on public.credits (user_id);

-- search_path 置空 + 全限定表名：SECURITY DEFINER 函数必须锁死解析路径，
-- 否则同名表可以劫持函数体内的操作
create or replace function public.decrease_user_credit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- 只扣还有余额的行：额度为 0 或 NULL 时条件不成立，
  -- 既避免扣成负数，也避免 NULL - 1 把额度变成 NULL
  update public.credits
  set image_generation_count = image_generation_count - 1
  where user_id = new.user_id
    and image_generation_count > 0;

  return new;
end;
$$;

-- credits 的写入权限只给 service_role，这里靠 SECURITY DEFINER 以创建者身份执行
drop trigger if exists decrease_credit on public.generated_images;

create trigger decrease_credit
after insert on public.generated_images
for each row
execute function public.decrease_user_credit();
