import type { SVGAttributes } from 'react';

type Tone = 'auto' | 'light' | 'dark';

/**
 * TellMe mark: a folded map with a plotted route climbing into a departing
 * flight — the itinerary, and the trip it becomes.
 *
 * Fixed two-tone mark (matches favicon):
 *   - map fill is constant charcoal so the silhouette reads on light or dark pages
 *   - route + waypoints + plane are constant white against that dark fill
 *
 * `tone` is accepted for call-site compatibility but unused — the mark no longer
 * has elements that sit outside the map and need page-adaptive coloring.
 */
export default function AppLogoIcon({
    tone: _tone = 'auto',
    ...props
}: SVGAttributes<SVGElement> & { tone?: Tone }) {
    return (
        <svg {...props} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            {/* Folded map: two panels with sharp V peaks */}
            <path
                d="M6.2 10.8
                   L11.6 7.0
                   L16.0 10.2
                   L20.4 7.0
                   L25.8 10.8
                   L25.8 21.2
                   L20.4 25.0
                   L16.0 21.8
                   L11.6 25.0
                   L6.2 21.2
                   Z"
                fill="#3f3f46"
            />
            <path
                d="M16 10.2 L16 21.8"
                stroke="#0a0a0a"
                strokeWidth="1.15"
                strokeLinecap="round"
                opacity="0.5"
            />

            {/* Route */}
            <path
                d="M8.4 21.4 L13.0 16.0 L19.2 13.2 L23.4 9.6"
                fill="none"
                stroke="#fafafa"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Waypoints */}
            <circle cx="13.0" cy="16.0" r="1.9" fill="#fafafa" />
            <circle cx="13.0" cy="16.0" r="0.9" fill="#3f3f46" />
            <circle cx="19.2" cy="13.2" r="1.9" fill="#fafafa" />
            <circle cx="19.2" cy="13.2" r="0.9" fill="#3f3f46" />

            {/* Airplane */}
            <g transform="translate(24.6 8.7) rotate(-42)">
                <path
                    d="M4.8 0
                       L0.2 -1.15
                       L-0.15 -2.55
                       L-0.85 -2.55
                       L-0.55 -1.15
                       L-2.7 -0.55
                       L-2.7 0.55
                       L-0.55 1.15
                       L-0.85 2.55
                       L-0.15 2.55
                       L0.2 1.15
                       Z"
                    fill="#fafafa"
                />
            </g>
        </svg>
    );
}
