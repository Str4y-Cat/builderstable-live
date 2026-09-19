import type { SVGAttributes } from 'react';

/**
 * TellMe mark: three itinerary rows where the middle one has moved, with the
 * notification dot that follows it.
 *
 * Drawn as filled shapes with no explicit `fill`, because every call site
 * passes `fill-current` — a stroked mark would be overridden into a blob.
 */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="3.5" height="3.5" rx="1.2" />
            <rect x="8" y="4.75" width="14" height="2" rx="1" />

            <rect x="2" y="10.25" width="3.5" height="3.5" rx="1.2" />
            <rect x="8" y="11" width="8" height="2" rx="1" />
            <circle cx="20" cy="12" r="2" />

            <rect x="2" y="16.5" width="3.5" height="3.5" rx="1.2" />
            <rect x="8" y="17.25" width="14" height="2" rx="1" />
        </svg>
    );
}
