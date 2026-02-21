"use client";

import { SessionProvider } from "next-auth/react";
import DbSyncProvider from "@/components/DbSyncProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DbSyncProvider />
      {children}
    </SessionProvider>
  );
}
