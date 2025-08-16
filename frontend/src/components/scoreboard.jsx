"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize, Minimize, Trophy, RefreshCcw, Minus, Plus, Settings2 } from "lucide-react";

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
    quickAdds: [1],
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
      {/* ... keep the same JSX from your version above (omitted here for brevity) ... */}

      {/* Local styles for flip */}
      <style>{`
        .perspective { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
        .rotateX-180 { transform: rotateX(180deg); }
      `}</style>
    </div>
  );
}
