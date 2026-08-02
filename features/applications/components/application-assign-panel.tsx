"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { assignApplicationAction } from "@/features/applications/actions/management.actions";
import { cn } from "@/lib/utils";
import type { HrTeamMember } from "@/services/hr-team";

type ApplicationAssignPanelProps = {
  applicationId: string;
  assignedToId: string | null;
  assigneeName: string | null;
  team: HrTeamMember[];
};

export function ApplicationAssignPanel({
  applicationId,
  assignedToId,
  assigneeName,
  team,
}: ApplicationAssignPanelProps) {
  const [value, setValue] = useState(assignedToId ?? "");
  const [pending, startTransition] = useTransition();

  function handleSave() {
    const nextId = value.trim() ? value : null;

    startTransition(async () => {
      const result = await assignApplicationAction({
        applicationId,
        assigneeId: nextId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(nextId ? "Assignee updated" : "Assignee cleared");
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="assigneeId">Assigned HR</Label>
        <select
          id="assigneeId"
          name="assigneeId"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={pending}
          className={cn(
            "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none transition-colors",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35",
          )}
        >
          <option value="">Unassigned</option>
          {team.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName} ({member.email})
            </option>
          ))}
        </select>
        {assigneeName ? (
          <p className="text-xs text-muted-foreground">
            Currently: {assigneeName}
          </p>
        ) : null}
      </div>
      <Button type="button" size="sm" disabled={pending} onClick={handleSave}>
        {pending ? "Saving…" : "Save assignee"}
      </Button>
    </div>
  );
}
