import { usePage } from '@inertiajs/react';
import { BrowserFrame } from '@/components/landing/browser-frame';
import { DemoCtaButtons } from '@/components/landing/demo-cta-buttons';
import { HeroProductShot } from '@/components/landing/hero-product-shot';
import { cn } from '@/lib/utils';
import { heroTitle } from '@/lib/typography';

export function LandingHero() {
    const { auth } = usePage().props;

    return (
        <section className="landing-hero-bg relative overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-28">
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="border-border bg-background text-muted-foreground inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
                        Itinerary management for crews
                    </span>

                    <h1 className={cn(heroTitle, 'mt-6')}>
                        One schedule change.
                        <br className="hidden sm:block" /> Every traveler
                        notified.
                    </h1>

                    <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
                        For production and travel coordinators running a 5–20
                        person crew across a multi-day, multi-city shoot.
                    </p>

                    <div className="mt-8">
                        <DemoCtaButtons />
                    </div>

                    <p className="text-muted-foreground mt-4 text-xs">
                        {auth.user
                            ? 'Both views open on a seeded production trip.'
                            : 'The traveler view opens with no sign-in. Curator demo: test@example.com / password.'}
                    </p>
                </div>

                {/* Product shot is cropped so it bleeds past the viewport edge,
                    then fades into the page background rather than ending on a
                    hard line. */}
                <div className="relative mt-14 max-h-[440px] overflow-hidden sm:mt-16">
                    <BrowserFrame url="tellme.app/dashboard/trips/sundance-2026">
                        <HeroProductShot />
                    </BrowserFrame>
                    <div
                        className="from-background via-background/85 pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent"
                        aria-hidden="true"
                    />
                </div>
            </div>
        </section>
    );
}
