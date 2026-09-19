import type { ItineraryItemType } from '@/types/trip';

/**
 * Hard-coded slice of the Sundance trip used by the landing page's product
 * visuals. Deliberately NOT read from the database — the marketing page must
 * not depend on app state or require a seeded install to render, and this
 * content needs to stay stable no matter what the demo data does.
 *
 * Names and details mirror `database/seeders/data/mockData.json` so a visitor
 * who clicks through sees the same trip they were just looking at.
 */

export interface MockRow {
    id: string;
    time: string;
    title: string;
    location: string;
    type: ItineraryItemType;
    /** Traveler initials attached to this item. */
    attendees: string[];
}

export const TRIP_NAME = 'Sundance Film Festival 2026';
export const TRIP_DESTINATION = 'Park City, Utah';
export const TRIP_DATES = 'Jan 23 – Jan 28, 2026';

/** The three travelers attached to the call-time item the demo edits. */
export const AFFECTED_TRAVELERS = [
    { id: 'traveler-1', name: 'Marcus Williams', role: 'Director' },
    { id: 'traveler-2', name: 'Rachel Green', role: 'DP' },
    { id: 'traveler-5', name: 'Tom Anderson', role: 'Gaffer' },
] as const;

/** Travelers on the trip who are not attached to that item. */
export const UNAFFECTED_TRAVELERS = [
    { id: 'traveler-3', name: 'Sarah Chen', role: 'Producer' },
    { id: 'traveler-4', name: 'Maya Johnson', role: 'Talent' },
    { id: 'traveler-6', name: 'Lisa Patel', role: '1st AD' },
] as const;

/** Static itinerary used for the hero product shot. */
export const HERO_ROWS: MockRow[] = [
    {
        id: 'item-1',
        time: '08:00',
        title: 'Flight Departure — LAX to SLC',
        location: 'LAX Airport, Terminal 5',
        type: 'flight',
        attendees: ['MW', 'RG', 'SC'],
    },
    {
        id: 'item-2',
        time: '15:30',
        title: 'Shuttle to Park City',
        location: 'SLC Airport Ground Transportation',
        type: 'transport',
        attendees: ['MW', 'RG', 'SC', 'MJ'],
    },
    {
        id: 'item-3',
        time: '17:00',
        title: 'Hotel Check-in',
        location: 'Park City Peaks Hotel',
        type: 'accommodation',
        attendees: ['MW', 'RG', 'SC', 'MJ', 'TA'],
    },
    {
        id: 'item-4',
        time: '19:00',
        title: 'Call Time — Festival Screening Crew',
        location: 'Festival Box Office',
        type: 'call-time',
        attendees: ['MW', 'RG', 'TA'],
    },
];

/** The item the propagation demo edits. */
export const DEMO_ITEM = {
    id: 'item-9',
    originalTime: '06:00',
    updatedTime: '04:30',
    title: 'Call Time — Base Camp',
    location: 'Park City base camp',
    type: 'call-time' as ItineraryItemType,
};

/** Context rows shown above/below the edited item in the demo. */
export const DEMO_CONTEXT_ROWS: MockRow[] = [
    {
        id: 'ctx-1',
        time: '05:15',
        title: 'Van pickup — Peaks Hotel',
        location: 'Hotel lobby',
        type: 'transport',
        attendees: ['MW', 'RG', 'TA'],
    },
    {
        id: 'ctx-2',
        time: '07:30',
        title: 'Breakfast — crew catering',
        location: 'Base camp tent',
        type: 'meal',
        attendees: ['MW', 'RG', 'TA'],
    },
];

/** Share code of the seeded traveler the public "traveler view" CTA opens. */
export const DEMO_SHARE_CODE = 'marcus-sundance';
