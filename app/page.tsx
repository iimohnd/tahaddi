// app/page.tsx

"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 text-center p-4">
      <h1 className="text-3xl font-bold">🎮 تحدي الحروف</h1>
      <p className="text-gray-600">لعبة جماعية ممتعة لاختبار معلوماتك</p>

      <div className="flex gap-4">
        <button
          onClick={() => router.push("/create-room")}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          إنشاء غرفة
        </button>

        <button
          onClick={() => router.push("/join-room")}
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
        >
          الانضمام لغرفة
        </button>
      </div>
    </main>
  );
}
