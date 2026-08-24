import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "AniDo | Tiny plans, big dreams",
	description: "A local-first todo universe for your everyday quests.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
