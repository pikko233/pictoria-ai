// webhook 是外部服务的无 cookie 回调，必须绕开 proxy 的登录重定向，
// 各 handler 自行用签名验证请求合法性
export const PUBLIC_ROUTES = [
  "/login",
  "/register-success",
  "/auth",
  "/api/webhooks",
];

export const GENDER_LABEL_MAP = {
  man: "男",
  woman: "女",
};
