import type {
    DerivedDateRange,
    Document,
    EntryResponse,
    ItineraryItem,
    ResponseRollup,
    ResponseStatus,
    Traveler,
    Trip,
    TripDetail,
    TripStatus,
    TripSummary,
} from '@/types/trip';
import { TRIP_DESCRIPTION_MAX } from '@/types/trip';

const RECENT_MS = 72 * 60 * 60 * 1000;

export function composeTrip(
    trip: TripDetail,
    itinerary: ItineraryItem[],
    travelers: Traveler[],
    documents: Document[],
    responses: EntryResponse[],
): Trip {
    return {
        ...trip,
        itinerary,
        travelers,
        documents,
        responses,
    };
}

export function initials(name: string): string {
    return name
        .split(/\s+/)
        .map((part) => part[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

export function isRecentlyUpdated(
    item: ItineraryItem,
    travelerResponse?: EntryResponse | null,
): boolean {
    if (!item.lastUpdatedAt) {
        return false;
    }

    const updatedAt = new Date(item.lastUpdatedAt).getTime();

    if (Number.isNaN(updatedAt)) {
        return false;
    }

    if (Date.now() - updatedAt <= RECENT_MS) {
        return true;
    }

    return travelerResponse?.status === 'pending';
}

export function displayDateRange(
    trip: Pick<TripDetail, 'dateRange'> | TripSummary,
): DerivedDateRange {
    return trip.dateRange;
}

export function formatDateRangeLabel(
    trip: Pick<TripDetail, 'dateRange'> | TripSummary,
): string {
    const { startDate, endDate } = displayDateRange(trip);

    if (!startDate || !endDate) {
        return 'Dates TBD';
    }

    const formatter = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return `${formatter.format(new Date(startDate))} – ${formatter.format(new Date(endDate))}`;
}

export function isDateRangeDerived(trip: Trip): boolean {
    return trip.itinerary.some((item) => Boolean(item.date));
}

export function tripStatus(
    trip: Pick<TripDetail, 'dateRange'> | TripSummary,
    now: Date = new Date(),
): TripStatus {
    const { startDate, endDate } = displayDateRange(trip);

    if (!startDate || !endDate) {
        return 'upcoming';
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);

    if (now < start) {
        return 'upcoming';
    }

    if (now > endOfDay) {
        return 'past';
    }

    return 'ongoing';
}

export function eventTaskProgress(item: ItineraryItem): {
    done: number;
    total: number;
} {
    const total = item.tasks.length;
    const done = item.tasks.filter((task) => task.done).length;

    return { done, total };
}

export function areEventTasksComplete(item: ItineraryItem): boolean {
    const { done, total } = eventTaskProgress(item);

    return total > 0 && done === total;
}

export function eventEndsAt(item: ItineraryItem): Date {
    const end = new Date(`${item.date}T00:00:00`);

    if (item.time && /^\d{1,2}:\d{2}$/.test(item.time)) {
        const [hours, minutes] = item.time.split(':').map(Number);
        end.setHours(hours ?? 0, minutes ?? 0, 0, 0);

        return end;
    }

    end.setHours(23, 59, 59, 999);

    return end;
}

export function isEventTimeElapsed(
    item: ItineraryItem,
    now: Date = new Date(),
): boolean {
    return now.getTime() >= eventEndsAt(item).getTime();
}

export function taskProgress(trip: Trip): { done: number; total: number } {
    let done = 0;
    let total = 0;

    for (const item of trip.itinerary) {
        const progress = eventTaskProgress(item);
        done += progress.done;
        total += progress.total;
    }

    return { done, total };
}

export function clampTripDescription(value: string): string {
    return value.slice(0, TRIP_DESCRIPTION_MAX);
}

export function affectedTravelers(trip: Trip, item: ItineraryItem): Traveler[] {
    if (!item.assignedTravelerIds.length) {
        return trip.travelers;
    }

    const idSet = new Set(item.assignedTravelerIds);

    return trip.travelers.filter((traveler) => idSet.has(traveler.id));
}

export function newlyAssignedTravelerIds(
    previousIds: number[] | undefined,
    nextIds: number[],
    allTravelerIds: number[],
): number[] {
    const nextEffective = nextIds.length === 0 ? allTravelerIds : nextIds;

    if (previousIds === undefined) {
        return [...nextEffective];
    }

    const prevEffective = new Set(
        previousIds.length === 0 ? allTravelerIds : previousIds,
    );

    return nextEffective.filter((id) => !prevEffective.has(id));
}

export function documentAssignees(trip: Trip, doc: Document): Traveler[] {
    if (!doc.assignedTravelerIds.length) {
        return trip.travelers;
    }

    const idSet = new Set(doc.assignedTravelerIds);

    return trip.travelers.filter((traveler) => idSet.has(traveler.id));
}

export function getResponse(
    trip: Trip,
    itineraryItemId: number,
    travelerId: number,
): EntryResponse | undefined {
    return trip.responses.find(
        (response) =>
            response.itineraryItemId === itineraryItemId &&
            response.travelerId === travelerId,
    );
}

export function responseRollup(trip: Trip, item: ItineraryItem): ResponseRollup {
    if (item.responseRollup) {
        return item.responseRollup;
    }

    const affected = affectedTravelers(trip, item);
    const counts: ResponseRollup = {
        confirmed: 0,
        declined: 0,
        pending: 0,
        total: affected.length,
    };

    for (const traveler of affected) {
        const status: ResponseStatus =
            getResponse(trip, item.id, traveler.id)?.status ?? 'pending';
        counts[status] += 1;
    }

    return counts;
}

export function newId(prefix: string): number {
    return Number(
        `${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`,
    );
}
