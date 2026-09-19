import type { SVGAttributes } from 'react';

type Tone = 'auto' | 'light' | 'dark';

/**
 * TellMe mark: a folded map with a plotted route climbing off the edge into
 * a departing flight — the itinerary, and the trip it becomes.
 *
 * Unlike the app's other icons, this is NOT a single `currentColor` glyph —
 * it's a fixed two-tone mark:
 *   - the map is a constant dark charcoal with a faint light edge, so its
 *     silhouette reads the same sitting on a white page or a black one.
 *   - the route drawn OVER the map is constant white, for contrast against
 *     that dark fill regardless of the surrounding page.
 *   - the route's tail and the departing plane sit OUTSIDE the map, directly
 *     on whatever surrounds it, so THEY adapt: dark on a light page, light on
 *     a dark one.
 *
 * `tone` controls that last part. `auto` (default) follows the app's real
 * light/dark state via Tailwind's `dark:` variant — correct for every call
 * site that sits on the actual page background. Pass `light` or `dark` only
 * where the icon sits on a backdrop that's a fixed color regardless of the
 * app's theme (e.g. a permanently-dark decorative panel) — there, `auto`
 * would follow the page's theme rather than that panel's fixed color.
 */
export default function AppLogoIcon({
    tone = 'auto',
    ...props
}: SVGAttributes<SVGElement> & { tone?: Tone }) {
    const adaptiveFill =
        tone === 'light'
            ? 'fill-[#171717]'
            : tone === 'dark'
              ? 'fill-[#fafafa]'
              : 'fill-[#171717] dark:fill-[#fafafa]';
    const adaptiveStroke =
        tone === 'light'
            ? 'stroke-[#171717]'
            : tone === 'dark'
              ? 'stroke-[#fafafa]'
              : 'stroke-[#171717] dark:stroke-[#fafafa]';

    return (
        <svg {...props} viewBox="0 0 40 32" xmlns="http://www.w3.org/2000/svg">
            {/* Folded map. Fixed dark fill plus a faint light edge, so the
                silhouette still separates from a black page even though its
                own fill is near-black. */}
            <path
                d="M6,15.6 Q6,14 7.4,13.2 L13.6,9.8 Q15,9 16.4,9.8 L22.6,13.2 Q24,14 24,15.6 L24,21.4 Q24,23 22.5,23.7 L16.5,26.4 Q15,27 13.5,26.4 L7.5,23.7 Q6,23 6,21.4 Z"
                fill="#18181b"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="0.5"
            />

            {/* Route across the map — fixed white, always against the dark
                map fill above, never against the page. */}
            <path
                d="M9,22 L13,17 L20,12.5"
                fill="none"
                stroke="#fafafa"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="13" cy="17" r="2.1" fill="#fafafa" />
            <circle cx="13" cy="17" r="1" fill="#18181b" />
            <circle cx="20" cy="12.5" r="2.1" fill="#fafafa" />
            <circle cx="20" cy="12.5" r="1" fill="#18181b" />

            {/* The route's tail and the plane it leads to — outside the map,
                on whatever surrounds it, so these use the adaptive tone. */}
            <path
                d="M20.8,11.8 L26,7"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeDasharray="1.6 1.8"
                className={adaptiveStroke}
            />
            <path
                d="M6,0 L-4,-3.2 L-1.5,-0.6 L-3,0 L-1.5,0.6 L-4,3.2 Z"
                transform="translate(29,7) rotate(-38) scale(1.2)"
                className={adaptiveFill}
            />
        </svg>
    );
}
