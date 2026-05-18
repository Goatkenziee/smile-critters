import './globals.css';
export const metadata = { title: 'Smile Critters', description: 'Catch Cat, Tree, and Nacho!' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
