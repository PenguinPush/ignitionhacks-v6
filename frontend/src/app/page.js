"use client"

import {useState, useEffect} from "react"
import BadmintonScoreboard from "@/components/scoreboard2"

export default function FileAnalyzer() {
    const [gameData, setGameData] = useState(null);

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


    return (
        <div className="min-h-screen bg-background overflow-hidden badminton-bg">
            <div
                className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-card/30 flex justify-center align-center"/>

            <div className="relative z-10 p-6">
                <h1 className="text-xl font-bold">Birdie Coordinates</h1>
                {gameData ? (
                    <div>
                        <p>X: {gameData.x}</p>
                        <p>Y: {gameData.y}</p>
                        <p>Z: {gameData.z}</p>
                        <p>last position update: {gameData.timestamp}</p>
                        <p>team 1 points: {gameData.team1_points}</p>
                        <p>team 2 points: {gameData.team2_points}</p>
                        <p>team 1 sets: {gameData.team1_sets}</p>
                        <p>team 2 sets: {gameData.team2_sets}</p>
                        <p>set #: {gameData.set}</p>
                        <p>x points to win: {gameData.points_to_win}</p>
                        <p>x sets to win: {gameData.sets_to_win}</p>
                        <p>best of sets: {gameData.best_of_sets}</p>
                        <p>dueceenabled: {gameData.deuce_enabled}</p>
                    </div>
                ) : (
                    <p>Waiting for updates...</p>
                )}
                <div className="p-6">
                    <BadmintonScoreboard/>
                </div>
            </div>
        </div>
    )
}
