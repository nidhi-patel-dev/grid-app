import "@/styles/globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { SocketProvider } from "@/providers/socket-provider";
import { Toaster } from "sonner";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Realtime Grid App",
  description: "Realtime multiplayer grid application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SocketProvider>
          {children}
          <Toaster position="bottom-right" theme="dark" richColors />
        </SocketProvider>
      </body>
    </html>
  );
}