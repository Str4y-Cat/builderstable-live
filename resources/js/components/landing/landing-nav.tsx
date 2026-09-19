import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboard, home, login } from '@/routes';

const links = [
    { href: '#problem', label: 'The problem' },
    { href: '#demo', label: 'How it works' },
    { href: '#value', label: 'Why it holds' },
];

export function LandingNav() {
    const { auth } = usePage().props;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 24);
        }

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-all duration-300',
                scrolled
                    ? 'border-border bg-background/80 border-b backdrop-blur-md'
                    : 'border-b border-transparent',
            )}
        >
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Link
                    href={home()}
                    className="text-base font-semibold tracking-tight transition-opacity hover:opacity-70"
                >
                    TellMe
                </Link>

                <div className="hidden items-center gap-1 md:flex">
                    {links.map((link) => (
                        /* Plain anchors: Inertia only intercepts <Link>, so
                           these keep native in-page hash scrolling. */
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <Button asChild size="sm">
                    <Link href={auth.user ? dashboard() : login()}>
                        {auth.user ? 'Open the demo' : 'Sign in'}
                    </Link>
                </Button>
            </nav>
        </header>
    );
}
