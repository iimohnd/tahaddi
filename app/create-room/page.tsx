// app/create-room/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

function generateRoomCode(length = 4) {
  const digits = "0123456789";
  return Array.from({ length }, () => digits[Math.floor(Math.random() * digits.length)]).join("");
}

export default function CreateRoomPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreateRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert("يرجى إدخال اسمك");
      return;
    }
    setLoading(true);

    const code = generateRoomCode();

    const { data, error } = await supabase
      .from("rooms")
      .insert({ code, created_by: name })
      .select("id")
      .single();

    if (error || !data) {
      alert("فشل إنشاء الغرفة");
      setLoading(false);
      return;
    }

    await supabase.from("players").insert({
      room_id: data.id,
      name,
      is_host: true
    });

    localStorage.setItem("player_name", name);
    router.push(`/lobby/${data.id}`);
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">إنشاء غرفة</h1>
      <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="اسمك"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "...جاري الإنشاء" : "إنشاء الغرفة"}
        </button>
      </form>
    </main>
  );
}
