import { useState, useRef, useEffect } from "react";
import { Trophy, Maximize, Minimize } from "lucide-react";

export default function BadmintonScoreboard() {
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [flipP1, setFlipP1] = useState(false);
  const [flipP2, setFlipP2] = useState(false);
  const scoreboardRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync fullscreen state when user presses Esc or exits fullscreen manually
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const goFullscreen = () => {
    if (!document.fullscreenElement && scoreboardRef.current) {
      scoreboardRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const flapSize = isFullscreen ? "w-40 h-40 text-7xl" : "w-24 h-24 text-4xl";
  const winner = player1Score >= 21 ? "Player 1" : player2Score >= 21 ? "Player 2" : null;

  const addPointP1 = () => {
    if (winner) return;
    setFlipP1(true);
    setTimeout(() => {
      setPlayer1Score(player1Score + 1);
      setFlipP1(false);
    }, 300);
  };

  const addPointP2 = () => {
    if (winner) return;
    setFlipP2(true);
    setTimeout(() => {
      setPlayer2Score(player2Score + 1);
      setFlipP2(false);
    }, 300);
  };

  const resetGame = () => {
    setPlayer1Score(0);
    setPlayer2Score(0);
  };

  return (
    <div
      ref={scoreboardRef}
      className={`relative ${isFullscreen ? "fixed inset-0 flex items-center justify-center bg-black z-50 p-6" : "max-w-4xl mx-auto p-6"} transition-all duration-300`}
    >
      <div className={`relative bg-card border border-border rounded-2xl shadow-lg p-6 ${isFullscreen ? "w-3/4 h-3/4 flex flex-col items-center justify-center" : ""}`}>
        

        <div className="flex items-center justify-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className={`font-bold tracking-tight ${isFullscreen ? "text-4xl" : "text-2xl"}`}>Badminton Scoreboard</h2>
        </div>


        <div className={`grid grid-cols-2 gap-8 mb-8 ${isFullscreen ? "gap-16" : ""}`}>

          <div className="flex flex-col items-center gap-2">
            <span className={`font-medium ${isFullscreen ? "text-3xl" : "text-lg"}`}>Player 1</span>
            <div className={`relative perspective ${flapSize}`}>
              <div className={`absolute w-full h-full rounded-lg bg-red-600 text-white font-mono font-extrabold flex items-center justify-center backface-hidden transform transition-transform duration-300 ${flipP1 ? "rotateX-180" : ""}`}>{player1Score.toString().padStart(2, "0")}</div>
              <div className={`absolute w-full h-full rounded-lg bg-red-500 text-white font-mono font-extrabold flex items-center justify-center rotateX-180 backface-hidden`}>{(player1Score + 1).toString().padStart(2, "0")}</div>
            </div>
            <button onClick={addPointP1} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" disabled={!!winner}>+1 Point</button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className={`font-medium ${isFullscreen ? "text-3xl" : "text-lg"}`}>Player 2</span>
            <div className={`relative perspective ${flapSize}`}>
              <div className={`absolute w-full h-full rounded-lg bg-blue-600 text-white font-mono font-extrabold flex items-center justify-center backface-hidden transform transition-transform duration-300 ${flipP2 ? "rotateX-180" : ""}`}>{player2Score.toString().padStart(2, "0")}</div>
              <div className={`absolute w-full h-full rounded-lg bg-blue-500 text-white font-mono font-extrabold flex items-center justify-center rotateX-180 backface-hidden`}>{(player2Score + 1).toString().padStart(2, "0")}</div>
            </div>
            <button onClick={addPointP2} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" disabled={!!winner}>+1 Point</button>
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


        <button
          onClick={goFullscreen}
          className="absolute bottom-10 right-10 p-3 bg-primary/20 rounded-full hover:bg-primary/40 transition-colors z-50"
        >
          {isFullscreen ? <Minimize className="w-6 h-6 text-primary" /> : <Maximize className="w-6 h-6 text-primary" />}
        </button>

        {winner && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
            <h1 className="text-6xl text-white font-bold mb-6">{winner} Wins!</h1>
            <button onClick={() => { setPlayer1Score(0); setPlayer2Score(0); }} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-2xl">Play Again</button>
          </div>
        )}

        <style jsx>{`
          .perspective { perspective: 1000px; }
          .backface-hidden { backface-visibility: hidden; }
          .rotateX-180 { transform: rotateX(180deg); }
        `}</style>
      </div>
    </div>
  );
}
