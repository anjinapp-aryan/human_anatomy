import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import { SiteHeader } from "../../components/SiteHeader";
import { systemBySlug, systems } from "../../lib/systems";

export function generateStaticParams() {
  return systems.map((system) => ({ slug: system.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const system = systemBySlug[slug];
  if (!system) return { title: "System not found — Anatomy Atelier" };
  return {
    title: `${system.name} — Anatomy Atelier`,
    description: `Specimens in the ${system.name.toLowerCase()}: ${system.organs
      .map((organ) => organ.name)
      .join(", ")}.`,
  };
}

export default async function SystemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const system = systemBySlug[slug];
  if (!system) notFound();

  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="page-body">
        <Link className="back-link" href="/systems">
          <ArrowLeft size={15} /> All systems
        </Link>

        <div className="page-heading">
          <em>Body system</em>
          <h1>{system.name}</h1>
          <p>
            {system.organs.length === 1
              ? "One specimen in the atelier belongs to this system."
              : `${system.organs.length} specimens in the atelier belong to this system.`}{" "}
            Open one to explore it in 3D.
          </p>
        </div>

        <ul className="organ-grid">
          {system.organs.map((organ) => (
            <li key={organ.id}>
              <article className="organ-tile" style={{ "--tile-accent": organ.accent } as React.CSSProperties}>
                <header>
                  {organ.illustrated ? (
                    /* Thumbnails only — the multi-megabyte .glb is fetched by the
                       viewer itself, never by a browse page. */
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/anatomy/${organ.id}/thumb.webp`} alt="" width={54} height={54} loading="lazy" decoding="async" />
                  ) : (
                    <span className="tile-glyph" aria-hidden="true">{organ.icon}</span>
                  )}
                  <div>
                    <h2>{organ.name}</h2>
                    <small>{organ.scientificName}</small>
                  </div>
                </header>
                <p>{organ.description}</p>
                <dl>
                  <div><dt>Primary role</dt><dd>{organ.function}</dd></div>
                  <div><dt>Location</dt><dd>{organ.location}</dd></div>
                  <div><dt>Structures labelled</dt><dd>{organ.hotspots.length}</dd></div>
                </dl>
                <Link className="tile-cta" href={`/?organ=${organ.id}`}>
                  <Compass size={15} /> Explore in 3D <ArrowRight size={14} />
                </Link>
              </article>
            </li>
          ))}
        </ul>

        <div className="page-footer-nav">
          <Link className="back-link" href="/library">
            Browse the full library <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    </div>
  );
}
