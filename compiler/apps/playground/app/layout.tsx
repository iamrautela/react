/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import React from 'react';
import '../styles/globals.css';

// Add type for process if missing
declare var process: {
  env: {
    NODE_ENV: string;
  };
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  'use no memo';
  return (
    <html lang="en">
      <head>
        <title>
          {typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
            ? '[DEV] React Compiler Playground'
            : 'React Compiler Playground'}
        </title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"></meta>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <link
          rel="preload"
          href="/fonts/Source-Code-Pro-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Optimistic_Display_W_Lt.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans h-screen overflow-y-hidden">{children}</body>
    </html>
  );
}
