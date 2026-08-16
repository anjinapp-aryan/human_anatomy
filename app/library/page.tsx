import type { Metadata } from "next";
import { LibraryBrowser } from "../components/LibraryBrowser";

export const metadata: Metadata = {
  title: "Library — Anatomy Atelier",
  description: "Search and browse every organ and body system in the Anatomy Atelier collection.",
};

export default function LibraryPage() {
  return <LibraryBrowser />;
}
