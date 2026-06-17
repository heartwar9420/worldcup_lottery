"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRIZE_LABELS, type TeamPrizeMapping } from "@/lib/prize";
import { TEAMS } from "@/lib/teams";

type AdminPool = {
  firstPrizeTotal: number;
  secondPrizeTotal: number;
  thirdPrizeTotal: number;
  firstPrizeRemaining: number;
  secondPrizeRemaining: number;
  thirdPrizeRemaining: number;
  isConfigured: boolean;
  mapping: TeamPrizeMapping[];
};

const emptyPool: AdminPool = {
  firstPrizeTotal: 0,
  secondPrizeTotal: 0,
  thirdPrizeTotal: 0,
  firstPrizeRemaining: 0,
  secondPrizeRemaining: 0,
  thirdPrizeRemaining: 0,
  isConfigured: false,
  mapping: [],
};

export function AdminPanel() {
  const router = useRouter();
  const [pool, setPool] = useState<AdminPool>(emptyPool);
  const [first, setFirst] = useState(0);
  const [second, setSecond] = useState(0);
  const [third, setThird] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/prize-pool", { cache: "no-store" });
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setPool(data);
    setFirst(data.firstPrizeTotal);
    setSecond(data.secondPrizeTotal);
    setThird(data.thirdPrizeTotal);
  }, [router]);

  useEffect(() => {
    // Initial API synchronization for this client-only admin surface.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => setError("後台資料讀取失敗。"));
  }, [load]);

  const total = first + second + third;
  const invalid = total > 48 || [first, second, third].some((value) => value < 0 || value > 10);

  const rows = useMemo(() => {
    const prizeByTeam = new Map(pool.mapping.map((item) => [item.teamCode, item.prize]));
    return TEAMS.map((team) => ({ ...team, prize: prizeByTeam.get(team.code) ?? "none" }));
  }, [pool.mapping]);

  async function save() {
    setError("");
    setMessage("");
    const res = await fetch("/api/admin/prize-pool", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstPrize: first, secondPrize: second, thirdPrize: third }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "儲存失敗。");
      return;
    }
    setMessage("已儲存獎池並產生隨機對應。");
    await load();
  }

  async function reset() {
    setError("");
    setMessage("");
    const res = await fetch("/api/admin/prize-pool/reset", { method: "POST" });
    if (!res.ok) {
      setError("重設失敗。");
      return;
    }
    setMessage("已重設剩餘名額並清空工作階段。");
    await load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="stadium-grid min-h-screen bg-[#071323] px-10 py-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <h1 className="text-4xl font-black text-white">🏆 抽獎系統後台</h1>
          <button onClick={logout} className="border border-amber-300/50 px-5 py-2 font-bold text-amber-100 hover:bg-amber-300 hover:text-slate-950">登出</button>
        </header>

        <section className="mt-8 border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-2xl font-black text-amber-200">獎池設定</h2>
          <div className="mt-5 grid grid-cols-3 gap-5">
            {[
              ["一等獎名額", first, setFirst],
              ["二等獎名額", second, setSecond],
              ["三等獎名額", third, setThird],
            ].map(([label, value, setter]) => (
              <label key={label as string} className="text-sm font-bold text-slate-200">
                {label as string}
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={value as number}
                  onChange={(event) => {
                    (setter as (value: number) => void)(Number(event.target.value));
                    setMessage("");
                  }}
                  className="mt-2 w-full border border-white/10 bg-slate-900 px-4 py-3 text-2xl font-black text-white outline-none focus:border-amber-300"
                />
              </label>
            ))}
          </div>
          {invalid ? (
            <p className="mt-4 text-red-200">單項名額最高為 10，且總名額不得超過 48</p>
          ) : null}
          <div className="mt-6 flex items-center gap-4">
            <button onClick={save} disabled={invalid} className="bg-amber-300 px-6 py-3 font-black text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed">儲存並產生隨機對應</button>
            <button onClick={reset} className="border border-emerald-300/60 px-6 py-3 font-black text-emerald-100 hover:bg-emerald-400 hover:text-slate-950">重設獎池</button>
            <span className={invalid ? "text-red-200" : "text-slate-300"}>目前總名額：{total} / 48</span>
          </div>
          {message && !invalid ? <p className="mt-4 text-emerald-200">{message}</p> : null}
          {error ? <p className="mt-4 text-red-200">{error}</p> : null}
        </section>

        <section className="mt-6 grid grid-cols-3 gap-5">
          {[
            ["一等獎", pool.firstPrizeTotal, pool.firstPrizeTotal - pool.firstPrizeRemaining, pool.firstPrizeRemaining],
            ["二等獎", pool.secondPrizeTotal, pool.secondPrizeTotal - pool.secondPrizeRemaining, pool.secondPrizeRemaining],
            ["三等獎", pool.thirdPrizeTotal, pool.thirdPrizeTotal - pool.thirdPrizeRemaining, pool.thirdPrizeRemaining],
          ].map(([label, totalCount, drawn, remaining]) => (
            <div key={label as string} className="border border-white/10 bg-slate-950/60 p-6">
              <h3 className="text-xl font-black text-white">{label as string}</h3>
              <p className="mt-4 text-lg text-slate-200">設定 {totalCount as number} / 已抽 {drawn as number} / 剩餘 <span className="font-black text-amber-200">{remaining as number}</span></p>
            </div>
          ))}
        </section>

        <section className="mt-6 border border-white/10 bg-slate-950/60 p-6">
          <button onClick={() => setExpanded((value) => !value)} className="flex w-full items-center justify-between text-left text-2xl font-black text-amber-200">
            球隊-獎項對應
            <span>{expanded ? "收合" : "展開"}</span>
          </button>
          {expanded ? (
            <div className="mt-5 grid max-h-[420px] grid-cols-4 gap-3 overflow-auto pr-2">
              {rows.map((row) => (
                <div key={row.code} className="flex items-center justify-between border border-white/10 bg-slate-900/80 px-3 py-2">
                  <span className="font-bold text-white">{row.flag} {row.code}</span>
                  <span className={row.prize === "none" ? "text-slate-400" : "text-amber-200"}>
                    {row.prize === "none" ? "謝謝參與" : PRIZE_LABELS[row.prize]}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
