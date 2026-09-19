import { Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { DEMO_SHARE_CODE } from '@/components/landing/mock-content';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';
import { share } from '@/routes/trips';

/**
 * The hero and closing CTAs are the same pair, so they live here and can't
 * drift apart.
 *
 * The curator demo sits behind auth, so signed-out visitors are sent to the
 * sign-in page rather than bounced there by the middleware. The traveler view
 * is a genuinely public share route and always links straight through.
 */
export function DemoCtaButtons() {
    const { auth } = usePage().props;

    return (
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={auth.user ? dashboard() : login()}>
                    {auth.user
                        ? 'Open the curator demo'
                        : 'Sign in to the demo'}
                    <ArrowRight className="ml-1.5 size-4" />
                </Link>
            </Button>
            <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
            >
                <Link href={share(DEMO_SHARE_CODE)}>
                    See a traveler&rsquo;s view
                </Link>
            </Button>
        </div>
    );
}
