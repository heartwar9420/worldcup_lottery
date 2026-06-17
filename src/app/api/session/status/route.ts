import { getOrCreateSpinSession } from '@/lib/db';
import { getSpinSessionId } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const sessionId = await getSpinSessionId();
    // 加上 await 等待 Supabase 回傳 Session
    const session = await getOrCreateSpinSession(sessionId);

    return Response.json({
      spinsUsed: session.spin_count,
      spinsRemaining: Math.max(0, 3 - session.spin_count),
      hasWon: session.has_won === 1,
      prizeTier: session.prize_tier,
    });
  } catch (error) {
    console.error('Failed to fetch session status:', error);
    return Response.json({ error: '無法取得使用者抽獎狀態' }, { status: 500 });
  }
}
