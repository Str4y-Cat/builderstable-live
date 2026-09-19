import {
    areEventTasksComplete,
    eventTaskProgress,
    isEventTimeElapsed,
    taskProgress,
} from '@/lib/tripHelpers';
import type { ItineraryItem, Trip } from '@/types/trip';

export function ItineraryProgress({
    trip,
    onSelect,
}: {
    trip: Trip;
    onSelect: (item: ItineraryItem) => void;
}) {
    const overall = taskProgress(trip);
    const percent = overall.total
        ? Math.round((overall.done / overall.total) * 100)
        : 0;
    const overallTitle = overall.total
        ? `${overall.done} of ${overall.total} sub-tasks complete (${percent}%)`
        : 'No sub-tasks on this trip yet';

    const steps = [...trip.itinerary]
        .sort(
            (a, b) =>
                a.date.localeCompare(b.date) ||
                (a.time ?? '').localeCompare(b.time ?? '') ||
                a.title.localeCompare(b.title),
        )
        .map((item) => {
            const progress = eventTaskProgress(item);

            return {
                item,
                progress,
                tasksComplete: areEventTasksComplete(item),
                timeElapsed: isEventTimeElapsed(item),
                started: progress.done > 0,
            };
        });

    return (
        <nav className="space-y-4" aria-label="Itinerary task progress">
            <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Progress
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                        {overall.total ? `${overall.done}/${overall.total}` : 'No tasks'}
                    </p>
                </div>
                <div
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                    title={overallTitle}
                    role="progressbar"
                    aria-valuenow={overall.done}
                    aria-valuemin={0}
                    aria-valuemax={overall.total || 0}
                    aria-label={overallTitle}
                >
                    <div
                        className="h-full rounded-full bg-primary transition-[width] duration-300"
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>
            {steps.length ? (
                <ol className="relative space-y-0">
                    {steps.map((step, index) => (
                        <li
                            key={step.item.id}
                            className="relative flex gap-2 pb-4 last:pb-0"
                        >
                            {index < steps.length - 1 ? (
                                <div className="absolute top-4 bottom-0 left-[7px] w-px bg-border" />
                            ) : null}
                            <button
                                type="button"
                                className={`relative z-[1] flex min-w-0 flex-1 items-start gap-2 rounded-md px-1 py-0.5 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring ${
                                    step.tasksComplete
                                        ? 'ring-2 ring-foreground ring-offset-1 ring-offset-background'
                                        : ''
                                }`}
                                onClick={() => onSelect(step.item)}
                            >
                                <span
                                    className={`mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border-2 bg-background ${dotClass(step)}`}
                                />
                                <span className="min-w-0 flex-1 pb-0.5">
                                    <span
                                        className={`block truncate text-xs leading-snug font-medium ${
                                            step.timeElapsed
                                                ? 'text-muted-foreground line-through'
                                                : ''
                                        }`}
                                    >
                                        {step.item.title}
                                    </span>
                                    <span className="mt-0.5 block text-[11px] text-muted-foreground tabular-nums">
                                        {step.progress.total
                                            ? `${step.progress.done}/${step.progress.total}`
                                            : 'No sub-tasks'}
                                        {step.tasksComplete ? ' · tasks done' : ''}
                                        {step.timeElapsed ? ' · elapsed' : ''}
                                    </span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="text-xs text-muted-foreground">No events yet</p>
            )}
        </nav>
    );
}

function dotClass(step: {
    tasksComplete: boolean;
    started: boolean;
    timeElapsed: boolean;
    progress: { total: number };
}): string {
    if (step.tasksComplete) {
        return 'border-foreground bg-foreground';
    }

    if (step.timeElapsed) {
        return 'border-foreground/70 bg-foreground/40';
    }

    if (step.started) {
        return 'border-primary';
    }

    if (!step.progress.total) {
        return 'border-muted-foreground/30';
    }

    return 'border-muted-foreground/50';
}
