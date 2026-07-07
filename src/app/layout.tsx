import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import IntroProvider from "@/components/IntroProvider";
import ProjectSelectionProvider from "@/components/ProjectSelectionProvider";
import InstrumentHoverProvider from "@/components/InstrumentHoverProvider";
import CustomCursor from "@/components/CustomCursor";
import CoverSheetLoader from "@/components/CoverSheetLoader";
import TitleBlockHeader from "@/components/TitleBlockHeader";
import ProjectDetailCard from "@/components/ProjectDetailCard";
import ArchiveScene from "@/scenes/ArchiveScene";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "The Archive — Miftahul Islam",
  description:
    "A drafted archive of real, shipped projects — structural engines, education platforms, and commerce tools, each rendered as its own technical sheet.",
  keywords: [
    "civil engineering",
    "portfolio",
    "software engineering",
    "Bangladesh",
    "Next.js",
  ],
  openGraph: {
    title: "The Archive — Miftahul Islam",
    description:
      "A drafted archive of real, shipped projects, each rendered as its own technical sheet.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Archive — Miftahul Islam",
    description:
      "A drafted archive of real, shipped projects, each rendered as its own technical sheet.",
  },
};

export const viewport = {
  themeColor: "#0f2847",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plexMono.variable} ${plexSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-indigo-deep text-linework">
        <CustomCursor />
        <IntroProvider>
          <SmoothScroll>
            <ProjectSelectionProvider>
              <InstrumentHoverProvider>
                <ArchiveScene />
                <TitleBlockHeader />
                <CoverSheetLoader />
                <ProjectDetailCard />
                <div id="top" className="relative z-10">
                  {children}
                </div>
              </InstrumentHoverProvider>
            </ProjectSelectionProvider>
          </SmoothScroll>
        </IntroProvider>
      </body>
    </html>
  );
}
