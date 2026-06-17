"use client";

import dynamic from "next/dynamic";
import { TEAMS, type Team } from "@/lib/teams";

const Wheel = dynamic(() => import("react-custom-roulette").then((mod) => mod.Wheel), {
  ssr: false,
  loading: () => <div className="flex aspect-square w-full items-center justify-center rounded-full border border-amber-300/40 text-amber-100">輪盤載入中</div>,
});

const colors = ["#f4be4a", "#0f8f65", "#c93232", "#123a67", "#f7d77a", "#0b6e4f"];

function escapeSvgText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function teamBadgeUri(team: Team) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="74" height="92" viewBox="0 0 74 92">
      <text x="37" y="36" text-anchor="middle" dominant-baseline="middle" font-size="30">${escapeSvgText(team.flag)}</text>
      <text x="37" y="72" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="900" fill="#071323">${team.code}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

type RouletteProps = {
  mustStartSpinning: boolean;
  prizeNumber: number;
  onStopSpinning: () => void;
};

export function WorldCupRoulette({ mustStartSpinning, prizeNumber, onStopSpinning }: RouletteProps) {
  return (
    <div className="worldcup-roulette gold-ring flex aspect-square w-full max-w-[88vw] items-center justify-center rounded-full bg-slate-950/70 p-2 sm:max-w-[420px] sm:p-4 md:w-[min(58vh,560px)] md:max-w-none">
      <Wheel
        mustStartSpinning={mustStartSpinning}
        prizeNumber={prizeNumber}
        data={TEAMS.map((team) => ({
          image: {
            uri: teamBadgeUri(team),
            sizeMultiplier: 0.24,
          },
        }))}
        backgroundColors={colors}
        textColors={["#071323"]}
        outerBorderColor="#f4be4a"
        outerBorderWidth={8}
        innerBorderColor="#071323"
        innerBorderWidth={8}
        radiusLineColor="#ffffff"
        radiusLineWidth={1}
        textDistance={70}
        spinDuration={0.85}
        onStopSpinning={onStopSpinning}
      />
    </div>
  );
}
