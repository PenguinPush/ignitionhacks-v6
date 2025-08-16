"use client"

import {useState, useEffect} from "react"
import BadmintonScoreboard from "@/components/scoreboard2"

export default function FileAnalyzer() {
    const [gameData, setGameData] = useState(null);
    const [prevGameData, setPrevGameData] = useState(null);
    const [flipStates, setFlipStates] = useState({ team1: [false, false], team2: [false, false] });

    useEffect(() => {
        document.title = "🏸 Goodminton > Badminton";
        let socket;
        let reconnectInterval;

        const connectWebSocket = () => {
            socket = new WebSocket("ws://localhost:6767");

            socket.onopen = () => {
                console.log("WebSocket connection established.");
                if (reconnectInterval) {
                    clearInterval(reconnectInterval);
                }
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                // Check if points changed to trigger animations
                if (gameData) {
                    const team1Changed = data.team1_points !== gameData.team1_points;
                    const team2Changed = data.team2_points !== gameData.team2_points;
                    
                    if (team1Changed || team2Changed) {
                        // Trigger flip animations
                        const newFlipStates = { team1: [false, false], team2: [false, false] };
                        
                        if (team1Changed) {
                            const oldDigits = gameData.team1_points.toString().padStart(2, "0").split("");
                            const newDigits = data.team1_points.toString().padStart(2, "0").split("");
                            newFlipStates.team1 = oldDigits.map((digit, idx) => digit !== newDigits[idx]);
                        }
                        
                        if (team2Changed) {
                            const oldDigits = gameData.team2_points.toString().padStart(2, "0").split("");
                            const newDigits = data.team2_points.toString().padStart(2, "0").split("");
                            newFlipStates.team2 = oldDigits.map((digit, idx) => digit !== newDigits[idx]);
                        }
                        
                        setFlipStates(newFlipStates);
                        
                        // Reset flip states after animation
                        setTimeout(() => {
                            setFlipStates({ team1: [false, false], team2: [false, false] });
                        }, 600);
                    }
                }
                
                setPrevGameData(gameData);
                setGameData(data);
            };

            socket.onclose = () => {
                console.log("WebSocket connection closed. Attempting to reconnect...");
                reconnectInterval = setInterval(() => {
                    console.log("Reconnecting...");
                    connectWebSocket();
                }, 5000);
            };

            socket.onerror = (error) => {
                console.log("WebSocket error:", error);
                socket.close();
            };
        };

        connectWebSocket();

        return () => {
            if (socket) socket.close();
            if (reconnectInterval) clearInterval(reconnectInterval);
        };
    }, []);

    const FlapScore = ({score, prevScore, color, flipState}) => {
        const digits = score.toString().padStart(2, "0").split("");
        const prevDigits = prevScore ? prevScore.toString().padStart(2, "0").split("") : ["0", "0"];

        return (
            <div className="flex gap-2">
                {digits.map((digit, idx) => {
                    const isFlipping = flipState && flipState[idx] === true;
                    const prevDigit = prevDigits[idx];

                    return (
                        <div key={idx} className="relative w-24 h-32 text-6xl" style={{ perspective: '1000px' }}>
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-card/30"/>

            <div className="relative z-10 p-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">🏸 Goodminton</h1>
                    <p className="text-gray-600 dark:text-gray-300">Live Badminton Game Tracker</p>
                </div>

                {gameData ? (
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Game Status */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Game Status</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Set</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{gameData.set}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Points to Win</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{gameData.points_to_win}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Sets to Win</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{gameData.sets_to_win}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Best of Sets</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{gameData.best_of_sets}</p>
                                </div>
                            </div>
                        </div>

                        {/* Scoreboard */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-700">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Scoreboard</h2>
                            <div className="grid grid-cols-2 gap-8">
                                {/* Team 1 */}
                                <div className="flex flex-col items-center gap-4">
                                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">Team 1</span>
                                    <FlapScore
                                        score={gameData.team1_points}
                                        prevScore={prevGameData?.team1_points}
                                        color="bg-gradient-to-b from-red-500 to-red-700"
                                        flipState={flipStates.team1}
                                    />
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Sets Won</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">{gameData.team1_sets}</p>
                                    </div>
                                </div>

                                {/* Team 2 */}
                                <div className="flex flex-col items-center gap-4">
                                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">Team 2</span>
                                    <FlapScore
                                        score={gameData.team2_points}
                                        prevScore={prevGameData?.team2_points}
                                        color="bg-gradient-to-b from-blue-500 to-blue-700"
                                        flipState={flipStates.team2}
                                    />
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Sets Won</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">{gameData.team2_sets}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Birdie Coordinates */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Birdie Position</h2>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">X Coordinate</p>
                                    <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{gameData.x?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Y Coordinate</p>
                                    <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{gameData.y?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Z Coordinate</p>
                                    <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{gameData.z?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Game Settings */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Game Settings</h2>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Deuce Enabled</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{gameData.deuce_enabled ? 'Yes' : 'No'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Update</p>
                                    <p className="text-sm font-mono text-gray-900 dark:text-white">{gameData.timestamp || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-md mx-auto text-center">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-700">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Connecting to Game...</h2>
                            <p className="text-gray-600 dark:text-gray-300">Waiting for WebSocket connection to establish</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}