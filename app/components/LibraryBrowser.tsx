"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Compass } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { organs } from "../lib/anatomy-data";
import { systems } from "../lib/systems";

type Category = "all" | "organs" | "systems";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "organs", label: "Organs" },
  { id: "systems", label: "Systems" },
];

export function LibraryBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");

  const term = query.trim().toLowerCase();

  // Same match rule the Explore sidebar already uses — name plus system — so
  // searching behaves identically in both places.
  const matchedOrgans = useMemo(
    () =>
      organs
        .filter((organ) => `${organ.name} ${organ.system} ${organ.scientificName}`.toLowerCase().includes(term))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [term],
  );

  const matchedSystems = useMemo(
    () =>
      systems.filter((system) =>
        `${system.name} ${system.organs.map((organ) => organ.name).join(" ")}`.toLowerCase().includes(term),
      ),
    [term],
  );

  const showOrgans = category === "all" || category === "organs";
  const showSystems = category === "all" || category === "systems";
  const total = (showOrgans ? matchedOrgans.length : 0) + (showSystems ? matchedSystems.length : 0);

  return (
    <div className="page-shell">
      <SiteHeader
        search={{
          value: query,
          onChange: setQuery,
          placeholder: "Search anatomy…",
          label: "Search the library",
        }}
      />
      <main className="page-body">
        <div className="page-heading">
          <em>Browse</em>
          <h1>Library</h1>
          <p>Everything in the atelier in one place — {organs.length} organs across {systems.length} body systems.</p>
        </div>

        <div className="library-controls">
          <div className="filter-row" role="group" aria-label="Filter by category">
            {CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={category === item.id ? "active" : ""}
                aria-pressed={category === item.id}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="result-count" role="status">
            {total} {total === 1 ? "result" : "results"}
            {term && <> for “{query.trim()}”</>}
          </p>
        </div>

        {total === 0 ? (
          <p className="empty-state">
            {term ? "No results found. Try a different search." : "No anatomy content found."}
          </p>
        ) : (
          <>
            {showOrgans && matchedOrgans.length > 0 && (
              <section className="library-section" aria-labelledby="library-organs">
                <h2 id="library-organs">Organs</h2>
                <ul className="library-list">
                  {matchedOrgans.map((organ) => (
                    <li key={organ.id}>
                      <Link className="library-row" href={`/?organ=${organ.id}`} style={{ "--tile-accent": organ.accent } as React.CSSProperties}>
                        {organ.illustrated ? (
                          /* Thumbnail only. The .glb is never requested here. */
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/anatomy/${organ.id}/thumb.webp`} alt="" width={46} height={46} loading="lazy" decoding="async" />
                        ) : (
                          <span className="tile-glyph" aria-hidden="true">{organ.icon}</span>
                        )}
                        <span className="library-row-text">
                          <strong>{organ.name}</strong>
                          <small>{organ.system} · {organ.hotspots.length} labelled structures</small>
                        </span>
                        <span className="library-row-go"><Compass size={15} /> Explore in 3D <ArrowRight size={14} /></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {showSystems && matchedSystems.length > 0 && (
              <section className="library-section" aria-labelledby="library-systems">
                <h2 id="library-systems">Systems</h2>
                <ul className="library-list">
                  {matchedSystems.map((system) => (
                    <li key={system.slug}>
                      <Link className="library-row" href={`/systems/${system.slug}`}>
                        <span className="tile-glyph" aria-hidden="true"><BrainCircuit size={20} /></span>
                        <span className="library-row-text">
                          <strong>{system.name}</strong>
                          <small>{system.organs.map((organ) => organ.name).join(" · ")}</small>
                        </span>
                        <span className="library-row-go">Open system <ArrowRight size={14} /></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
