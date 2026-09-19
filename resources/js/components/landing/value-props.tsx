import { BellRing, CheckCheck, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { displayTitle, eyebrow } from '@/lib/typography';

/**
 * Each block carries a concrete feature, capability and benefit — no vague
 * "increases efficiency" framing.
 */
const valueProps = [
    {
        icon: BellRing,
        feature: 'Itinerary items linked to affected travelers',
        capability:
            'You edit the item once. TellMe works out which travelers are attached to it and notifies exactly those people — nobody else on the trip gets a message that does not concern them.',
        benefit: 'Stop working out who to call after every schedule change.',
    },
    {
        icon: CheckCheck,
        feature: 'Confirm / decline per traveler, per item',
        capability:
            'Every affected traveler acknowledges in one tap, and you see at a glance who has and has not responded to the change.',
        benefit: 'No more duplicate bookings or conflicting itineraries.',
    },
    {
        icon: Layers,
        feature: 'Trips hold the itinerary and the traveler list together',
        capability:
            'One place to maintain, instead of reconciling a sheet against an inbox against last night’s PDF.',
        benefit: 'Get your evenings back.',
    },
];

export function ValueProps() {
    return (
        <section
            id="value"
            className="border-border bg-muted/30 scroll-mt-20 border-t py-24 sm:py-32"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <p className={eyebrow}>What changes</p>
                    <h2 className={cn(displayTitle, 'mt-4')}>
                        Three things the sheet structurally can&rsquo;t do.
                    </h2>
                </div>

                {/* Asymmetric bento: the lead prop takes the full width, two below */}
                <div className="mt-12 grid gap-4 lg:grid-cols-2">
                    {valueProps.map((prop, index) => (
                        <article
                            key={prop.feature}
                            className={cn(
                                'border-border bg-card flex flex-col rounded-2xl border p-6 sm:p-8',
                                index === 0 && 'lg:col-span-2',
                            )}
                        >
                            <prop.icon className="text-muted-foreground size-5" />

                            {/* feature → capability → benefit, separated by weight not colour */}
                            <p className="text-muted-foreground mt-5 text-[11px] font-medium tracking-wide uppercase">
                                {prop.feature}
                            </p>

                            <h3
                                className={cn(
                                    'mt-2 text-xl leading-snug font-semibold tracking-tight sm:text-2xl',
                                    index === 0 && 'max-w-2xl',
                                )}
                            >
                                {prop.benefit}
                            </h3>

                            <p
                                className={cn(
                                    'text-muted-foreground mt-3 text-sm leading-relaxed',
                                    index === 0 && 'max-w-2xl',
                                )}
                            >
                                {prop.capability}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
