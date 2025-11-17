import { clearAuthCookiesResponse } from "@/lib/cookies";

export async function POST() {
  return clearAuthCookiesResponse();
}
