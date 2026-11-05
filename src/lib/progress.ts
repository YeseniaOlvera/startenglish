import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CompanionId } from "./content";

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const id = await uid();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const progressQuery = queryOptions({
  queryKey: ["progress"],
  queryFn: async () => {
    const [m, w, a] = await Promise.all([
      supabase.from("mission_progress").select("*"),
      supabase.from("learned_words").select("*"),
      supabase.from("activity_log").select("day").order("day", { ascending: false }).limit(60),
    ]);
    if (m.error) throw m.error;
    if (w.error) throw w.error;
    if (a.error) throw a.error;
    return { missions: m.data, words: w.data, streak: computeStreak(a.data.map((d) => d.day)) };
  },
});

export type MissionRow = { mission_id: string; status: string; score: number };

export function findCompletedMission<T extends { mission_id: string; status: string }>(
  missions: T[],
  missionId: string,
): T | undefined {
  return missions.find((m) => m.mission_id === missionId && m.status === "completed");
}

export function computeStreak(days: string[], today = new Date()) {  const set = new Set(days);
  const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const key = () => d.toISOString().slice(0, 10);
  if (!set.has(key())) d.setUTCDate(d.getUTCDate() - 1); // streak still alive if practiced yesterday
  let n = 0;
  while (set.has(key())) {
    n++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}

export async function updateProfile(patch: { companion?: CompanionId; onboarded?: boolean; display_name?: string }) {
  const id = await uid();
  const { error } = await supabase.from("profiles").update(patch).eq("id", id);
  if (error) throw error;
}

export async function markWordsSeen(wordIds: string[]) {
  const id = await uid();
  const { error } = await supabase
    .from("learned_words")
    .upsert(wordIds.map((w) => ({ user_id: id, word_id: w, last_seen: new Date().toISOString() })), {
      onConflict: "user_id,word_id",
    });
  if (error) throw error;
}

export async function completeMission(missionId: string, score: number, wordIds: string[]) {
  const id = await uid();
  const r = await supabase
    .from("mission_progress")
    .upsert({ user_id: id, mission_id: missionId, score, status: "completed", completed_at: new Date().toISOString() });
  if (r.error) throw r.error;
  await markWordsSeen(wordIds);
  await supabase.from("activity_log").upsert({ user_id: id }, { onConflict: "user_id,day", ignoreDuplicates: true });
}
