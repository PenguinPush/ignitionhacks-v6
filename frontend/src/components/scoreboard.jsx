"use client"

import { useState, useRef, useEffect } from "react"
import { Settings, RotateCcw, Maximize, Minimize } from "lucide-react"

export default function BadmintonScoreboard() {
  const [player1Score, setPlayer1Score] = useState(0)
  const [player2Score, setPlayer2Score] = useState(0)

  const [player1Games, setPlayer1Games] = useState(0)
  const [player2Games, setPlayer2Games] = useState(0)
  const [currentGame, setCurrentGame] = useState(1)

  const [matchWinner, setMatchWinner] = useState(null)

  const [useDeuce, setUseDeuce] = useState(true)
  const [bestOf, setBestOf] = useState(3) // 3, 5, or 7
  const [raceTo, setRaceTo] = useState(21) // 11, 15, or 21
  const gamesNeededToWin = Math.ceil(bestOf / 2)

  const scoreboardRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const [prevP1, setPrevP1] = useState(0)
  const [prevP2, setPrevP2] = useState(0)
  const [flipStates, setFlipStates] = useState({ p1: [false, false], p2: [false, false] })

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const goFullscreen = () => {
    if (!document.fullscreenElement && scoreboardRef.current) {
      scoreboardRef.current.requestFullscreen()
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
    }
  }

  const checkGameWinner = (p1, p2) => {
    if (useDeuce) {
      if ((p1 >= raceTo || p2 >= raceTo) && Math.abs(p1 - p2) >= 2) {
        return p1 > p2 ? "Home" : "Away"
      }
      if (p1 === 30 || p2 === 30) {
        return p1 > p2 ? "Home" : "Away"
      }
    } else {
      if (p1 >= raceTo) return "Home"
      if (p2 >= raceTo) return "Away"
    }
    return null
  }

  const handlePoint = (player) => {
    if (matchWinner) return

    if (player === 1) {
      const newScore = player1Score + 1
      const oldDigits = player1Score.toString().padStart(2, "0").split("")
      const newDigits = newScore.toString().padStart(2, "0").split("")
      const newFlipState = oldDigits.map((digit, idx) => digit !== newDigits[idx])

      setPrevP1(player1Score)
      setPlayer1Score(newScore)
      setFlipStates((prev) => ({ ...prev, p1: newFlipState }))

      setTimeout(() => {
        setFlipStates((prev) => ({ ...prev, p1: [false, false] }))
      }, 600)

      const win = checkGameWinner(newScore, player2Score)
      if (win) endGame(win)
    } else {
      const newScore = player2Score + 1
      const oldDigits = player2Score.toString().padStart(2, "0").split("")
      const newDigits = newScore.toString().padStart(2, "0").split("")
      const newFlipState = oldDigits.map((digit, idx) => digit !== newDigits[idx])

      setPrevP2(player2Score)
      setPlayer2Score(newScore)
      setFlipStates((prev) => ({ ...prev, p2: newFlipState }))

      setTimeout(() => {
        setFlipStates((prev) => ({ ...prev, p2: [false, false] }))
      }, 600)

      const win = checkGameWinner(player1Score, newScore)
      if (win) endGame(win)
    }
  }

  const endGame = (winner) => {
    if (winner === "Home") {
      setPlayer1Games((g) => {
        if (g + 1 === gamesNeededToWin) {
          setMatchWinner("Home")
          return g + 1
        }
        return g + 1
      })
    } else {
      setPlayer2Games((g) => {
        if (g + 1 === gamesNeededToWin) {
          setMatchWinner("Away")
          return g + 1
        }
        return g + 1
      })
    }

    setCurrentGame((g) => Math.min(g + 1, bestOf))
    setPlayer1Score(0)
    setPlayer2Score(0)
    setPrevP1(0)
    setPrevP2(0)
    setFlipStates({ p1: [false, false], p2: [false, false] })
  }

  const resetMatch = () => {
    setPlayer1Score(0)
    setPlayer2Score(0)
    setPlayer1Games(0)
    setPlayer2Games(0)
    setCurrentGame(1)
    setMatchWinner(null)
    setPrevP1(0)
    setPrevP2(0)
    setFlipStates({ p1: [false, false], p2: [false, false] })
  }

  const ScoreDisplay = ({ score, prevScore, flipState, isHome }) => {
    const digits = score.toString().padStart(2, "0").split("")
    const prevDigits = prevScore.toString().padStart(2, "0").split("")

    return (
      <div className="flex gap-1 sm:gap-2">
        {digits.map((digit, idx) => {
          const isFlipping = flipState && flipState[idx] === true
          const prevDigit = prevDigits[idx]

          return (
            <div
              key={idx}
              className="relative w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28"
              style={{ perspective: "1000px" }}
            >
              <div
                className="absolute w-full h-full rounded-lg text-white font-mono font-black flex items-center justify-center transition-transform duration-600 ease-in-out text-4xl sm:text-5xl md:text-6xl bg-black/20 border-2 border-white/30"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipping ? "rotateX(-90deg)" : "rotateX(0deg)",
                }}
              >
                {isFlipping ? prevDigit : digit}
              </div>

              {isFlipping && (
                <div
                  className="absolute w-full h-full rounded-lg text-white font-mono font-black flex items-center justify-center text-4xl sm:text-5xl md:text-6xl bg-black/20 border-2 border-white/30"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "rotateX(90deg)",
                    animation: "flipIn 0.6s ease-in-out forwards",
                  }}
                >
                  {digit}
                </div>
              )}
            </div>
          )
        })}

        <style jsx>{`
          @keyframes flipIn {
            0% { transform: rotateX(90deg); }
            100% { transform: rotateX(0deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div ref={scoreboardRef} className="relative w-full h-screen bg-gray-100 overflow-hidden">
      {/* Main Split Layout */}
      <div className="flex h-full">
        {/* Home Side (Blue) */}
        <div
          className="flex-1 bg-blue-500 flex flex-col items-center justify-center relative cursor-pointer active:bg-blue-600 transition-colors"
          onClick={() => handlePoint(1)}
        >
          <div className="absolute top-6 left-6">
            <h2 className="text-white text-lg sm:text-xl font-semibold">Home</h2>
          </div>

          <ScoreDisplay score={player1Score} prevScore={prevP1} flipState={flipStates.p1} isHome={true} />
        </div>

        {/* Center Divider */}
        <div className="w-16 sm:w-20 bg-gray-200 flex flex-col items-center justify-between py-6 relative">
          {/* Set Indicator */}
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">SET</div>
            <div className="text-2xl font-bold text-gray-900">{currentGame}</div>
          </div>

          {/* Control Icons */}
          <div className="flex flex-col gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowSettings(!showSettings)
              }}
              className="p-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                resetMatch()
              }}
              className="p-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                goFullscreen()
              }}
              className="p-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-gray-700" />
              ) : (
                <Maximize className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>

          {/* Game Score */}
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">GAMES</div>
            <div className="text-sm font-semibold text-gray-900">
              {player1Games} - {player2Games}
            </div>
          </div>
        </div>

        {/* Away Side (Red) */}
        <div
          className="flex-1 bg-red-500 flex flex-col items-center justify-center relative cursor-pointer active:bg-red-600 transition-colors"
          onClick={() => handlePoint(2)}
        >
          <div className="absolute top-6 right-6">
            <h2 className="text-white text-lg sm:text-xl font-semibold">Away</h2>
          </div>

          <ScoreDisplay score={player2Score} prevScore={prevP2} flipState={flipStates.p2} isHome={false} />
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-white rounded-2xl p-6 m-4 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4 text-center">Game Settings</h3>

            {/* Race To selector */}
            <div className="mb-4">
              <label className="block font-medium mb-2">Race to:</label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[11, 15, 21].map((option) => (
                  <button
                    key={option}
                    onClick={() => setRaceTo(option)}
                    disabled={player1Score > 0 || player2Score > 0}
                    className={`flex-1 py-2 text-sm rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      raceTo === option ? "bg-blue-600 text-white shadow-sm" : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Deuce Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">Deuce Rules</span>
              <button
                onClick={() => setUseDeuce(!useDeuce)}
                disabled={player1Score > 0 || player2Score > 0}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  useDeuce ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useDeuce ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Best Of Selector */}
            <div className="mb-6">
              <label className="block font-medium mb-2">Best of:</label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[3, 5, 7].map((option) => (
                  <button
                    key={option}
                    onClick={() => setBestOf(option)}
                    disabled={currentGame > 1 || player1Games > 0 || player2Games > 0}
                    className={`flex-1 py-2 text-sm rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      bestOf === option ? "bg-blue-600 text-white shadow-sm" : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Match Winner Overlay */}
      {matchWinner && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-40">
          <div className="text-center">
            <h1 className="text-6xl text-white font-bold mb-4 animate-bounce">🏆</h1>
            <h2 className="text-4xl text-white font-bold mb-8">{matchWinner} Wins!</h2>
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
  )
}
