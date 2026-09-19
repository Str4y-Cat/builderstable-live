import type { TripBadge, TripTag } from '@/types/trip';

export const tripBadgeLabel: Record<TripBadge, string> = {
    planning: 'Planning',
    locked: 'Locked',
    'on-hold': 'On hold',
    wrap: 'Wrap',
};

export const tripBadgeClass: Record<TripBadge, string> = {
    planning: 'border-transparent bg-sky-100 text-sky-900 hover:bg-sky-100',
    locked: 'border-transparent bg-violet-100 text-violet-900 hover:bg-violet-100',
    'on-hold': 'border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100',
    wrap: 'border-transparent bg-emerald-100 text-emerald-900 hover:bg-emerald-100',
};

export const tripTagLabel: Record<TripTag, string> = {
    festival: 'Festival',
    commercial: 'Commercial',
    documentary: 'Documentary',
    'post-production': 'Post-production',
    market: 'Market',
    'multi-city': 'Multi-city',
};
