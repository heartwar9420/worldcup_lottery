import { createClient } from '@supabase/supabase-js';
import type { PrizeTier, TeamPrizeMapping } from './prize';

// 初始化 Supabase 客戶端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PrizePoolRow = {
  id: number;
  first_prize_total: number;
  second_prize_total: number;
  third_prize_total: number;
  first_prize_remaining: number;
  second_prize_remaining: number;
  third_prize_remaining: number;
  team_mapping: TeamPrizeMapping[] | null; // Supabase 的 JSONB 會自動解析為陣列/物件
  is_configured: number;
  created_at: string;
  updated_at: string;
};

export type SpinSessionRow = {
  id: number;
  session_id: string;
  spin_count: number;
  has_won: number;
  prize_tier: PrizeTier | null;
};

// 為了避免其他檔案 import 報錯，保留這個函式但設為空，因為 Supabase 不需要本地初始化檔案
export function initializeDb() {
  console.log('Database is now connected to Supabase!');
}

// 取得獎池狀態 (改為非同步 async)
export async function getPrizePool(): Promise<PrizePoolRow> {
  const { data, error } = await supabase.from('prize_pool').select('*').eq('id', 1).single();

  if (error) throw error;
  return data as PrizePoolRow;
}

// 解析球隊對應 (因為 JSONB 特性，直接回傳即可)
export function parseTeamMapping(row: PrizePoolRow): TeamPrizeMapping[] {
  if (!row.team_mapping) return [];
  return row.team_mapping;
}

// 取得或建立使用者的抽獎 Session (改為非同步 async)
export async function getOrCreateSpinSession(sessionId: string): Promise<SpinSessionRow> {
  // 利用 Supabase 的 upsert (如果 session_id 不存在就新增，存在就忽略並回傳)
  const { data, error } = await supabase
    .from('spin_sessions')
    .upsert({ session_id: sessionId }, { onConflict: 'session_id', ignoreDuplicates: true })
    .select()
    .single();

  // 如果因為 ignoreDuplicates 沒有回傳 data，我們就直接 select 出來
  if (!data) {
    const { data: existingData, error: selectError } = await supabase
      .from('spin_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (selectError) throw selectError;
    return existingData as SpinSessionRow;
  }

  if (error) throw error;
  return data as SpinSessionRow;
}
