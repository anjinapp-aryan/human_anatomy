"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BrainCircuit, Compass, LibraryBig, NotebookPen, Search } from "lucide-react";

type SearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
};

type Props = {
  /** Supplied only by pages that actually search something. Pages without it get
   *  a spacer instead of a search box that does nothing. */
  search?: SearchProps;
  /** Explore-only: opens the organ drawer on small screens. */
  onOpenMobileLibrary?: () => void;
  /** Explore-only: the Lessons modal belongs to the organ being viewed, so on
   *  other routes the item links back to Explore rather than pretending. */
  onOpenLessons?: () => void;
};

export function SiteHeader({ search, onOpenMobileLibrary, onOpenLessons }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="topbar">
      <Link className="brand" href="/">
        <strong>Anatomy Atelier<sup>✦</sup></strong>
        <em>Learn anatomy like an artist</em>
      </Link>

      <nav className="main-nav" aria-label="Primary navigation">
        <Link href="/" className={isActive("/") ? "active" : ""} aria-current={isActive("/") ? "page" : undefined}>
          <Compass size={17} /> Explore
        </Link>
        <Link
          href="/systems"
          className={isActive("/systems") ? "active" : ""}
          aria-current={isActive("/systems") ? "page" : undefined}
        >
          <BrainCircuit size={17} /> Systems
        </Link>
        {onOpenLessons ? (
          <button type="button" onClick={onOpenLessons}><BookOpen size={17} /> Lessons</button>
        ) : (
          <Link href="/"><BookOpen size={17} /> Lessons</Link>
        )}
        <Link
          href="/library"
          className={isActive("/library") ? "active" : ""}
          aria-current={isActive("/library") ? "page" : undefined}
        >
          <LibraryBig size={17} /> Library
        </Link>
        <Link
          href="/notes"
          className={isActive("/notes") ? "active" : ""}
          aria-current={isActive("/notes") ? "page" : undefined}
        >
          <NotebookPen size={17} /> Notes
        </Link>
      </nav>

      {search ? (
        <label className="search-box">
          <Search size={17} />
          <span className="sr-only">{search.label}</span>
          <input
            type="search"
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
            placeholder={search.placeholder}
          />
        </label>
      ) : (
        <span className="search-spacer" aria-hidden="true" />
      )}

      {/* Static attribution for the demo owner. Not an account: there is no
          authentication, session, or profile behind it, so it is rendered as
          plain text rather than a control that promises an action. */}
      <div className="profile">
        <span className="profile-avatar" aria-hidden="true">A</span>
        <span className="profile-name">Aryan</span>
      </div>

      {onOpenMobileLibrary && (
        <button className="mobile-library-trigger" onClick={onOpenMobileLibrary} aria-label="Open organ library">
          <LibraryBig size={20} />
        </button>
      )}
    </header>
  );
}
