import type { OrganId } from "./anatomy-data";

/**
 * Notes are stored only in the visitor's own browser. There is no account
 * system, no server, and no network call anywhere in this module — note content
 * never leaves the device.
 */
export const NOTES_STORAGE_KEY = "anatomy-atelier:notes";
const SCHEMA_VERSION = 1;

export type Note = {
  id: string;
  title: string;
  content: string;
  /** Optional link to an organ in `anatomy-data`, so a note can be filed against
   *  what the student was looking at. */
  relatedOrganId?: OrganId;
  createdAt: string;
  updatedAt: string;
};

type NotesFile = {
  version: number;
  notes: Note[];
};

export type NotesState = {
  status: "loading" | "ready" | "unavailable" | "corrupt";
  notes: Note[];
};

type LoadResult =
  | { status: "ok"; notes: Note[] }
  | { status: "unavailable" }
  | { status: "corrupt" };

function isNote(value: unknown): value is Note {
  if (!value || typeof value !== "object") return false;
  const note = value as Partial<Note>;
  return (
    typeof note.id === "string" &&
    typeof note.title === "string" &&
    typeof note.content === "string" &&
    typeof note.createdAt === "string" &&
    typeof note.updatedAt === "string"
  );
}

/**
 * Reads notes defensively. A quota-blocked or disabled localStorage, a truncated
 * write, or hand-edited JSON must surface as a handled state rather than an
 * exception that takes the page down.
 */
function readNotes(): LoadResult {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(NOTES_STORAGE_KEY);
  } catch {
    // Storage disabled entirely (private mode, blocked cookies, policy).
    return { status: "unavailable" };
  }
  if (!raw) return { status: "ok", notes: [] };

  try {
    const parsed = JSON.parse(raw) as Partial<NotesFile>;
    if (!parsed || !Array.isArray(parsed.notes)) return { status: "corrupt" };
    // Individual bad entries are dropped rather than failing the whole file, so
    // one malformed note never costs a student the rest of their work.
    return { status: "ok", notes: parsed.notes.filter(isNote) };
  } catch {
    return { status: "corrupt" };
  }
}

/**
 * A tiny external store, read through `useSyncExternalStore`.
 *
 * localStorage is unavailable while the page is prerendered, so the component
 * cannot simply read it during render. Modelling storage as the external system
 * it actually is keeps hydration correct (the server snapshot is always
 * "loading") and lets a second tab stay in sync for free.
 */
const EMPTY: Note[] = [];
const SERVER_STATE: NotesState = { status: "loading", notes: EMPTY };

let state: NotesState = SERVER_STATE;
let initialised = false;
const listeners = new Set<() => void>();

function toState(result: LoadResult): NotesState {
  return result.status === "ok"
    ? { status: "ready", notes: sortNotes(result.notes) }
    : { status: result.status, notes: EMPTY };
}

function emit() {
  for (const listener of listeners) listener();
}

/** Called only on the client. The result is cached, so the reference stays
 *  stable between renders and never loops. */
export function getNotesSnapshot(): NotesState {
  if (!initialised) {
    initialised = true;
    state = toState(readNotes());
  }
  return state;
}

export function getNotesServerSnapshot(): NotesState {
  return SERVER_STATE;
}

export function subscribeToNotes(listener: () => void) {
  listeners.add(listener);
  // Another tab editing the same notes updates this one too.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== NOTES_STORAGE_KEY) return;
    state = toState(readNotes());
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Persists and publishes in one step. Returns false when the browser refused
 *  the write, so the UI can say so rather than imply the note was saved. */
export function writeNotes(notes: Note[]): boolean {
  const ordered = sortNotes(notes);
  state = { status: "ready", notes: ordered };
  emit();

  const payload: NotesFile = { version: SCHEMA_VERSION, notes: ordered };
  try {
    window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    // Most often a full quota.
    return false;
  }
}

export function createNoteId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Newest activity first — the order a student expects when returning. */
export function sortNotes(notes: Note[]) {
  return [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function formatNoteDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
