"use client";

import { useState, useRef } from "react";
import { Trophy, Maximize, Minimize } from "lucide-react";

export default function BadmintonScoreboard() {
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [flipP1, setFlipP1] = useState(false);
  const [flipP2, setFlipP2] = useState(false);

  const addPointP1 = () => {
    setFlipP1(true);
    setTimeout(() => {
      setPlayer1Score(player1Score + 1);
      setFlipP1(false);
    }, 300);
  };

  const addPointP2 = () => {
    setFlipP2(true);
    setTimeout(() => {
      setPlayer2Score(player2Score + 1);
      setFlipP2(false);
    }, 300);
  };

  const scoreboardRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goFullscreen = () => {
    if (!document.fullscreenElement && scoreboardRef.current) {
      scoreboardRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else if (document.fullscreenElement) {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  return (
    <div ref={scoreboardRef} className="max-w-4xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-lg">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold tracking-tight">Badminton Scoreboard</h2>
      </div>
      <button
          onClick={goFullscreen}
          className="p-2 bg-primary/20 rounded-full hover:bg-primary/40 transition-colors"
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5 text-primary" />
          ) : (
            <Maximize className="w-5 h-5 text-primary" />
          )}
        </button>
      <div className="grid grid-cols-2 gap-4 mb-8">
        
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-medium">Player 1</span>
          <div
            className={`relative w-24 h-24 perspective`}
          >
            <div
              className={`absolute w-full h-full rounded-lg bg-red-600 text-white font-bold text-4xl flex items-center justify-center backface-hidden transform transition-transform duration-300 ${
                flipP1 ? "rotateX-180" : ""
              }`}
            >
              {player1Score}
            </div>
            <div className="absolute w-full h-full rounded-lg bg-red-500 text-white font-bold text-4xl flex items-center justify-center rotateX-180 backface-hidden">
              {player1Score + 1}
            </div>
          </div>
          <button
            onClick={addPointP1}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            +1 Point
          </button>
        </div>

        {/* Player 2 */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-medium">Player 2</span>
          <div
            className={`relative w-24 h-24 perspective`}
          >
            <div
              className={`absolute w-full h-full rounded-lg bg-blue-600 text-white font-bold text-4xl flex items-center justify-center backface-hidden transform transition-transform duration-300 ${
                flipP2 ? "rotateX-180" : ""
              }`}
            >
              {player2Score}
            </div>
            <div className="absolute w-full h-full rounded-lg bg-blue-500 text-white font-bold text-4xl flex items-center justify-center rotateX-180 backface-hidden">
              {player2Score + 1}
            </div>
          </div>
          <button
            onClick={addPointP2}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            +1 Point
          </button>
        </div>
      </div>

      
      <div className="flex items-center justify-center gap-12">
        <div className="flex flex-col items-center">
          <span className="text-sm text-muted-foreground">Game</span>
          <span className="text-lg font-semibold">1</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-muted-foreground">Set</span>
          <span className="text-lg font-semibold">Best of 3</span>
        </div>
      </div>

      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotateX-180 {
          transform: rotateX(180deg);
        }
      `}</style>
    </div>
  );
}
