import { useState, useRef, useEffect } from "react";
import { Trophy, Maximize, Minimize } from "lucide-react";

export default function BadmintonScoreboard() {
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);

  const [player1Games, setPlayer1Games] = useState(0);
  const [player2Games, setPlayer2Games] = useState(0);
  const [currentGame, setCurrentGame] = useState(1);

  const [matchWinner, setMatchWinner] = useState(null);

  const [useDeuce, setUseDeuce] = useState(true);
  const [bestOf, setBestOf] = useState(3); // 3, 5, or 7
  const gamesNeededToWin = Math.ceil(bestOf / 2);

  const scoreboardRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);


  const [prevP1, setPrevP1] = useState(0);
  const [prevP2, setPrevP2] = useState(0);
  const [flipStates, setFlipStates] = useState({ p1: [false, false], p2: [false, false] });


  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const goFullscreen = () => {
    if (!document.fullscreenElement && scoreboardRef.current) {
      scoreboardRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const flapSize = isFullscreen ? "w-48 h-48 text-8xl" : "w-24 h-24 text-4xl";

  // ✅ Correct badminton rules with deuce option
  const checkGameWinner = (p1, p2) => {
    if (useDeuce) {
      // Traditional deuce rules
      if ((p1 >= 21 || p2 >= 21) && Math.abs(p1 - p2) >= 2) {
        return p1 > p2 ? "Player 1" : "Player 2";
      }
      if (p1 === 30 || p2 === 30) {
        return p1 > p2 ? "Player 1" : "Player 2";
      }
    } else {
      // No deuce - first to 21 wins
      if (p1 >= 21) return "Player 1";
      if (p2 >= 21) return "Player 2";
    }
    return null;
  };

  const handlePoint = (player) => {
    if (matchWinner) return;

    if (player === 1) {
      const newScore = player1Score + 1;
      const oldDigits = player1Score.toString().padStart(2, "0").split("");
      const newDigits = newScore.toString().padStart(2, "0").split("");
      const newFlipState = oldDigits.map((digit, idx) => digit !== newDigits[idx]);
      
      // Update scores and flip state together
      setPrevP1(player1Score);
      setPlayer1Score(newScore);
      setFlipStates(prev => ({ ...prev, p1: newFlipState }));

      // Reset flip state after animation
      setTimeout(() => {
        setFlipStates(prev => ({ ...prev, p1: [false, false] }));
      }, 600);

      const win = checkGameWinner(newScore, player2Score);
      if (win) endGame(win);
    } else {
      const newScore = player2Score + 1;
      const oldDigits = player2Score.toString().padStart(2, "0").split("");
      const newDigits = newScore.toString().padStart(2, "0").split("");
      const newFlipState = oldDigits.map((digit, idx) => digit !== newDigits[idx]);
      
      // Update scores and flip state together
      setPrevP2(player2Score);
      setPlayer2Score(newScore);
      setFlipStates(prev => ({ ...prev, p2: newFlipState }));

      // Reset flip state after animation
      setTimeout(() => {
        setFlipStates(prev => ({ ...prev, p2: [false, false] }));
      }, 600);

      const win = checkGameWinner(player1Score, newScore);
      if (win) endGame(win);
    }
  };

  const endGame = (winner) => {
    if (winner === "Player 1") {
      setPlayer1Games((g) => {
        if (g + 1 === gamesNeededToWin) {
          setMatchWinner("Player 1");
          return g + 1;
        }
        return g + 1;
      });
    } else {
      setPlayer2Games((g) => {
        if (g + 1 === gamesNeededToWin) {
          setMatchWinner("Player 2");
          return g + 1;
        }
        return g + 1;
      });
    }

    setCurrentGame((g) => Math.min(g + 1, bestOf));
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPrevP1(0);
    setPrevP2(0);
    setFlipStates({ p1: [false, false], p2: [false, false] });
  };

  const resetMatch = () => {
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer1Games(0);
    setPlayer2Games(0);
    setCurrentGame(1);
    setMatchWinner(null);
    setPrevP1(0);
    setPrevP2(0);
    setFlipStates({ p1: [false, false], p2: [false, false] });
  };

  // ✅ FlapScore with proper flip animation
  const FlapScore = ({ score, prevScore, color, flipState }) => {
    const digits = score.toString().padStart(2, "0").split("");
    const prevDigits = prevScore.toString().padStart(2, "0").split("");

    return (
      <div className="flex gap-2">
        {digits.map((digit, idx) => {
          
          const isFlipping = flipState && flipState[idx] === true;
          const prevDigit = prevDigits[idx];
          
          return (
            <div key={idx} className={`relative ${flapSize}`} style={{ perspective: '1000px' }}>
              
              <div
                className={`absolute w-full h-full rounded-lg ${color} text-white font-mono font-extrabold flex items-center justify-center transition-transform duration-600 ease-in-out shadow-lg border-2 border-white/20`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipping ? 'rotateX(-90deg)' : 'rotateX(0deg)',
                }}
              >
                {isFlipping ? prevDigit : digit}
              </div>
              
              
              {isFlipping && (
                <div
                  className={`absolute w-full h-full rounded-lg ${color} text-white font-mono font-extrabold flex items-center justify-center shadow-lg border-2 border-white/20`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(90deg)',
                    animation: 'flipIn 0.6s ease-in-out forwards',
                  }}
                >
                  {digit}
                </div>
              )}
            </div>
          );
        })}
        
        <style jsx>{`
          @keyframes flipIn {
            0% { transform: rotateX(90deg); }
            100% { transform: rotateX(0deg); }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div
      ref={scoreboardRef}
      className={`relative ${
        isFullscreen
          ? "fixed inset-0 flex items-center justify-center bg-black z-50 p-6"
          : "max-w-4xl mx-auto p-6"
      } transition-all duration-300`}
    >
      <div
        className={`relative bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6 ${
          isFullscreen
            ? "w-3/4 h-3/4 flex flex-col items-center justify-center"
            : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2
            className={`font-bold tracking-tight text-gray-900 dark:text-white ${
              isFullscreen ? "text-5xl" : "text-2xl"
            }`}
          >
            Badminton Scoreboard
          </h2>
        </div>

        {/* Game Status */}
        <div className="text-center mb-4">
          <div className="flex justify-center gap-4 text-gray-600 dark:text-white/80">
            <span>Game {currentGame}/{bestOf}</span>
            <span>•</span>
            <span>Player 1: {player1Games}</span>
            <span>•</span>
            <span>Player 2: {player2Games}</span>
          </div>
        </div>

        {/* Game Settings */}
        {!matchWinner && (
          <div className="flex flex-wrap justify-center gap-6 mb-6 px-4">
            {/* Deuce Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Race to 21</span>
              <button
                onClick={() => setUseDeuce(!useDeuce)}
                disabled={player1Score > 0 || player2Score > 0}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  useDeuce 
                    ? 'bg-yellow-600' 
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useDeuce ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Deuce</span>
            </div>

            {/* Best Of Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Best of:</label>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {[3, 5, 7].map((option) => (
                  <button
                    key={option}
                    onClick={() => setBestOf(option)}
                    disabled={currentGame > 1 || player1Games > 0 || player2Games > 0}
                    className={`px-3 py-1 text-sm rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      bestOf === option
                        ? 'bg-yellow-600 text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Players */}
        <div
          className={`grid grid-cols-2 gap-8 mb-8 ${
            isFullscreen ? "gap-16" : ""
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <span
              className={`font-medium text-gray-900 dark:text-white ${
                isFullscreen ? "text-3xl" : "text-lg"
              }`}
            >
              Player 1
            </span>
            <FlapScore
              score={player1Score}
              prevScore={prevP1}
              color="bg-gradient-to-b from-red-500 to-red-700"
              flipState={flipStates.p1}
            />
            <button
              onClick={() => handlePoint(1)}
              className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                isFullscreen ? "text-xl px-8 py-4" : ""
              }`}
              disabled={!!matchWinner}
            >
              +1 Point
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <span
              className={`font-medium text-gray-900 dark:text-white ${
                isFullscreen ? "text-3xl" : "text-lg"
              }`}
            >
              Player 2
            </span>
            <FlapScore
              score={player2Score}
              prevScore={prevP2}
              color="bg-gradient-to-b from-blue-500 to-blue-700"
              flipState={flipStates.p2}
            />
            <button
              onClick={() => handlePoint(2)}
              className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                isFullscreen ? "text-xl px-8 py-4" : ""
              }`}
              disabled={!!matchWinner}
            >
              +1 Point
            </button>
          </div>
        </div>

        {/* Game / Match Info */}
        <div className="flex items-center justify-center gap-12 text-gray-500 dark:text-white/60">
          <div className="flex flex-col items-center">
            <span className="text-sm">Current Game</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">{currentGame}/{bestOf}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm">Format</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Best of {bestOf}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm">Rules</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">{useDeuce ? 'Deuce' : 'Race to 21'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={resetMatch}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Reset Match
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={goFullscreen}
          className="absolute bottom-4 right-4 p-3 bg-gray-200/80 dark:bg-white/20 backdrop-blur-sm rounded-full hover:bg-gray-300/80 dark:hover:bg-white/30 transition-colors z-40"
        >
          {isFullscreen ? (
            <Minimize className="w-6 h-6 text-gray-700 dark:text-white" />
          ) : (
            <Maximize className="w-6 h-6 text-gray-700 dark:text-white" />
          )}
        </button>

        {/* Match Winner Overlay */}
        {matchWinner && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-2xl">
            <div className="text-center">
              <h1 className="text-6xl text-white font-bold mb-4 animate-bounce">
                🏆
              </h1>
              <h2 className="text-4xl text-white font-bold mb-8">
                {matchWinner} Wins!
              </h2>
              <button
                onClick={resetMatch}
                className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 text-2xl font-semibold shadow-lg"
              >
                New Match
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}