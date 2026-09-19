export type ItineraryItemType =
    | 'flight'
    | 'accommodation'
    | 'activity'
    | 'meal'
    | 'transport'
    | 'call-time'
    | 'other';

export type ResponseStatus = 'pending' | 'confirmed' | 'declined';
export type NotifyChannel = 'email' | 'telegram';
export type TripTag =
    | 'festival'
    | 'commercial'
    | 'documentary'
    | 'post-production'
    | 'market'
    | 'multi-city';
export type TripBadge = 'planning' | 'locked' | 'on-hold' | 'wrap';
export type TripStatus = 'upcoming' | 'ongoing' | 'past';

export const TRIP_DESCRIPTION_MAX = 280;

export const TRIP_TAGS: readonly TripTag[] = [
    'festival',
    'commercial',
    'documentary',
    'post-production',
    'market',
    'multi-city',
] as const;

export const TRIP_BADGES: readonly TripBadge[] = [
    'planning',
    'locked',
    'on-hold',
    'wrap',
] as const;

export interface DerivedDateRange {
    startDate: string | null;
    endDate: string | null;
}

export interface Traveler {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    roleOnProduction: string;
    shareCode: string;
}

export interface EventTask {
    id: number;
    title: string;
    done: boolean;
}

export interface ItineraryItem {
    id: number;
    date: string;
    time?: string | null;
    title: string;
    description?: string | null;
    location?: string | null;
    type: ItineraryItemType;
    assignedTravelerIds: number[];
    lastUpdatedAt?: string;
    tasks: EventTask[];
    documentIds: number[];
    responseRollup?: ResponseRollup;
}

export interface Document {
    id: number;
    name: string;
    url: string;
    type: string;
    assignedTravelerIds: number[];
    pinned: boolean;
}

export interface EntryResponse {
    itineraryItemId: number;
    travelerId: number;
    status: ResponseStatus;
    respondedAt?: string | null;
}

export interface NotificationLog {
    id: number;
    tripId: number;
    itineraryItemId: number;
    travelerId: number;
    channel: NotifyChannel;
    sentAt: string;
    messagePreview: string;
}

export interface TripSummary {
    id: number;
    name: string;
    destination?: string | null;
    description?: string | null;
    dateRange: DerivedDateRange;
    badge: TripBadge;
    tags: TripTag[];
    autoNotifyOnAssign?: boolean;
    travelerCount: number;
    itemCount: number;
}

export interface TripDetail {
    id: number;
    name: string;
    destination?: string | null;
    dateRange: DerivedDateRange;
    description: string;
    badge: TripBadge;
    tags: TripTag[];
    autoNotifyOnAssign: boolean;
}

export interface Trip extends TripDetail {
    travelers: Traveler[];
    itinerary: ItineraryItem[];
    documents: Document[];
    responses: EntryResponse[];
    notificationLogs?: NotificationLog[];
}

export interface ResponseRollup {
    confirmed: number;
    declined: number;
    pending: number;
    total: number;
}

export interface DashboardPageProps {
    trips: TripSummary[];
}

export interface TripShowPageProps {
    trip: TripDetail;
    itinerary: ItineraryItem[];
    travelers: Traveler[];
    documents: Document[];
    responses: EntryResponse[];
}

export interface TripSharePageProps {
    trip: TripDetail;
    traveler: Traveler;
    itinerary: ItineraryItem[];
    documents: Document[];
    responses: EntryResponse[];
}
