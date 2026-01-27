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
    return typeof payload?.exp === "number" ? payload.exp : null; // exp en secondes (Unix)
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
      if (exp - now > 60) return access; // encore > 60s, ok
    }
  }
  // tenter refresh si refresh cookie dispo
  const refresh = await getRefreshCookie();
  if (!refresh) return null;
  console.log("we are going to refresh");
  console.log(refresh);
  // Appel FastAPI /auth/refresh (adapte l'URL à ton backend)
  const res = await fetch(`${FASTAPI}/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refresh}` },
  });
  console.log(res);
  if (!res.ok) {
    clearAuthCookiesResponse();
    return null;
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
  };
  // certains back renvoient un new refresh_token, d'autres non
  setAuthCookiesResponse({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  });
  return data.access_token;
}

/** Obtenir un access token prêt à l'emploi (refresh automatique si nécessaire) */
export async function getAccessToken(): Promise<string | null> {
  const access = await getAccessCookie();
  const refresh = await getRefreshCookie();
  if (!access && !!refresh) return await refreshAccessTokenIfNeeded();
  if (!refresh) return null;
  if (!access) return null;
  // vérifier si proche d'expiration
  const exp = decodeExp(access);
  if (!exp) return access;
  const now = Math.floor(Date.now() / 1000);
  if (exp - now > 60) return access;
  return await refreshAccessTokenIfNeeded();
}
