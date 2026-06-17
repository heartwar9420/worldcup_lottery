import { supabase, getOrCreateSpinSession, getPrizePool, parseTeamMapping } from '@/lib/db';
import { getRemainingColumn } from '@/lib/prize';
import { getSpinSessionId } from '@/lib/session';
import { findTeam, TEAMS } from '@/lib/teams';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const sessionId = await getSpinSessionId();

    // 1. 取得或建立 Session (改為非同步 await)
    const session = await getOrCreateSpinSession(sessionId);

    // 驗證抽獎資格
    if (session.has_won === 1) {
      return Response.json({ error: '已中獎，本次工作階段已結束。' }, { status: 403 });
    }
    if (session.spin_count >= 3) {
      return Response.json({ error: '抽獎次數已用完。' }, { status: 403 });
    }

    // 2. 取得獎池狀態 (改為非同步 await)
    const pool = await getPrizePool();
    if (pool.is_configured !== 1) {
      return Response.json({ error: '管理員尚未設定獎池。' }, { status: 400 });
    }

    // 3. 抽獎邏輯 (選出球隊與獎項)
    const index = Math.floor(Math.random() * TEAMS.length);
    const selected = TEAMS[index];
    const mapping = parseTeamMapping(pool).find((item) => item.teamCode === selected.code);

    const prizeTier = mapping?.prize ?? 'none';
    const remainingColumn = getRemainingColumn(prizeTier);
    const remaining = remainingColumn ? Number(pool[remainingColumn as keyof typeof pool]) : 0;
    const team = findTeam(selected.code) ?? selected;

    const now = new Date().toISOString();

    // 4. 根據中獎結果更新雲端資料庫
    if (remainingColumn && remaining > 0) {
      // 情境 A：中獎。
      // 先更新獎池，並利用 .gt() 確保剩餘數量 > 0 才允許更新，防止多人同時抽中同一個獎
      const { data: updatedPool, error: poolError } = await supabase
        .from('prize_pool')
        .update({
          [remainingColumn]: remaining - 1,
          updated_at: now,
        })
        .eq('id', 1)
        .gt(remainingColumn, 0)
        .select()
        .single();

      // 如果更新失敗 (可能剛好被別人抽走最後一個)，降級為未中獎
      if (poolError || !updatedPool) {
        await supabase
          .from('spin_sessions')
          .update({ spin_count: session.spin_count + 1, updated_at: now })
          .eq('session_id', sessionId);

        return Response.json(
          {
            result: 'no_win',
            teamCode: team.code,
            teamName: team.name,
            prizeTier: 'none',
            spinsUsed: session.spin_count + 1,
            spinsRemaining: Math.max(0, 3 - (session.spin_count + 1)),
          },
          { status: 200 },
        );
      }

      // 獎池扣除成功，更新使用者狀態為中獎
      await supabase
        .from('spin_sessions')
        .update({
          spin_count: session.spin_count + 1,
          has_won: 1,
          prize_tier: prizeTier,
          updated_at: now,
        })
        .eq('session_id', sessionId);

      return Response.json(
        {
          result: 'win',
          teamCode: team.code,
          teamName: team.name,
          prizeTier,
          spinsUsed: session.spin_count + 1,
          spinsRemaining: 0,
        },
        { status: 200 },
      );
    }

    // 情境 B：未中獎 (沒有對應獎項，或獎項已為 0)
    await supabase
      .from('spin_sessions')
      .update({
        spin_count: session.spin_count + 1,
        updated_at: now,
      })
      .eq('session_id', sessionId);

    const spinsUsed = session.spin_count + 1;
    return Response.json(
      {
        result: 'no_win',
        teamCode: team.code,
        teamName: team.name,
        prizeTier: 'none',
        spinsUsed,
        spinsRemaining: Math.max(0, 3 - spinsUsed),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Spin error:', error);
    return Response.json({ error: '系統發生錯誤，請稍後再試。' }, { status: 500 });
  }
}
