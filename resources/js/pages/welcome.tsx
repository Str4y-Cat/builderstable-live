import { Head } from '@inertiajs/react';
import { ClosingCta } from '@/components/landing/closing-cta';
import { DemoSection } from '@/components/landing/demo-section';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingNav } from '@/components/landing/landing-nav';
import { ProblemSection } from '@/components/landing/problem-section';
import { ValueProps } from '@/components/landing/value-props';

export default function Welcome() {
    return (
        <>
            <Head title="Itinerary management for crews">
                <meta
                    name="description"
                    content="One schedule change. Every traveler notified. TellMe is itinerary management for production and travel coordinators running a crew across a multi-day, multi-city shoot."
                />
            </Head>

            <div className="bg-background min-h-screen">
                <LandingNav />
                <main>
                    <LandingHero />
                    <ProblemSection />
                    <DemoSection />
                    <ValueProps />
                    <ClosingCta />
                </main>
            </div>
        </>
    );
}
