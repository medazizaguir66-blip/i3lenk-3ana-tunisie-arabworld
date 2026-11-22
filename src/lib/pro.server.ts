// Server-only helpers. Import dynamically inside server-function handlers.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { FREE_DAILY_LIMIT } from "./codes";

export { supabaseAdmin };

export async function getProUntil(deviceId: string): Promise<string | null> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("activation_codes")
    .select("expires_at")
    .eq("device_id", deviceId)
    .eq("revoked", false)
    .gt("expires_at", nowIso)
    .order("expires_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  return data?.[0]?.expires_at ?? null;
}

export function tunisDay(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Tunis" }).format(new Date());
}

export async function getRemainingTries(deviceId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("daily_usage")
    .select("count")
    .eq("device_id", deviceId)
    .eq("day", tunisDay())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Math.max(0, FREE_DAILY_LIMIT - (data?.count ?? 0));
}
