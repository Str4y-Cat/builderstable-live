import { FileSpreadsheet, FileText, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { displayTitle, eyebrow } from '@/lib/typography';

const artifacts = [
    {
        icon: FileSpreadsheet,
        title: 'The shared sheet',
        body: 'Flights, hotels and rental cars in a Google Sheet that four people edit and nobody owns.',
    },
    {
        icon: Inbox,
        title: 'The shared inbox',
        body: 'travel+projectname@gmail.com — every booking confirmation, buried under every other booking confirmation.',
    },
    {
        icon: FileText,
        title: 'The nightly call sheet',
        body: 'Assembled by hand each evening from the other two, and out of date by the time it sends.',
    },
];

export function ProblemSection() {
    return (
        /* `dark` flips the existing token set for this band — no new brand
           colours. The .dark rule is a plain class selector, so the custom
           properties are redefined on this element and its subtree. */
        <section
            id="problem"
            className="dark bg-background text-foreground scroll-mt-20 py-24 sm:py-32"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <p className={eyebrow}>The current workflow</p>
                    <h2 className={cn(displayTitle, 'mt-4')}>
                        Three artifacts, kept in sync by hand.
                    </h2>
                    <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                        Every production travel desk runs the same stack. None
                        of the three pieces knows the other two exist.
                    </p>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-3">
                    {artifacts.map((artifact) => (
                        <div
                            key={artifact.title}
                            className="border-border bg-card rounded-2xl border p-5"
                        >
                            <artifact.icon className="text-muted-foreground size-5" />
                            <h3 className="mt-4 text-sm font-semibold">
                                {artifact.title}
                            </h3>
                            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                                {artifact.body}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="border-border mt-12 grid gap-8 border-t pt-12 lg:grid-cols-2">
                    <div>
                        <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                            Then the schedule moves.
                        </h3>
                        <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                            Weather, permits, a talent conflict — the shooting
                            schedule changes several times a day. Nothing
                            propagates. You work out who&rsquo;s affected from
                            the sheet, then re-notify each of them by hand, one
                            message at a time, while the next change is already
                            landing.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="border-border bg-card rounded-2xl border p-5">
                            <p className={eyebrow}>What it costs you</p>
                            <p className="mt-3 text-sm leading-relaxed">
                                Duplicate bookings. Two people on conflicting
                                itineraries. A driver waiting at a pickup nobody
                                moved.
                            </p>
                        </div>
                        <div className="border-border bg-card rounded-2xl border p-5">
                            <p className={eyebrow}>Today&rsquo;s patch</p>
                            <p className="mt-3 text-sm leading-relaxed">
                                Make one person the single point of contact — a
                                people-patch that holds right up until that
                                person is on a plane.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
