import type { ItineraryItemType } from '@/types/trip';

/**
 * Hard-coded slice of the Sundance trip used by the landing page's product
 * visuals. Deliberately NOT read from the database — the marketing page must
 * not depend on app state or require a seeded install to render, and this
 * content needs to stay stable no matter what the demo data does.
 *
 * Values mirror `database/seeders/data/mockData.json` (trip `trip-1`) so a
 * visitor who clicks through sees the same trip they were just looking at.
 * The components that render this data mirror the real itinerary components —
 * see the header comment on `mock-itinerary-row.tsx`.
 */

export interface MockTraveler {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface MockRow {
    id: string;
    /** Rendered as the first half of the row's `time · location` meta line. */
    time: string;
    title: string;
    location: string;
    type: ItineraryItemType;
    /** Ids into AFFECTED_TRAVELERS / UNAFFECTED_TRAVELERS. */
    assignedIds: string[];
    tasks?: { done: number; total: number };
    rollup?: { confirmed: number; declined: number; pending: number };
}

export const TRIP_NAME = 'Sundance Film Festival 2026';
export const TRIP_DESTINATION = 'Park City, Utah';
/** Matches `formatDateRangeLabel()`'s output for the seeded trip. */
export const TRIP_DATES = 'Jan 23, 2026 – Jan 29, 2026';
export const TRIP_TRAVELER_COUNT = 7;
export const TRIP_EVENT_COUNT = 15;

/** The three travelers attached to the call-time item the demo edits. */
export const AFFECTED_TRAVELERS: MockTraveler[] = [
    {
        id: 'traveler-1',
        name: 'Marcus Williams',
        email: 'marcus.w@framelightmedia.com',
        role: 'Director',
    },
    {
        id: 'traveler-2',
        name: 'Rachel Green',
        email: 'rachel.green@framelightmedia.com',
        role: 'DP',
    },
    {
        id: 'traveler-5',
        name: 'Tom Anderson',
        email: 'tom.anderson@framelightmedia.com',
        role: 'Gaffer',
    },
];

/** Travelers on the trip who are not attached to that item. */
export const UNAFFECTED_TRAVELERS: MockTraveler[] = [
    {
        id: 'traveler-3',
        name: 'Sarah Chen',
        email: 'sarah.chen@framelightmedia.com',
        role: 'Producer',
    },
    {
        id: 'traveler-4',
        name: 'Maya Johnson',
        email: 'maya.j@framelightmedia.com',
        role: 'Talent',
    },
    {
        id: 'traveler-6',
        name: 'Lisa Patel',
        email: 'lisa.patel@framelightmedia.com',
        role: '1st AD',
    },
    {
        id: 'traveler-7',
        name: 'Alex Rivera',
        email: 'alex.r@framelightmedia.com',
        role: 'Sound Mixer',
    },
];

export const ALL_TRAVELERS: MockTraveler[] = [
    ...AFFECTED_TRAVELERS,
    ...UNAFFECTED_TRAVELERS,
];

export function travelersByIds(ids: string[]): MockTraveler[] {
    return ALL_TRAVELERS.filter((traveler) => ids.includes(traveler.id));
}

/** Day label in the timeline's format: weekday, short month, day, year. */
export const HERO_DAY_LABEL = 'Friday, Jan 23, 2026';

/** Static itinerary used for the hero product shot. */
export const HERO_ROWS: MockRow[] = [
    {
        id: 'item-1',
        time: '08:00',
        title: 'Flight Departure — LAX to SLC',
        location: 'LAX Airport, Terminal 5',
        type: 'flight',
        assignedIds: ['traveler-1', 'traveler-2', 'traveler-3'],
        rollup: { confirmed: 2, declined: 0, pending: 1 },
    },
    {
        id: 'item-2',
        time: '15:30',
        title: 'Shuttle to Park City',
        location: 'SLC Airport Ground Transportation',
        type: 'transport',
        assignedIds: [],
    },
    {
        id: 'item-3',
        time: '17:00',
        title: 'Hotel Check-in',
        location: 'Park City Peaks Hotel',
        type: 'accommodation',
        assignedIds: ['traveler-1', 'traveler-5'],
        tasks: { done: 2, total: 3 },
        rollup: { confirmed: 2, declined: 0, pending: 0 },
    },
    {
        id: 'item-4',
        time: '19:00',
        title: 'Call Time — Festival Screening Crew',
        location: 'Festival Box Office',
        type: 'call-time',
        assignedIds: ['traveler-1', 'traveler-2', 'traveler-5'],
        tasks: { done: 1, total: 3 },
        rollup: { confirmed: 1, declined: 0, pending: 2 },
    },
];

/**
 * Steps shown in the hero's static copy of the sticky progress rail.
 * `done`/`total` match the seeded trip's real task count.
 */
export const HERO_PROGRESS = {
    done: 3,
    total: 19,
    steps: [
        {
            id: 'item-1',
            title: 'Flight Departure — LAX to SLC',
            sub: 'No sub-tasks',
        },
        { id: 'item-2', title: 'Shuttle to Park City', sub: 'No sub-tasks' },
        { id: 'item-3', title: 'Hotel Check-in', sub: '2/3' },
        {
            id: 'item-4',
            title: 'Call Time — Festival Screening Crew',
            sub: '1/3',
        },
    ],
};

/** The item the propagation demo edits. */
export const DEMO_ITEM = {
    id: 'item-9',
    originalTime: '06:00',
    updatedTime: '04:30',
    title: 'Call Time — Base Camp',
    location: 'Park City base camp',
    type: 'call-time' as ItineraryItemType,
};

export const DEMO_DAY_LABEL = 'Sunday, Jan 25, 2026';

/** Context rows shown above/below the edited item in the demo. */
export const DEMO_CONTEXT_ROWS: MockRow[] = [
    {
        id: 'ctx-1',
        time: '05:15',
        title: 'Van pickup — Peaks Hotel',
        location: 'Hotel lobby',
        type: 'transport',
        assignedIds: ['traveler-1', 'traveler-2', 'traveler-5'],
    },
    {
        id: 'ctx-2',
        time: '07:30',
        title: 'Breakfast — crew catering',
        location: 'Base camp tent',
        type: 'meal',
        assignedIds: ['traveler-1', 'traveler-2', 'traveler-5'],
    },
];

/** Share code of the seeded traveler the public "traveler view" CTA opens. */
export const DEMO_SHARE_CODE = 'marcus-sundance';
