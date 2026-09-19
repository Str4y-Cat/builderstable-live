import { Bell, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MockAvatar } from '@/components/landing/mock-avatar';
import { MockItineraryRow } from '@/components/landing/mock-itinerary-row';
import {
    AFFECTED_TRAVELERS,
    DEMO_CONTEXT_ROWS,
    DEMO_ITEM,
    TRIP_DESTINATION,
    TRIP_NAME,
    UNAFFECTED_TRAVELERS,
} from '@/components/landing/mock-content';
import { Badge } from '@/components/ui/badge';
import { useInView } from '@/hooks/use-in-view';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { itemTypeBadgeClass, itemTypeLabel } from '@/lib/itemTypeStyles';
import { initials } from '@/lib/tripHelpers';
import { cn } from '@/lib/utils';

type Phase = 'idle' | 'edit' | 'propagate' | 'notify' | 'confirm' | 'hold';

/** Phase order and how long each one holds, in ms. Total ≈ 18s. */
const SCRIPT: ReadonlyArray<{ phase: Phase; duration: number }> = [
    { phase: 'idle', duration: 2000 },
    { phase: 'edit', duration: 3000 },
    { phase: 'propagate', duration: 3000 },
    { phase: 'notify', duration: 3000 },
    { phase: 'confirm', duration: 4000 },
    { phase: 'hold', duration: 3000 },
];

function phaseIndex(phase: Phase): number {
    return SCRIPT.findIndex((entry) => entry.phase === phase);
}

const enterFade = 'animate-in fade-in duration-500 motion-reduce:animate-none';
const enterSlide =
    'animate-in fade-in slide-in-from-bottom-3 duration-500 motion-reduce:animate-none';

/**
 * Self-running recreation of the core loop: edit -> auto-notify -> confirm.
 * Built from the app's real tokens and badge helpers so it cannot drift from
 * the product's actual look.
 *
 * SWAP POINT: if a real screen recording lands later, replace this component's
 * root with a <video autoPlay loop muted playsInline /> and nothing in the
 * surrounding section needs to change.
 */
