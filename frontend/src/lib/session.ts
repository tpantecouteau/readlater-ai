import {
  getAccessCookie,
  getRefreshCookie,
  setAuthCookiesResponse,
  clearAuthCookiesResponse,
} from "./cookies";

const FASTAPI = process.env.FASTAPI_BASE_URL!;

function decodeExp(token: string): number | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString(),
    );
    return typeof payload?.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export async function refreshAccessTokenIfNeeded(): Promise<string | null> {
  const access = await getAccessCookie();
  if (access) {
    const exp = decodeExp(access);
    if (exp) {
      const now = Math.floor(Date.now() / 1000);
      if (exp - now > 60) return access;
    }
  }

  const refresh = await getRefreshCookie();
  if (!refresh) return null;

  const res = await fetch(`${FASTAPI}/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refresh}` },
  });

  if (!res.ok) {
    clearAuthCookiesResponse();
    return null;
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
  };

  setAuthCookiesResponse({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  });
  return data.access_token;
}

export async function getAccessToken(): Promise<string | null> {
  const access = await getAccessCookie();
  const refresh = await getRefreshCookie();

  if (!access && !!refresh) return await refreshAccessTokenIfNeeded();
  if (!refresh || !access) return null;

  const exp = decodeExp(access);
  if (!exp) return access;

  const now = Math.floor(Date.now() / 1000);
  if (exp - now > 60) return access;

  return await refreshAccessTokenIfNeeded();
}
