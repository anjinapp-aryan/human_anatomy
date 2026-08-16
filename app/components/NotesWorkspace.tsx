"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, NotebookPen, Pencil, Plus, Trash2, X } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { organs, organById, type OrganId } from "../lib/anatomy-data";
import {
  createNoteId,
  formatNoteDate,
  getNotesServerSnapshot,
  getNotesSnapshot,
  subscribeToNotes,
  writeNotes,
  type Note,
} from "../lib/notes-storage";

type Editor =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; note: Note };

export function NotesWorkspace() {
  // localStorage is an external system, so it is read through the store rather
  // than copied into component state. This also keeps the prerendered HTML and
  // the first client render in agreement.
  const { status, notes } = useSyncExternalStore(
    subscribeToNotes,
    getNotesSnapshot,
    getNotesServerSnapshot,
  );
  const [editor, setEditor] = useState<Editor>({ mode: "closed" });
  const [pendingDelete, setPendingDelete] = useState<Note | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const persist = (next: Note[]) => {
    setSaveError(writeNotes(next) ? null : "Your browser would not save this note. Storage may be full or blocked.");
  };

  const handleSubmit = (draft: { title: string; content: string; relatedOrganId?: OrganId }) => {
    const now = new Date().toISOString();
    if (editor.mode === "edit") {
      persist(
        notes.map((note) =>
          note.id === editor.note.id ? { ...note, ...draft, updatedAt: now } : note,
        ),
      );
    } else {
      persist([{ id: createNoteId(), ...draft, createdAt: now, updatedAt: now }, ...notes]);
    }
    setEditor({ mode: "closed" });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    persist(notes.filter((note) => note.id !== pendingDelete.id));
    setPendingDelete(null);
  };

  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="page-body">
        <div className="page-heading notes-heading">
          <div>
            <em>Your workspace</em>
            <h1>Notes</h1>
            <p>
              Study notes for your own reference. They are saved in this browser only — nothing is
              sent anywhere, and clearing your browser data removes them.
            </p>
          </div>
          {status === "ready" && (
            <button type="button" className="primary-action" onClick={() => setEditor({ mode: "create" })}>
              <Plus size={16} /> New note
            </button>
          )}
        </div>

        {saveError && <p className="notice notice-error" role="alert">{saveError}</p>}

        {status === "loading" && <p className="empty-state">Loading your notes…</p>}

        {status === "unavailable" && (
          <p className="notice notice-error" role="alert">
            Unable to load notes. This browser has storage disabled, so notes cannot be saved here.
          </p>
        )}

        {status === "corrupt" && (
          <p className="notice notice-error" role="alert">
            Unable to load notes — the saved data could not be read. Creating a new note will start a
            fresh set.
          </p>
        )}

        {status === "ready" && notes.length === 0 && (
          <div className="empty-state empty-state-block">
            <NotebookPen size={26} aria-hidden="true" />
            <p><strong>No notes yet.</strong></p>
            <p>Create your first anatomy note.</p>
            <button type="button" className="primary-action" onClick={() => setEditor({ mode: "create" })}>
              <Plus size={16} /> New note
            </button>
          </div>
        )}

        {status === "ready" && notes.length > 0 && (
          <ul className="notes-list">
            {notes.map((note) => {
              const related = note.relatedOrganId ? organById[note.relatedOrganId] : undefined;
              return (
                <li key={note.id}>
                  <article className="note-card">
                    <h2>{note.title}</h2>
                    {related && (
                      <Link className="note-tag" href={`/?organ=${related.id}`}>
                        {related.name} <ArrowRight size={12} />
                      </Link>
                    )}
                    <p>{note.content || "No content yet."}</p>
                    <footer>
                      <small>Last updated {formatNoteDate(note.updatedAt)}</small>
                      <span className="note-actions">
                        <button type="button" onClick={() => setEditor({ mode: "edit", note })}>
                          <Pencil size={14} /> Edit
                        </button>
                        <button type="button" className="danger" onClick={() => setPendingDelete(note)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </span>
                    </footer>
                  </article>
                </li>
              );
            })}
          </ul>
        )}

        {(status === "corrupt" || status === "unavailable") && (
          <div className="page-footer-nav">
            <Link className="back-link" href="/">Back to Explore <ArrowRight size={15} /></Link>
          </div>
        )}
      </main>

      {editor.mode !== "closed" && (
        <NoteEditor
          note={editor.mode === "edit" ? editor.note : undefined}
          onCancel={() => setEditor({ mode: "closed" })}
          onSubmit={handleSubmit}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this note?"
          body={`“${pendingDelete.title}” will be removed from this browser. This cannot be undone.`}
          confirmLabel="Delete note"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

/** Focus trap + Escape handling shared by both dialogs. */
function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !ref.current) return;
      const focusable = ref.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [onClose]);

  return ref;
}

function NoteEditor({
  note,
  onCancel,
  onSubmit,
}: {
  note?: Note;
  onCancel: () => void;
  onSubmit: (draft: { title: string; content: string; relatedOrganId?: OrganId }) => void;
}) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [relatedOrganId, setRelatedOrganId] = useState<string>(note?.relatedOrganId ?? "");
  const ref = useDialog(onCancel);
  const fieldId = useId();
  const trimmedTitle = title.trim();
  const sortedOrgans = useMemo(() => [...organs].sort((a, b) => a.name.localeCompare(b.name)), []);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <div
        ref={ref}
        className="note-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldId}-heading`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onCancel} aria-label="Close"><X size={18} /></button>
        <h2 id={`${fieldId}-heading`}>{note ? "Edit note" : "New note"}</h2>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!trimmedTitle) return;
            onSubmit({
              title: trimmedTitle,
              content: content.trim(),
              relatedOrganId: relatedOrganId ? (relatedOrganId as OrganId) : undefined,
            });
          }}
        >
          <label htmlFor={`${fieldId}-title`}>Title</label>
          <input
            id={`${fieldId}-title`}
            data-autofocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={120}
            placeholder="Heart anatomy"
          />

          <label htmlFor={`${fieldId}-content`}>Content</label>
          <textarea
            id={`${fieldId}-content`}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={7}
            placeholder="What did you learn?"
          />

          <label htmlFor={`${fieldId}-organ`}>Related organ (optional)</label>
          <select
            id={`${fieldId}-organ`}
            value={relatedOrganId}
            onChange={(event) => setRelatedOrganId(event.target.value)}
          >
            <option value="">None</option>
            {sortedOrgans.map((organ) => (
              <option key={organ.id} value={organ.id}>{organ.name}</option>
            ))}
          </select>

          <div className="dialog-actions">
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="submit" className="primary-action" disabled={!trimmedTitle}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useDialog(onCancel);
  const headingId = useId();

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <div
        ref={ref}
        className="note-dialog compact"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id={headingId}>{title}</h2>
        <p>{body}</p>
        <div className="dialog-actions">
          <button type="button" data-autofocus onClick={onCancel}>Cancel</button>
          <button type="button" className="primary-action danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
