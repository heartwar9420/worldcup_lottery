import { supabase, getPrizePool } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: '未登入。' }, { status: 401 });
  }

  try {
    // 1. 取得目前的總名額設定
    const pool = await getPrizePool();

    // 2. 將剩餘名額重設為總名額
    await supabase
      .from('prize_pool')
      .update({
        first_prize_remaining: pool.first_prize_total,
        second_prize_remaining: pool.second_prize_total,
        third_prize_remaining: pool.third_prize_total,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    // 3. 刪除所有抽獎紀錄 (在 Supabase 中刪除全部列必須給定一個成立條件)
    await supabase.from('spin_sessions').delete().neq('id', -1);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Reset error:', error);
    return Response.json({ error: '重設失敗，請稍後再試。' }, { status: 500 });
  }
}
