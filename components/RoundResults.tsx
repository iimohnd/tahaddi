// components/RoundResults.tsx

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  roundId: string;
}

export default function RoundResults({ roundId }: Props) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      const { data } = await supabase
        .from("answers")
        .select("player_id, category, word, result")
        .eq("round_id", roundId);

      setResults(data || []);
      setLoading(false);
    }

    fetchResults();
  }, [roundId]);

  if (loading) return <p className="mt-4">جارٍ تحميل النتائج...</p>;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-2">نتائج الجولة:</h2>
      <ul className="text-sm space-y-1">
        {results.map((res, idx) => (
          <li key={idx}>
            🧍 اللاعب: {res.player_id} | 📝 {res.category}: {res.word} →
            {" "}
            {res.result === "valid" && "✅"}
            {res.result === "duplicate" && "🟡 مكررة"}
            {res.result === "invalid" && "❌ خاطئة"}
          </li>
        ))}
      </ul>
    </div>
  );
}
