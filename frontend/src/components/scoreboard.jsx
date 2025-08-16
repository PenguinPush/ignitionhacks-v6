"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize, Minimize, Trophy, RefreshCcw, Minus, Plus, Settings2 } from "lucide-react";

/**
 * Flip Scoreboard – 6 digits (3 per side), tabletop style
 *
 * Features
 * - Home/Away names
 * - Sport presets (Basketball, Volleyball, Tennis, Football, Custom)
 * - 6 digits total (Home 3 + Away 3) with flip-card animation per digit
 * - Quick-add controls adapt to sport preset
 * - Increment/Decrement, Reset
 * - Period/Set tracker that adapts to sport
 * - Fullscreen mode
 * - Big, high-contrast flipper plates inspired by physical IVONNEY tabletop score flippers
 *
 * Styling: TailwindCSS. No external UI kit required.
 */

// Helpers
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const toDigits = (value, places) =>
  value
    .toString()
    .padStart(places, "0")
    .slice(-places)
    .split("")
    .map((d) => parseInt(d, 10));

// Flip Digit component
function DigitFlip({ value, size = "md", color = "red" }) {
  const [display, setDisplay] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value === display) return;
    setFlipping(true);
    const t = setTimeout(() => {
      setDisplay(value);
      setFlipping(false);
    }, 260);
    return () => clearTimeout(t);
  }, [value, display]);

  const sizeCls =
    size === "lg"
      ? "w-20 h-28 text-6xl"
      : size === "sm"
      ? "w-10 h-14 text-3xl"
      : "w-16 h-24 text-5xl";
  const colorCls =
    color === "blue"
      ? "bg-blue-600"
      : color === "slate"
      ? "bg-slate-800"
      : color === "emerald"
      ? "bg-emerald-600"
      : "bg-red-600";

  return (
    <div className={`relative perspective ${sizeCls}`}>
      {/* front */}
      <div
        className={`absolute inset-0 rounded-xl ${colorCls} text-white font-extrabold font-mono grid place-items-center backface-hidden transform transition-transform duration-200 ${
          flipping ? "rotateX-180" : ""
        }`}
      >
        {display}
      </div>
      {/* back (next) */}
      <div className={`absolute inset-0 rounded-xl ${colorCls} text-white font-extrabold font-mono grid place-items-center rotateX-180 backface-hidden`}>
        {value}
      </div>
    </div>
  );
}

// Score block (3 digits)
function ScoreBlock({ score, color, large = false }) {
  const digits = toDigits(clamp(score, 0, 999), 3);
  return (
    <div className={`flex items-center gap-1 md:gap-2 ${large ? "scale-110 md:scale-125" : ""}`}>
      {digits.map((d, i) => (
        <DigitFlip key={i} value={d} size={large ? "lg" : "md"} color={color} />
      ))}
    </div>
  );
}

// Sport presets
const SPORT_PRESETS = {
  Basketball: {
    quickAdds: [1, 2, 3],
    quickSubs: [1],
    periodsLabel: "Quarter",
    maxPeriods: 4,
  },
  Volleyball: {
    quickAdds: [1],
    quickSubs: [1],
    periodsLabel: "Set",
    maxPeriods: 5,
  },
  Tennis: {
    quickAdds: [1], // Use as game increments (simple mode)
    quickSubs: [1],
    periodsLabel: "Set",
    maxPeriods: 5,
  },
  Football: {
    quickAdds: [1, 2, 3, 6],
    quickSubs: [1],
    periodsLabel: "Quarter",
    maxPeriods: 4,
  },
  Custom: {
    quickAdds: [1, 2, 5, 10],
    quickSubs: [1, 2, 5],
    periodsLabel: "Period",
    maxPeriods: 9,
  },
};

