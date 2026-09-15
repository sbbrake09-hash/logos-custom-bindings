import type { Metadata } from "next";
import Studio from "./studio";
import "./studio.css";

export const metadata: Metadata = { title: "Gallery Studio", robots: { index: false, follow: false }, alternates: { canonical: null } };
export default function AdminPage() { return <Studio />; }
