import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://logoscustombindings.com"),
  title: {
    default: "Logos Custom Bindings | Bible Rebinding & Handcrafted Books",
    template: "%s | Logos Custom Bindings",
  },
  description:
    "Custom Bible rebinding and restoration, hand-bound journals, Bible and journal customizations, and one-of-a-kind custom work crafted with care and shipped nationwide.",
  applicationName: "Logos Custom Bindings",
  keywords: [
    "Bible rebinding",
    "custom Bible rebinding",
    "Bible restoration",
    "leather Bible cover",
    "hand-bound notebooks",
    "custom bookbinding",
  ],
  alternates: { canonical: "https://logoscustombindings.com/" },
  openGraph: {
    type: "website",
    url: "https://logoscustombindings.com/",
    siteName: "Logos Custom Bindings",
    title: "Custom Bible Rebinding & Handcrafted Book Restoration",
    description:
      "Thoughtfully made leather bindings for Bibles, journals, notebooks, and treasured books.",
    images: [
      {
        url: "https://logoscustombindings.com/lcb-bible-homepage.jpg",
        width: 1600,
        height: 1067,
        alt: "A well-loved book resting on a crafted leather surface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Logos Custom Bindings | Crafted to Last",
    description:
      "Custom Bible rebinding and handcrafted journals, made with lasting materials and care.",
    images: [
      "https://logoscustombindings.com/lcb-bible-homepage.jpg",
    ],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/lcb-circle-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
