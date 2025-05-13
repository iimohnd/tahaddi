// app/game/[roomId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import RoundAnswerForm from "../../../components/RoundAnswerForm";
import { validateAnswers } from "../../../lib/checkAnswers";
import RoundResults from "../../../components/RoundResults";
import ScoreBoard from "../../../components/ScoreBoard";

export default function GameRoomPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [roundStarting, setRoundStarting] = useState(false);
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const [roundEnded, setRoundEnded] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("player_name") || "";
    setPlayerName(name);
    fetchRoom();
    fetchPlayers();
    subscribeToPlayers();
    subscribeToRounds();
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
      .channel("players-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "players", filter: `room_id=eq.${roomId}` },
        () => fetchPlayers()
      )
      .subscribe();
  }

  function subscribeToRounds() {
    supabase
      .channel("rounds-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rounds", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setCurrentRoundId(payload.new.id);
          setRoundEnded(false);
        }
      )
      .subscribe();
  }

  useEffect(() => {
    if (!isHost && !currentRoundId) {
      router.replace(`/lobby/${roomId}`);
    }
  }, [isHost, currentRoundId]);

  async function startRound() {
    const letters = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي";
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const roundNumber = Date.now();

    setRoundStarting(true);

    const { data, error } = await supabase.from("rounds").insert({
      room_id: roomId,
      letter: randomLetter,
      round_number: roundNumber,
    }).select().single();

    if (data) {
      setCurrentRoundId(data.id);
      setRoundEnded(false);
    } else {
      alert("فشل بدء الجولة");
    }

    setRoundStarting(false);
  }

  async function endRound() {
    if (!currentRoundId) return;

    await supabase
      .from("rounds")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", currentRoundId);

    await validateAnswers(currentRoundId);

    setRoundEnded(true);
    alert("تم إنهاء الجولة ومعالجة الإجابات ✅");
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">رمز الغرفة: {roomCode}</h1>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">اللاعبين في الغرفة:</h2>
        <ul className="space-y-1">
          {players.map((p) => (
            <li key={p.id} className="flex justify-between">
              <span>{p.name}</span>
              {p.is_host && <span className="text-xs text-blue-500">مشرف</span>}
            </li>
          ))}
        </ul>
      </div>

      {currentRoundId && !roundEnded && (
        <RoundAnswerForm
          roundId={currentRoundId}
          roomId={roomId as string}
          playerName={playerName}
          onSubmitted={() => {}}
        />
      )}

      {currentRoundId && !roundEnded && (
        <button
          onClick={endRound}
          className="mt-4 bg-red-600 text-white py-2 px-4 rounded"
        >
          انتهيت
        </button>
      )}

      {roundEnded && currentRoundId && (
        <>
          <RoundResults roundId={currentRoundId} />
          <ScoreBoard roomId={roomId as string} />
        </>
      )}

      {isHost && !currentRoundId && (
        <button
          onClick={startRound}
          disabled={roundStarting}
          className="mt-6 bg-green-600 text-white py-2 px-4 rounded"
        >
          {roundStarting ? "...جاري بدء الجولة" : "بدء الجولة"}
        </button>
      )}
    </main>
  );
}
