// app/lobby/[roomId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function LobbyRoomPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("player_name") || "";
    setPlayerName(name);
    fetchRoom();
    fetchPlayers();
    subscribeToPlayers();
  }, [roomId]);

  async function fetchRoom() {
    const { data } = await supabase.from("rooms").select("code").eq("id", roomId).single();
    if (data) setRoomCode(data.code);
  }

  async function fetchPlayers() {
    const { data } = await supabase.from("players").select("*").eq("room_id", roomId);
    setPlayers(data || []);

    const me = data?.find((p) => p.name === playerName);
    setIsHost(me?.is_host || false);
  }

  function subscribeToPlayers() {
    supabase
      .channel("lobby-players")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "players", filter: `room_id=eq.${roomId}` },
        () => fetchPlayers()
      )
      .subscribe();
  }

  function goToGame() {
    router.push(`/game/${roomId}`);
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">غرفة الانتظار</h1>
      <p className="mb-2">رمز الغرفة: <strong>{roomCode}</strong></p>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">اللاعبين:</h2>
        <ul className="space-y-1">
          {players.map((p) => (
            <li key={p.id} className="flex justify-between">
              <span>{p.name}</span>
              {p.is_host && <span className="text-xs text-blue-500">مشرف</span>}
            </li>
          ))}
        </ul>
      </div>

      {isHost && (
        <button
          onClick={goToGame}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          بدء اللعب
        </button>
      )}

      {!isHost && (
        <p className="text-sm text-gray-600">بانتظار المشرف لبدء الجولة...</p>
      )}
    </main>
  );
}
