import { HERO_PROGRESS } from '@/components/landing/mock-content';

/**
 * Static twin of `components/itinerary/itinerary-progress.tsx` — the overall
 * task bar plus the vertical step list that sits in the timeline's sticky
 * aside. Buttons are rendered as spans; nothing here is clickable.
 */
export function MockProgressRail() {
    const percent = Math.round(
        (HERO_PROGRESS.done / HERO_PROGRESS.total) * 100,
    );

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Progress
                    </p>
                    <p className="text-muted-foreground text-xs tabular-nums">
                        {HERO_PROGRESS.done}/{HERO_PROGRESS.total}
                    </p>
                </div>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                    <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>

            <ol className="relative space-y-0">
                {HERO_PROGRESS.steps.map((step, index) => (
                    <li
                        key={step.id}
                        className="relative flex gap-2 pb-4 last:pb-0"
                    >
                        {index < HERO_PROGRESS.steps.length - 1 ? (
                            <div className="bg-border absolute top-4 bottom-0 left-[7px] w-px" />
                        ) : null}
                        <span className="relative z-[1] flex min-w-0 flex-1 items-start gap-2 px-1 py-0.5">
                            <span className="border-muted-foreground/50 bg-background mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border-2" />
                            <span className="min-w-0 flex-1 pb-0.5">
                                <span className="block truncate text-xs leading-snug font-medium">
                                    {step.title}
                                </span>
                                <span className="text-muted-foreground mt-0.5 block text-[11px] tabular-nums">
                                    {step.sub}
                                </span>
                            </span>
                        </span>
                    </li>
                ))}
            </ol>
        </div>
    );
}
