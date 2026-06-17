import { getPrizePool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // 加上 await 等待 Supabase 回傳資料
    const pool = await getPrizePool();
    return Response.json({
      isConfigured: pool.is_configured === 1,
      firstPrizeRemaining: pool.first_prize_remaining,
      secondPrizeRemaining: pool.second_prize_remaining,
      thirdPrizeRemaining: pool.third_prize_remaining,
    });
  } catch (error) {
    console.error('Failed to fetch prize pool status:', error);
    return Response.json({ error: '無法取得獎池狀態，請稍後再試' }, { status: 500 });
  }
}