export function PropagationDemo() {
    const rootRef = useRef<HTMLDivElement>(null);
    const inView = useInView(rootRef, { threshold: 0.2 });
    const prefersReduced = usePrefersReducedMotion();
    const [step, setStep] = useState(0);

    // Re-entering the viewport restarts from the top, so the sequence is
    // always watched in order rather than resumed mid-way.
    useEffect(() => {
        if (inView) {
            setStep(0);
        }
    }, [inView]);

    // One timer per step. The cleanup clears it, which is also what pauses the
    // loop off-screen and under reduced motion.
    useEffect(() => {
        if (!inView || prefersReduced) {
            return;
        }

        const timer = setTimeout(() => {
            setStep((current) => (current + 1) % SCRIPT.length);
        }, SCRIPT[step].duration);

        return () => {
            clearTimeout(timer);
        };
    }, [step, inView, prefersReduced]);

    const phase = SCRIPT[step].phase;

    function atOrAfter(target: Phase): boolean {
        // When reduced motion is on, render the settled end state, no animation.
        if (prefersReduced) {
            return true;
        }

        return phaseIndex(phase) >= phaseIndex(target);
    }

    const isEditing = !prefersReduced && phase === 'edit';
    const timeChanged = atOrAfter('edit');
    const travelersLit = atOrAfter('propagate');
    const notificationVisible = atOrAfter('notify');
    const confirmPressed = !prefersReduced && phase === 'confirm';
    const hasConfirmed = atOrAfter('hold');

    const displayTime = timeChanged
        ? DEMO_ITEM.updatedTime
        : DEMO_ITEM.originalTime;

    // The edit resets every affected traveler to pending; one has re-confirmed
    // by the 'hold' phase.
    const confirmedCount = prefersReduced
        ? 1
        : !timeChanged
          ? AFFECTED_TRAVELERS.length
          : hasConfirmed
            ? 1
            : 0;

    return (
        <div
            ref={rootRef}
            className="grid items-start gap-4 p-4 sm:p-6 lg:grid-cols-[1.45fr_1fr] lg:gap-6"
        >
            {/* ── Curator pane ─────────────────────────────────────────── */}
            <div className="min-w-0 space-y-4">
                <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                            {TRIP_NAME}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                            Day 3 · {TRIP_DESTINATION}
                        </p>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs">
                        Curator view
                    </span>
                </div>

                <div className="space-y-1">
                    <MockItineraryRow
                        time={DEMO_CONTEXT_ROWS[0].time}
                        title={DEMO_CONTEXT_ROWS[0].title}
                        location={DEMO_CONTEXT_ROWS[0].location}
                        type={DEMO_CONTEXT_ROWS[0].type}
                        attendees={DEMO_CONTEXT_ROWS[0].attendees}
                    />

                    {/* The edited item */}
                    <div
                        className={cn(
                            'rounded-xl border px-3 py-3 transition-all duration-500',
                            isEditing
                                ? 'border-foreground/25 bg-muted/70 shadow-sm'
                                : 'border-transparent',
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-12 shrink-0 pt-0.5">
                                <span
                                    className={cn(
                                        'inline-block font-mono text-xs font-semibold tabular-nums transition-all duration-500',
                                        timeChanged
                                            ? 'scale-105 text-orange-700'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {displayTime}
                                </span>
                            </div>

                            <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        className={itemTypeBadgeClass(
                                            DEMO_ITEM.type,
                                        )}
                                    >
                                        {itemTypeLabel(DEMO_ITEM.type)}
                                    </Badge>
                                    {timeChanged && (
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 text-[11px] font-medium text-orange-700',
                                                enterFade,
                                            )}
                                        >
                                            <span className="size-1.5 rounded-full bg-orange-500" />
                                            Updated
                                        </span>
                                    )}
                                </div>
                                <p className="truncate text-sm leading-snug font-medium">
                                    {DEMO_ITEM.title}
                                </p>
                                <p className="text-muted-foreground truncate text-xs">
                                    {DEMO_ITEM.location}
                                </p>
                            </div>
                        </div>

                        {/* Affected travelers + rollup */}
                        <div className="border-border/70 mt-3 space-y-2 border-t pt-3 pl-15">
                            <div className="flex flex-wrap items-center gap-1.5">
                                {AFFECTED_TRAVELERS.map((person) => (
                                    <span
                                        key={person.id}
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs transition-all duration-500',
                                            travelersLit
                                                ? 'border-foreground/25 bg-background text-foreground font-medium'
                                                : 'bg-muted text-muted-foreground border-transparent',
                                        )}
                                    >
                                        <MockAvatar
                                            label={initials(person.name)}
                                            active={travelersLit}
                                        />
                                        {person.name}
                                    </span>
                                ))}
                            </div>

                            <p className="text-muted-foreground text-xs">
                                <span className="text-foreground font-semibold tabular-nums">
                                    {confirmedCount}
                                </span>{' '}
                                of{' '}
                                <span className="text-foreground font-semibold tabular-nums">
                                    {AFFECTED_TRAVELERS.length}
                                </span>{' '}
                                confirmed
                                <span className="text-border mx-1">·</span>
                                <span className="text-foreground font-semibold tabular-nums">
                                    {AFFECTED_TRAVELERS.length - confirmedCount}
                                </span>{' '}
                                pending
                            </p>
                        </div>
                    </div>

                    <MockItineraryRow
                        time={DEMO_CONTEXT_ROWS[1].time}
                        title={DEMO_CONTEXT_ROWS[1].title}
                        location={DEMO_CONTEXT_ROWS[1].location}
                        type={DEMO_CONTEXT_ROWS[1].type}
                        attendees={DEMO_CONTEXT_ROWS[1].attendees}
                    />
                </div>

                {/* Unaffected travelers stay deliberately quiet */}
                <div className="bg-muted/40 flex items-center gap-2 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground text-[11px]">
                        Not on this item:
                    </span>
                    <div className="flex -space-x-1.5">
                        {UNAFFECTED_TRAVELERS.map((person) => (
                            <MockAvatar
                                key={person.id}
                                label={initials(person.name)}
                            />
                        ))}
                    </div>
                    <span className="text-muted-foreground ml-auto text-[11px]">
                        Not notified
                    </span>
                </div>
            </div>

            {/* ── Traveler pane ────────────────────────────────────────── */}
            <div className="min-w-0">
                <div className="border-foreground/90 bg-background mx-auto flex max-w-[280px] flex-col overflow-hidden rounded-[1.75rem] border-[6px]">
                    <div className="bg-foreground/90 flex items-center justify-between px-4 pb-2">
                        <span className="text-background/70 text-[10px] font-medium">
                            9:41
                        </span>
                        <span className="text-background/70 text-[10px] font-medium">
                            TellMe
                        </span>
                    </div>

                    {/* min-height keeps the frame from resizing as the notification enters */}
                    <div className="min-h-[248px] space-y-3 p-3">
                        <div>
                            <p className="text-xs font-semibold">
                                {AFFECTED_TRAVELERS[0].name}
                            </p>
                            <p className="text-muted-foreground text-[11px]">
                                {AFFECTED_TRAVELERS[0].role} · Day 3
                            </p>
                        </div>

                        {notificationVisible ? (
                            <div
                                className={cn(
                                    'border-foreground/20 bg-muted/50 space-y-2.5 rounded-xl border p-3',
                                    enterSlide,
                                )}
                            >
                                <div className="flex items-center gap-1.5">
                                    <Bell className="size-3 text-orange-600" />
                                    <span className="text-[11px] font-semibold text-orange-700">
                                        Schedule change
                                    </span>
                                </div>

                                <p className="text-xs leading-snug font-medium">
                                    {DEMO_ITEM.title}
                                </p>
                                <p className="text-muted-foreground text-[11px] leading-snug">
                                    Moved{' '}
                                    <span className="line-through">
                                        {DEMO_ITEM.originalTime}
                                    </span>{' '}
                                    →{' '}
                                    <span className="text-foreground font-semibold">
                                        {DEMO_ITEM.updatedTime}
                                    </span>
                                </p>

                                {hasConfirmed ? (
                                    <div
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-md bg-emerald-100 px-2 py-1.5',
                                            enterFade,
                                        )}
                                    >
                                        <Check className="size-3 text-emerald-700" />
                                        <span className="text-[11px] font-medium text-emerald-800">
                                            Confirmed
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex gap-1.5 pt-0.5">
                                        <span
                                            className={cn(
                                                'flex-1 rounded-md px-2 py-1.5 text-center text-[11px] font-medium transition-all duration-300',
                                                confirmPressed
                                                    ? 'bg-foreground/80 text-background scale-95'
                                                    : 'bg-foreground text-background',
                                            )}
                                        >
                                            Confirm
                                        </span>
                                        <span className="border-border text-muted-foreground flex-1 rounded-md border px-2 py-1.5 text-center text-[11px] font-medium">
                                            Decline
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="border-border rounded-xl border border-dashed p-4 text-center">
                                <p className="text-muted-foreground text-[11px]">
                                    Itinerary up to date
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
