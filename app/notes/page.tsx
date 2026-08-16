import type { Metadata } from "next";
import { NotesWorkspace } from "../components/NotesWorkspace";

export const metadata: Metadata = {
  title: "Notes — Anatomy Atelier",
  description: "Keep personal anatomy study notes, saved in your own browser.",
};

export default function NotesPage() {
  return <NotesWorkspace />;
}
