import { DemoCtaButtons } from '@/components/landing/demo-cta-buttons';
import { displayTitle } from '@/lib/typography';

export function ClosingCta() {
    return (
        <section className="border-border border-t py-24 sm:py-32">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                <h2 className={displayTitle}>
                    Change it once. Everyone affected knows.
                </h2>
                <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed">
                    The demo runs on a seeded six-person festival shoot across
                    Park City. Move a call time and watch it propagate.
                </p>

                <div className="mt-8">
                    <DemoCtaButtons />
                </div>
            </div>

            <footer className="border-border mx-auto mt-24 max-w-6xl border-t px-4 pt-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <span className="text-sm font-semibold tracking-tight">
                        TellMe
                    </span>
                    <p className="text-muted-foreground text-xs">
                        Itinerary management for crews.
                    </p>
                </div>
            </footer>
        </section>
    );
}
