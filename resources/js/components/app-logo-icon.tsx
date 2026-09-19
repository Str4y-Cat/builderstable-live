import type { SVGAttributes } from 'react';

/**
 * TellMe mark: three itinerary rows, the middle one shortened because it
 * moved, with a notification pulse radiating from it — one change, everyone
 * told.
 *
 * Drawn entirely from FILLED shapes with no explicit `fill`, so they inherit
 * `currentColor`. Every call site passes `fill-current`, and a CSS class beats
 * a `fill="none"` presentation attribute — a stroked mark would render as a
 * solid blob. The pulse is a filled crescent (out along the outer radius, back
 * along the inner one) rather than a stroked arc, for the same reason.
 *
 * Shapes are deliberately chunky: this renders at 20px in the nav and sidebar
 * and at 16px as a favicon, where finer versions turn to mush.
 */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="2.5" y="4" width="4" height="4" rx="1.3" />
            <rect x="2.5" y="10" width="4" height="4" rx="1.3" />
            <rect x="2.5" y="16" width="4" height="4" rx="1.3" />

            <rect x="8.5" y="4.75" width="10" height="2.5" rx="1.25" />
            <rect x="8.5" y="16.75" width="10" height="2.5" rx="1.25" />

            {/* The moved row, cut short to make room for the pulse */}
            <rect x="8.5" y="10.75" width="4" height="2.5" rx="1.25" />

            <circle cx="15.2" cy="12" r="1.7" />
            <path d="M17.55 8.6 A4.3 4.3 0 0 1 17.55 15.4 L16.5 14.1 A2.65 2.65 0 0 0 16.5 9.9 Z" />
        </svg>
    );
}
