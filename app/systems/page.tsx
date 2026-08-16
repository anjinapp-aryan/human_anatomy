import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { systems } from "../lib/systems";

export const metadata: Metadata = {
  title: "Body systems — Anatomy Atelier",
  description: "Browse the human body by system and open the 3D specimens that belong to each one.",
};

export default function SystemsPage() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="page-body">
        <div className="page-heading">
          <em>Browse</em>
          <h1>Body systems</h1>
          <p>
            Every specimen in the atelier belongs to a system. Choose one to see which organs it
            contains and open them in the 3D viewer.
          </p>
        </div>

        {systems.length === 0 ? (
          <p className="empty-state">No systems available.</p>
        ) : (
          <ul className="system-grid">
            {systems.map((system) => (
              <li key={system.slug}>
                <Link className="system-tile" href={`/systems/${system.slug}`}>
                  <span className="system-tile-art" aria-hidden="true">
                    {system.organs.map((organ) => (
                      <i key={organ.id} style={{ background: organ.accent }} />
                    ))}
                  </span>
                  <h2>{system.name}</h2>
                  <small>
                    {system.organs.length} {system.organs.length === 1 ? "specimen" : "specimens"}
                  </small>
                  <p>{system.organs.map((organ) => organ.name).join(" · ")}</p>
                  <span className="system-tile-go">
                    Open system <ArrowRight size={14} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
