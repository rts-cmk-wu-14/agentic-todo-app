import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
	variable: "--font-anido-hand",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "AniDo | Tiny plans, big dreams",
	description: "A local-first todo universe for your everyday quests.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={caveat.variable}>
			<body>{children}</body>
		</html>
	);
}