export default function FlipScoreboard6() {
  const [home, setHome] = useState("HOME");
  const [away, setAway] = useState("AWAY");
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [sport, setSport] = useState("Basketball");
  const preset = SPORT_PRESETS[sport];

  const [period, setPeriod] = useState(1);

  // Fullscreen
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  const resetAll = () => {
    setHomeScore(0);
    setAwayScore(0);
    setPeriod(1);
  };

  const addHome = (n) => setHomeScore((s) => clamp(s + n, 0, 999));
  const addAway = (n) => setAwayScore((s) => clamp(s + n, 0, 999));

  const layoutScale = isFullscreen ? "scale-[1.15] md:scale-[1.25]" : "";

  const quickAddBtns = useMemo(() => preset.quickAdds, [preset]);
  const quickSubBtns = useMemo(() => preset.quickSubs, [preset]);

  return (
    <div
      ref={containerRef}
      className={`relative ${
        isFullscreen ? "fixed inset-0 z-50 bg-black" : "max-w-6xl mx-auto"
      } p-4 md:p-6 lg:p-8 transition-all duration-300`}
    >
      <div className={`bg-neutral-900/90 border border-neutral-700 rounded-3xl shadow-2xl text-white p-4 md:p-6 ${layoutScale}`}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
            <h2 className="text-lg md:text-2xl font-bold tracking-tight">Flip Scoreboard</h2>
            <span className="text-xs md:text-sm text-neutral-300/70">6 digits • tabletop style</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm md:text-base"
              title="Reset Scores & Period"
            >
              <RefreshCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Team Inputs */}
          <div className="flex flex-col gap-3">
            <label className="text-xs uppercase tracking-wider text-neutral-400">Home Name</label>
            <input
              value={home}
              onChange={(e) => setHome(e.target.value.toUpperCase())}
              className="px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              maxLength={10}
            />
            <label className="text-xs uppercase tracking-wider text-neutral-400 mt-2">Away Name</label>
            <input
              value={away}
              onChange={(e) => setAway(e.target.value.toUpperCase())}
              className="px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              maxLength={10}
            />
          </div>

          {/* Sport Preset */}
          <div className="flex flex-col gap-3">
            <label className="text-xs uppercase tracking-wider text-neutral-400">Sport Preset</label>
            <div className="relative">
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full appearance-none px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              >
                {Object.keys(SPORT_PRESETS).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <Settings2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-neutral-300">
                <span className="opacity-70">{preset.periodsLabel}:</span> <span className="font-semibold">{period}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPeriod((p) => clamp(p - 1, 1, preset.maxPeriods))}
                  className="px-2 py-1 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700"
                  title={`Prev ${preset.periodsLabel}`}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPeriod((p) => clamp(p + 1, 1, preset.maxPeriods))}
                  className="px-2 py-1 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700"
                  title={`Next ${preset.periodsLabel}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Add/Sub */}
          <div className="flex flex-col gap-3">
            <label className="text-xs uppercase tracking-wider text-neutral-400">Quick Add/Subtract</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickAddBtns.map((n) => (
                <button
                  key={`add-${n}`}
                  onClick={() => addHome(n)}
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 font-semibold"
                  title={`Home +${n}`}
                >
                  HOME +{n}
                </button>
              ))}
              {quickSubBtns.map((n) => (
                <button
                  key={`sub-${n}`}
                  onClick={() => addHome(-n)}
                  className="px-3 py-2 rounded-xl bg-red-900/60 hover:bg-red-900 font-semibold border border-red-800"
                  title={`Home -${n}`}
                >
                  HOME -{n}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickAddBtns.map((n) => (
                <button
                  key={`addA-${n}`}
                  onClick={() => addAway(n)}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold"
                  title={`Away +${n}`}
                >
                  AWAY +{n}
                </button>
              ))}
              {quickSubBtns.map((n) => (
                <button
                  key={`subA-${n}`}
                  onClick={() => addAway(-n)}
                  className="px-3 py-2 rounded-xl bg-blue-900/60 hover:bg-blue-900 font-semibold border border-blue-800"
                  title={`Away -${n}`}
                >
                  AWAY -{n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scoreboard Plate */}
        <div className="bg-neutral-950 rounded-3xl border border-neutral-800 p-4 md:p-6 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
            {/* Home */}
            <div className="flex flex-col items-center gap-3">
              <div className="text-neutral-300 tracking-wider text-sm md:text-base">{home}</div>
              <ScoreBlock score={homeScore} color="red" large />
              <div className="flex items-center gap-2 mt-1">
                <button onClick={() => addHome(-1)} className="p-2 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700" title="Home -1">
                  <Minus className="w-4 h-4" />
                </button>
                <button onClick={() => addHome(1)} className="p-2 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700" title="Home +1">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center divider */}
            <div className="hidden md:flex flex-col items-center gap-2 px-4">
              <div className="text-xs uppercase tracking-widest text-neutral-400">{preset.periodsLabel}</div>
              <div className="text-4xl font-black text-neutral-200">{period}</div>
              <div className="h-10 w-px bg-neutral-700" />
              <div className="text-[10px] tracking-widest text-neutral-500">SCORE</div>
            </div>

            {/* Away */}
            <div className="flex flex-col items-center gap-3">
              <div className="text-neutral-300 tracking-wider text-sm md:text-base">{away}</div>
              <ScoreBlock score={awayScore} color="blue" large />
              <div className="flex items-center gap-2 mt-1">
                <button onClick={() => addAway(-1)} className="p-2 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700" title="Away -1">
                  <Minus className="w-4 h-4" />
                </button>
                <button onClick={() => addAway(1)} className="p-2 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700" title="Away +1">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: small help */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-400">
          <span>Max score 999 per side</span>
          <span>•</span>
          <span>Flip animation ~0.26s</span>
          <span>•</span>
          <span>Optimized for tablet/desktop display</span>
        </div>
      </div>

      {/* Local styles for flip */}
      <style jsx>{`
        .perspective { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
        .rotateX-180 { transform: rotateX(180deg); }
      `}</style>
    </div>
  );
}