// components/ScoreBoard.tsx

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  roomId: string;
}

export default function ScoreBoard({ roomId }: Props) {
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      const { data } = await supabase
        .from("scores")
        .select("player_id, total_points")
        .eq("room_id", roomId)
        .order("total_points", { ascending: false });

      setScores(data || []);
      setLoading(false);
    }

    fetchScores();
  }, [roomId]);

  if (loading) return <p className="mt-4">جارٍ تحميل النقاط...</p>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">🏆 النقاط الإجمالية</h2>
      <ul className="bg-white shadow p-4 rounded space-y-2">
        {scores.map((s, idx) => (
          <li key={idx} className="flex justify-between">
            <span>👤 {s.player_id}</span>
            <span className="font-semibold">{s.total_points} نقطة</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
