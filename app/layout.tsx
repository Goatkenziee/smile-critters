export const metadata = { title: 'Smile Critters', description: 'A fun game with Cat, Tree, and Nacho!' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#1a1a2e', fontFamily: 'sans-serif' }}>{children}</body>
    </html>
  );
}
