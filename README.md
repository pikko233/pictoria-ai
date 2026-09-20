<h1 align="center">
  <img src="public/logo.svg" alt="Pictoria AI Logo" width="48" />
  <br />
  Pictoria AI
</h1>

<p align="center">
  基于 Flux 模型的 AI 写真生成平台，上传本人照片训练专属 LoRA 模型，用提示词生成任意场景下的个人写真。
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?logo=next.js" alt="Next.js 16.3" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react" alt="React 19.2" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Replicate-Flux-EA2805" alt="Replicate Flux" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white" alt="Stripe" />
</p>

## 功能

- **账号体系** —— 邮箱注册/登录、邮件验证、密码重置，基于 Supabase Auth
- **模型训练** —— 上传照片压缩包，调用 Replicate 的 `ostris/flux-dev-lora-trainer` 训练个人 LoRA 模型，训练进度通过 webhook 异步回写
- **图片生成** —— 支持 `flux-dev` / `flux-schnell` 官方模型及用户自训练模型，可调节尺寸、步数、引导系数等参数
- **作品管理** —— 生成结果自动存入 Supabase Storage，画廊浏览、查看详情、下载、删除
- **订阅计费** —— Stripe 订阅制，产品/价格/订阅状态通过 webhook 与数据库同步
- **额度控制** —— 训练次数与生成次数分别计量，扣减采用乐观锁避免并发超扣
- **账户设置** —— 修改资料、重置密码、查看订阅与用量

## 技术栈

| 分类 | 选型 |
|---|---|
| 框架 | Next.js 16（App Router、Turbopack、Server Actions） |
| 语言 | TypeScript 5、React 19 |
| 样式 | Tailwind CSS 4、shadcn/ui、Base UI |
| 后端 | Supabase（Postgres + Auth + Storage） |
| AI | Replicate（Flux 系列模型） |
| 支付 | Stripe |
| 邮件 | Resend |
| 状态/表单 | Zustand、React Hook Form + Zod |

## 快速开始

### 前置要求

