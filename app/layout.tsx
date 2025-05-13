// app/layout.tsx

export const metadata = {
  title: "تحدي الحروف",
  description: "لعبة معلومات جماعية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-white text-gray-800">{children}</body>
    </html>
  );
}
