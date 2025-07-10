'use client';

import React from "react";
import { SessionProvider } from 'next-auth/react';

export function AuthProvider({
  children,
  session
}: {
  children: React.ReactNode;
  session?: any;
}) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}