- Node.js 20+
- Supabase 项目（[创建](https://supabase.com/dashboard)）
- Replicate 账号并开通计费（训练需付费 GPU）
- Stripe 账号（测试模式即可）
- Resend 账号（发送验证邮件）

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制模板并填入你自己的凭据：

```bash
cp .env.example .env.local
```

| 变量 | 说明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL。**构建时必需**，`next.config.ts` 用它配置图片域名白名单，缺失会直接导致构建失败 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase 可公开密钥（浏览器端使用） |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥，绕过 RLS，**仅服务端使用，切勿泄露** |
| `REPLICATE_API_TOKEN` | Replicate API Token |
| `REPLICATE_WEBHOOK_SECRET` | Replicate 账号级 webhook 签名密钥，见 [账号设置](https://replicate.com/account/webhook) |
| `MODEL_OWNER` | Replicate 用户名，训练产物会创建在该账号下 |
| `NEXT_PUBLIC_SITE_URL` | 本站对外地址。Stripe 回跳与 Replicate 回调都基于它拼接，本地开发填 ngrok 域名，线上填正式域名 |
| `RESEND_API_KEY` | Resend API Key |
| `RESEND_FROM_EMAIL` | 发件人地址，需为 Resend 已验证域名 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 可发布密钥（测试模式 `pk_test_`） |
| `STRIPE_SECRET_KEY` | Stripe 私钥（测试模式 `sk_test_`） |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook 签名密钥 |

生产环境若要切换到 Stripe 正式模式，**不要覆盖上面的测试密钥**，而是额外添加 `STRIPE_SECRET_KEY_LIVE` 和 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE`。代码会优先读取 `_LIVE` 变量，读不到才回落到测试密钥（见 `src/lib/stripe/config.ts`、`src/lib/stripe/client.ts`）。

### 3. 初始化数据库

计费相关的表由 migration 管理：

```bash
npx supabase link --project-ref <你的项目 ref>
npx supabase db push
```

这会创建 `users`、`customers`、`products`、`prices`、`subscriptions` 五张表及相关权限。

业务表（`models`、`generated_images`、`credits`）及其枚举类型、RLS 策略尚未纳入 migration，SQL 保存在 [`supabase-queries.md`](./supabase-queries.md)，需要手动在 Supabase SQL Editor 中执行。该文件同时记录了若干历史库的修补语句，新建库可跳过。

### 4. 创建 Storage Bucket

在 Supabase Storage 中创建两个 bucket，均设为私有（代码通过签名 URL 访问）：

- `training_data` —— 训练用的照片压缩包
- `generated_images` —— 生成的图片

### 5. 配置 Webhook

本地开发需要公网地址才能接收回调，推荐 ngrok：

```bash
ngrok http 3000
```

拿到域名后填入 `NEXT_PUBLIC_SITE_URL`。`next.config.ts` 已放行 `*.ngrok-free.dev` 等域名的跨源请求，否则 dev server 会拦截 `/_next` 资源导致页面白屏。

- **Replicate**：训练回调地址由 `getURL()` 动态拼接，无需在 Replicate 后台配置，改 `NEXT_PUBLIC_SITE_URL` 即可生效
- **Stripe**：在 Dashboard 添加端点 `<你的域名>/api/webhooks/stripe`，订阅 `product.created/updated/deleted`、`price.created/updated/deleted`、`checkout.session.completed`、`customer.subscription.created/updated/deleted`、`invoice.payment_succeeded` 事件（完整列表见 `src/app/api/webhooks/stripe/route.ts`），把端点的 signing secret 填入 `STRIPE_WEBHOOK_SECRET`

### 6. 启动

```bash
npm run dev
```

打开 http://localhost:3000。

## 可用脚本

```bash
npm run dev     # 启动开发服务器（Turbopack）
npm run build   # 生产构建
npm run start   # 运行构建产物
npm run lint    # ESLint 检查
```

## 项目结构

```
src/
├── app/
│   ├── (dashboard)/           # 登录后的主应用，共享侧边栏布局
│   │   ├── dashboard/         # 概览
│   │   ├── image-generation/  # 图片生成
│   │   ├── model-training/    # 模型训练
│   │   ├── models/            # 我的模型
│   │   ├── gallery/           # 作品画廊
│   │   ├── billing/           # 订阅与计费
│   │   └── settings/          # 账户设置
│   ├── actions/               # Server Actions（认证、图片、模型、额度、文件）
│   ├── api/
│   │   ├── train/             # 发起训练
│   │   └── webhooks/          # Stripe 与 Replicate 回调
│   ├── auth/confirm/          # 邮件验证回调
│   ├── login/                 # 登录/注册
│   └── page.tsx               # 落地页
├── components/                # 按业务域划分，ui/ 为 shadcn 组件
├── lib/
│   ├── supabase/              # 客户端、服务端、管理端、会话刷新
│   ├── stripe/                # Stripe 客户端与配置
│   ├── schemas.ts             # 前后端共享的 Zod 校验规则
│   └── helpers.ts             # getURL 等工具
├── stores/                    # Zustand 状态
├── constants.ts               # 公开路由、状态映射等常量
└── proxy.ts                   # 中间件（Next.js 16 中 middleware 已更名为 proxy）
supabase/migrations/           # 计费相关表的 migration
```

### 数据表

| 表 | 用途 |
|---|---|
| `users` | 用户资料，与 `auth.users` 一一对应 |
| `credits` | 额度，分别记录训练与生成的已用/上限次数 |
| `models` | 用户训练的 LoRA 模型及训练状态 |
| `generated_images` | 生成记录与图片存储路径 |
| `customers` | 用户与 Stripe customer 的映射 |
| `products` / `prices` | 由 Stripe webhook 同步 |
| `subscriptions` | 订阅状态，由 Stripe webhook 同步 |

## 部署到 Vercel

1. 导入 GitHub 仓库
2. 在 **Settings → Environments → Production** 中配置上表所有环境变量。可直接把 `.env` 文件内容粘贴进 Key 输入框批量导入
3. 把 `NEXT_PUBLIC_SITE_URL` 改为正式域名，不要沿用本地的 ngrok 地址
4. 在 Stripe Dashboard 将 webhook 端点指向正式域名，并更新 `STRIPE_WEBHOOK_SECRET`

几个容易踩的点：

- **环境变量缺失会导致构建失败而非运行时报错。** `next.config.ts` 在构建最开始就要读取 `NEXT_PUBLIC_SUPABASE_URL` 来配置图片域名白名单，缺失时会抛出明确的中文错误
- **Preview 部署读的是 Preview 环境的变量**，只配了 Production 的话，Preview 部署仍会失败。若只需正式环境可用，确认部署带有 `Production` 标签
- **Stripe 测试模式与正式模式的数据完全独立。** 切到正式模式后，`products` / `prices` 表中原有的测试数据全部失效，需要用正式模式的 webhook 重新同步
- `.env*` 已被 `.gitignore` 忽略，**不要强制提交任何 env 文件** —— service role key 与 Stripe 私钥一旦进入 git 历史就无法真正删除，只能轮换全部密钥

## 开发约定

- 本项目使用 Next.js 16，API 与文件约定与旧版本存在破坏性差异。修改前请先查阅 `node_modules/next/dist/docs/` 中的对应文档
- 表单校验规则统一放在 `src/lib/schemas.ts`，客户端与 Server Action 共用同一份 schema
- 涉及额度扣减的操作必须走乐观锁（参考 `src/app/api/train/route.ts` 的 `debitTrainingCredit`），避免并发请求超扣
- 数据库类型由 Supabase 生成，schema 变更后需重新生成 `database.types.ts`
