// app/layout.tsx
import './globals.css';
import React from 'react';

export const metadata = {
  title: 'TaskFlow',
  description: 'Project management app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
