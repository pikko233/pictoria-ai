import type { Json, Tables } from "@database.types";

type Price = Tables<"prices">;

// Stripe 的 metadata 可能整体为 null，值也一律是字符串，
// 存进数据库后类型是 Json，因此取数字前必须先收窄再转换。
export const readMetadataCount = (
  metadata: Json | null | undefined,
  key: string,
): number => {
  if (
    typeof metadata !== "object" ||
    metadata === null ||
    Array.isArray(metadata)
  )
    return 0;

  const count = Number(metadata[key]);
  return Number.isFinite(count) ? count : 0;
};

export const getURL = (path: string = "") => {
  // 本站对外地址：开发时填 ngrok 域名，线上填正式域名。
  // Stripe 付款后跳回来的地址由它生成，必须和用户当前访问的域名一致，
  // 否则跨域名跳转会带不上 session cookie，付完款反而被踢回登录页。
  let url = process.env.NEXT_PUBLIC_SITE_URL;

  if (!url || url.trim() === "") {
    url = "http://localhost:3000";
  }

  // 去掉结尾斜杠，补全协议（有些平台注入的域名不带 https://）
  url = url.trim().replace(/\/+$/, "");
  url = url.includes("http") ? url : `https://${url}`;
  // 去掉开头斜杠，避免拼出双斜杠
  path = path.replace(/^\/+/, "");

  return path ? `${url}/${path}` : url;
};

export const postData = async ({
  url,
  data,
}: {
  url: string;
  data?: { price: Price };
}) => {
  const res = await fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify(data),
  });

  return res.json();
};

export const toDateTime = (secs: number) => {
  const t = new Date(+0); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};

export const calculateTrialEndUnixTimestamp = (
  trialPeriodDays: number | null | undefined,
) => {
  // Check if trialPeriodDays is null, undefined, or less than 2 days
  if (
    trialPeriodDays === null ||
    trialPeriodDays === undefined ||
    trialPeriodDays < 2
  ) {
    return undefined;
  }

  const currentDate = new Date(); // Current date and time
  const trialEnd = new Date(
    currentDate.getTime() + (trialPeriodDays + 1) * 24 * 60 * 60 * 1000,
  ); // Add trial days
  return Math.floor(trialEnd.getTime() / 1000); // Convert to Unix timestamp in seconds
};

const toastKeyMap: { [key: string]: string[] } = {
  status: ["status", "status_description"],
  error: ["error", "error_description"],
};

const getToastRedirect = (
  path: string,
  toastType: string,
  toastName: string,
  toastDescription: string = "",
  disableButton: boolean = false,
  arbitraryParams: string = "",
): string => {
  const [nameKey, descriptionKey] = toastKeyMap[toastType];

  let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastName)}`;

  if (toastDescription) {
    redirectPath += `&${descriptionKey}=${encodeURIComponent(toastDescription)}`;
  }

  if (disableButton) {
    redirectPath += `&disable_button=true`;
  }

  if (arbitraryParams) {
    redirectPath += `&${arbitraryParams}`;
  }

  return redirectPath;
};

export const getStatusRedirect = (
  path: string,
  statusName: string,
  statusDescription: string = "",
  disableButton: boolean = false,
  arbitraryParams: string = "",
) =>
  getToastRedirect(
    path,
    "status",
    statusName,
    statusDescription,
    disableButton,
    arbitraryParams,
  );

export const getErrorRedirect = (
  path: string,
  errorName: string,
  errorDescription: string = "",
  disableButton: boolean = false,
  arbitraryParams: string = "",
) =>
  getToastRedirect(
    path,
    "error",
    errorName,
    errorDescription,
    disableButton,
    arbitraryParams,
  );
