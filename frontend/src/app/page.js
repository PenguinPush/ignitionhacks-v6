"use client"

import {useState, useEffect} from "react"
import BadmintonScoreboard from "@/components/scoreboard"

export default function FileAnalyzer() {
    const [coordinates, setCoordinates] = useState(null);

    useEffect(() => {
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
                setCoordinates(data);
            };

            socket.onclose = () => {
                console.error("WebSocket connection closed. Attempting to reconnect...");
                reconnectInterval = setInterval(() => {
                    console.log("Reconnecting...");
                    connectWebSocket();
                }, 5000);
            };

            socket.onerror = (error) => {
                console.error("WebSocket error:", error);
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
        <div className="min-h-screen bg-background">
            <div
                className="absolute inset-0 bg-gradient-to-br from-background via-background to-card/50 flex justify-center align-center"/>

            <div className="relative z-10 p-6">
                <h1 className="text-xl font-bold">Shuttlecock Coordinates</h1>
                {coordinates ? (
                    <div>
                        <p>X: {coordinates.x}</p>
                        <p>Y: {coordinates.y}</p>
                        <p>Z: {coordinates.z}</p>
                        <p>Timestamp: {coordinates.timestamp}</p>
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
