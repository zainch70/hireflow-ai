"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addApplicationNoteAction } from "@/features/applications/actions/management.actions";
import { formatDateTime } from "@/lib/dates";
import type { HrApplicationNote } from "@/services/applications";

type ApplicationNotesPanelProps = {
  applicationId: string;
  notes: HrApplicationNote[];
};

export function ApplicationNotesPanel({
  applicationId,
  notes,
}: ApplicationNotesPanelProps) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const result = await addApplicationNoteAction({
        applicationId,
        body,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.fieldErrors?.body?.[0]) {
        toast.error(result.fieldErrors.body[0]);
        return;
      }

      toast.success("Note added");
      setBody("");
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="note-body">Add note</Label>
          <Textarea
            id="note-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Internal HR note (not visible to candidates)…"
            rows={3}
            disabled={pending}
            required
          />
        </div>
        <Button type="submit" size="sm" disabled={pending || !body.trim()}>
          {pending ? "Saving…" : "Save note"}
        </Button>
      </form>

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-border bg-muted/20 p-3"
            >
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {note.body}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDateTime(note.createdAt)}
                {note.authorName ? ` · ${note.authorName}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
