import type { ItineraryItemType } from '@/types/trip';

const badgeClasses: Record<ItineraryItemType, string> = {
    flight: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100',
    accommodation:
        'border-transparent bg-purple-100 text-purple-800 hover:bg-purple-100',
    activity: 'border-transparent bg-green-100 text-green-800 hover:bg-green-100',
    meal: 'border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100',
    transport: 'border-transparent bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
    'call-time':
        'border-transparent bg-orange-100 text-orange-800 hover:bg-orange-100',
    other: 'border-transparent bg-muted text-muted-foreground hover:bg-muted',
};

const labels: Record<ItineraryItemType, string> = {
    flight: 'Flight',
    accommodation: 'Accommodation',
    activity: 'Activity',
    meal: 'Meal',
    transport: 'Transport',
    'call-time': 'Call time',
    other: 'Other',
};

const descriptions: Record<ItineraryItemType, string> = {
    flight: 'Air travel legs — departures, arrivals, connections.',
    accommodation: 'Hotels, housing, or overnight stays.',
    activity: 'General production activity or outing.',
    meal: 'Meals, catering, or hospitality blocks.',
    transport: 'Ground transport — cars, vans, shuttles.',
    'call-time': 'Crew or talent call / report times.',
    other: 'Anything that doesn’t fit the other types.',
};

export function itemTypeBadgeClass(type: ItineraryItemType): string {
    return badgeClasses[type] ?? badgeClasses.other;
}

export function itemTypeLabel(type: ItineraryItemType): string {
    return labels[type] ?? labels.other;
}

export function itemTypeHint(type: ItineraryItemType): string {
    return descriptions[type] ?? descriptions.other;
}

export const ITINERARY_ITEM_TYPES: ItineraryItemType[] = [
    'flight',
    'accommodation',
    'activity',
    'meal',
    'transport',
    'call-time',
    'other',
];
