import { BrowserFrame } from '@/components/landing/browser-frame';
import { PropagationDemo } from '@/components/landing/propagation-demo';
import { displayTitle } from '@/lib/typography';

export function DemoSection() {
    return (
        <section id="demo" className="scroll-mt-20 py-24 sm:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Solution intro — the pain → product bridge, capped at two sentences */}
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className={displayTitle}>
                        One live itinerary instead of three artifacts.
                    </h2>
                    <p className="text-muted-foreground mt-4 text-lg leading-relaxed sm:text-xl">
                        TellMe replaces the spreadsheet-plus-inbox-plus-PDF
                        routine with a single live itinerary. Change it once —
                        everyone affected finds out automatically.
                    </p>
                </div>

                <div className="mt-14">
                    <BrowserFrame url="tellme.app/dashboard/trips/sundance-2026">
                        <PropagationDemo />
                    </BrowserFrame>
                    <p className="text-muted-foreground mt-4 text-center text-base">
                        A call time moves by 90 minutes. The three travelers
                        attached to it are notified and re-set to pending; the
                        other four aren&rsquo;t touched.
                    </p>
                </div>
            </div>
        </section>
    );
}
