import {
  ApplicationStatusBadge,
  getApplicationStatusDot,
} from "@/features/applications/components/application-status-badge";
import { formatDateTime } from "@/lib/dates";
import type { HrApplicationStatusEvent } from "@/services/applications";
import { cn } from "@/lib/utils";

type ApplicationStatusHistoryProps = {
  events: HrApplicationStatusEvent[];
};

export function ApplicationStatusHistory({
  events,
}: ApplicationStatusHistoryProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No status history yet.</p>
    );
  }

  return (
    <ol className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className="relative border-l border-border pl-4">
          <span
            className={cn(
              "absolute -left-1.5 top-1.5 size-3 rounded-full ring-2 ring-card",
              getApplicationStatusDot(event.toStatus),
            )}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            {event.fromStatus ? (
              <>
                <ApplicationStatusBadge
                  status={event.fromStatus}
                  className="text-[0.7rem]"
                />
                <span className="text-xs text-muted-foreground">→</span>
                <ApplicationStatusBadge
                  status={event.toStatus}
                  className="text-[0.7rem]"
                />
              </>
            ) : (
              <ApplicationStatusBadge
                status={event.toStatus}
                className="text-[0.7rem]"
              />
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {formatDateTime(event.createdAt)}
            {event.changedByName ? ` · ${event.changedByName}` : " · System"}
          </p>
          {event.note ? (
            <p className="mt-1.5 rounded-lg bg-muted/40 px-2.5 py-1.5 text-sm text-foreground">
              {event.note}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
