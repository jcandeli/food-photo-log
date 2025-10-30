'use client';

import StyledComponentsRegistry from './registry';
import { Navigation } from '@/components/Navigation';
import { GlobalStyle } from '@/components/GlobalStyle';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <GlobalStyle />
          <Navigation />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

