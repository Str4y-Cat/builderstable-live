import { Head } from '@inertiajs/react';
import { CalendarDays, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NewTripPanel } from '@/components/trips/new-trip-panel';
import { TripBoard } from '@/components/trips/trip-board';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';
import type { DashboardPageProps } from '@/types/trip';

export default function Dashboard({ trips }: DashboardPageProps) {
    const [newTripOpen, setNewTripOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTrips = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return trips;
        }

        return trips.filter(
            (trip) =>
                trip.name.toLowerCase().includes(query) ||
                (trip.destination?.toLowerCase().includes(query) ?? false) ||
                (trip.description?.toLowerCase().includes(query) ?? false) ||
                trip.tags.some((tag) => tag.toLowerCase().includes(query)) ||
                trip.badge.toLowerCase().includes(query),
        );
    }, [searchQuery, trips]);

    return (
        <>
            <Head title="Dashboard" />
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold">My Trips</h1>
                        <Button onClick={() => setNewTripOpen(true)}>
                            <Plus className="h-4 w-4" />
                            New Trip
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Input
                        className="sm:max-w-xs"
                        placeholder="Search trips…"
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                        Board by trip status · {filteredTrips.length} shown
                    </p>
                </div>

                {trips.length === 0 ? (
                    <div className="py-12 text-center">
                        <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h2 className="mb-2 text-lg font-semibold">No trips yet</h2>
                        <p className="text-sm text-muted-foreground">
                            Create your first trip to get started
                        </p>
                        <Button className="mt-4" onClick={() => setNewTripOpen(true)}>
                            <Plus className="h-4 w-4" />
                            New Trip
                        </Button>
                    </div>
                ) : filteredTrips.length === 0 ? (
                    <div className="py-12 text-center">
                        <h2 className="mb-2 text-lg font-semibold">No matching trips</h2>
                        <p className="text-sm text-muted-foreground">
                            Try a different search
                        </p>
                    </div>
                ) : (
                    <TripBoard trips={filteredTrips} />
                )}
            </div>
            <NewTripPanel open={newTripOpen} onOpenChange={setNewTripOpen} />
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
