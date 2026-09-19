import { useEffect, useState, type RefObject } from 'react';

/**
 * Reports whether `ref` is currently intersecting the viewport, so a component
 * can avoid animating while nobody is looking at it.
 *
 * Defaults to `true` where IntersectionObserver is unavailable, so content
 * that gates on this stays visible rather than never starting.
 */
export function useInView(
    ref: RefObject<HTMLElement | null>,
    { threshold = 0 }: { threshold?: number } = {},
): boolean {
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        if (typeof IntersectionObserver === 'undefined') {
            setInView(true);

            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setInView(entry?.isIntersecting ?? false);
            },
            { threshold },
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [ref, threshold]);

    return inView;
}
