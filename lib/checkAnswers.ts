// lib/checkAnswers.ts

import { supabase } from "./supabase";

export async function validateAnswers(roundId: string) {
  const { data: answers } = await supabase
    .from("answers")
    .select("id, word")
    .eq("round_id", roundId)
    .is("result", null);

  if (!answers || answers.length === 0) return;

  const wordCounts: Record<string, number> = {};
  for (const ans of answers) {
    const word = ans.word.trim();
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }

  for (const ans of answers) {
    const word = ans.word.trim();
    let result: string = "invalid";

    if (await checkWordInWikipedia(word)) {
      result = wordCounts[word] > 1 ? "duplicate" : "valid";
    }

    await supabase
      .from("answers")
      .update({ result })
      .eq("id", ans.id);
  }
}

async function checkWordInWikipedia(word: string): Promise<boolean> {
  const url = `https://ar.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    word
  )}&format=json&origin=*`;

  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const data = await res.json();
    return data?.query?.search?.length > 0;
  } catch {
    return false;
  }
}
