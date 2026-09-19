import type { ReactNode } from 'react';
import { MockAvatar } from '@/components/landing/mock-avatar';
import type { MockTraveler } from '@/components/landing/mock-content';
import { Badge } from '@/components/ui/badge';
import { itemTypeBadgeClass, itemTypeLabel } from '@/lib/itemTypeStyles';
import { initials } from '@/lib/tripHelpers';
import { cn } from '@/lib/utils';
import type { ItineraryItemType } from '@/types/trip';

/**
 * Static twin of `components/itinerary/itinerary-item-card.tsx`.
 *
 * Structure and classes are copied from that component so the landing page
 * shows the itinerary a visitor will actually get. What is deliberately left
 * out is the interactive chrome — the Notify/Edit/Delete buttons, the trailing
 * ChevronRight, and `role="button"`/`tabIndex`/`onClick` — because a marketing
 * image should not be focusable or advertise affordances that do nothing.
 *
 * If the real card's layout changes, change this to match.
 */
export function MockItineraryRow({
    time,
    title,
    location,
    type,
    assigned = [],
    tasks,
    rollup,
    highlighted = false,
    updated = false,
    timeSlot,
}: {
    time: string;
    title: string;
    location: string;
    type: ItineraryItemType;
    assigned?: MockTraveler[];
    tasks?: { done: number; total: number };
    rollup?: { confirmed: number; declined: number; pending: number };
    /** Row is the focus of the demo's current phase. */
    highlighted?: boolean;
    /** Show the "Updated" badge. */
    updated?: boolean;
    /**
     * Overrides the time half of the meta line, so the propagation demo can
     * emphasise the time as it changes. Falls back to plain `time`.
     */
    timeSlot?: ReactNode;
}) {
    return (
        <article
            className={cn(
                'space-y-3 px-4 py-4 transition-colors duration-300',
                highlighted && 'bg-muted/50 ring-primary/20 ring-2 ring-inset',
            )}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={itemTypeBadgeClass(type)}>
                            {itemTypeLabel(type)}
                        </Badge>
                        {updated ? (
                            <Badge
                                variant="outline"
                                className="animate-in fade-in duration-500 motion-reduce:animate-none"
                            >
                                Updated
                            </Badge>
                        ) : null}
                        {tasks ? (
                            <Badge variant="secondary">
                                {tasks.done}/{tasks.total}
                            </Badge>
                        ) : null}
                    </div>
                    <h3 className="leading-snug font-medium">{title}</h3>
                    <p className="text-muted-foreground text-sm">
                        {timeSlot ?? time} · {location}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-xs font-medium">
                    Assigned
                </span>
                {assigned.length === 0 ? (
                    <Badge variant="secondary">All travelers</Badge>
                ) : (
                    assigned.map((traveler) => (
                        <div
                            key={traveler.id}
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs transition-all duration-500',
                                highlighted &&
                                    'border-foreground/25 bg-background font-medium',
                            )}
                        >
                            <MockAvatar
                                label={initials(traveler.name)}
                                active={highlighted}
                            />
                            {traveler.name}
                        </div>
                    ))
                )}
            </div>

            {rollup ? (
                <p className="text-muted-foreground text-sm">
                    <span className="text-foreground font-semibold">
                        {rollup.confirmed}
                    </span>{' '}
                    confirmed
                    <span className="text-border mx-1.5">·</span>
                    <span className="text-foreground font-semibold">
                        {rollup.declined}
                    </span>{' '}
                    declined
                    <span className="text-border mx-1.5">·</span>
                    <span className="text-foreground font-semibold">
                        {rollup.pending}
                    </span>{' '}
                    pending
                </p>
            ) : null}
        </article>
    );
}

/**
 * Day group wrapper, matching `itinerary-timeline.tsx`.
 */
export function MockDayGroup({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-2">
            <h3 className="text-muted-foreground text-sm font-semibold">
                {label}
            </h3>
            <div className="divide-y rounded-lg border">{children}</div>
        </section>
    );
}
