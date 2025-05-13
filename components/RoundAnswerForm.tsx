// components/RoundAnswerForm.tsx

"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  roundId: string;
  playerName: string;
  roomId: string;
  onSubmitted: () => void;
}

const categories = ["اسم", "بلاد", "حيوان", "نبات", "جماد"];

export default function RoundAnswerForm({ roundId, playerName, roomId, onSubmitted }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (category: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: players } = await supabase.from("players").select("id").eq("room_id", roomId).eq("name", playerName).single();
    const playerId = players?.id;
    if (!playerId) {
      alert("اللاعب غير موجود");
      setLoading(false);
      return;
    }

    const payload = categories.map((cat) => ({
      player_id: playerId,
      round_id: roundId,
      category: cat,
      word: answers[cat]?.trim() || ""
    }));

    const { error } = await supabase.from("answers").insert(payload);
    if (error) {
      alert("فشل في إرسال الإجابات");
    } else {
      onSubmitted();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      {categories.map((cat) => (
        <div key={cat}>
          <label className="block text-sm font-medium mb-1">{cat}</label>
          <input
            type="text"
            value={answers[cat] || ""}
            onChange={(e) => handleChange(cat, e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded"
      >
        {loading ? "...جاري الإرسال" : "إرسال الإجابات"}
      </button>
    </form>
  );
}
