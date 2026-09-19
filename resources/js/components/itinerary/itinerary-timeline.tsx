import { useMemo } from 'react';
import { ItineraryItemCard } from '@/components/itinerary/itinerary-item-card';
import { ItineraryProgress } from '@/components/itinerary/itinerary-progress';
import type { ItineraryItem, Trip } from '@/types/trip';

const dayFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

export function ItineraryTimeline({
    trip,
    highlightItemId,
    onSelect,
    onEdit,
    onDelete,
    onNotify,
}: {
    trip: Trip;
    highlightItemId?: number | null;
    onSelect: (item: ItineraryItem) => void;
    onEdit: (item: ItineraryItem) => void;
    onDelete: (item: ItineraryItem) => void;
    onNotify: (item: ItineraryItem) => void;
}) {
    const dayGroups = useMemo(() => {
        const byDate = new Map<string, ItineraryItem[]>();

        for (const item of trip.itinerary) {
            const list = byDate.get(item.date) ?? [];
            list.push(item);
            byDate.set(item.date, list);
        }

        return [...byDate.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, items]) => ({
                date,
                label: dayFormatter.format(new Date(date)),
                items: [...items].sort(
                    (a, b) =>
                        (a.time ?? '').localeCompare(b.time ?? '') ||
                        a.title.localeCompare(b.title),
                ),
            }));
    }, [trip.itinerary]);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <aside className="w-full shrink-0 rounded-xl border bg-muted/20 p-3 sm:sticky sm:top-4 sm:w-44 lg:w-48">
                <ItineraryProgress trip={trip} onSelect={onSelect} />
            </aside>
            <div className="min-w-0 flex-1 space-y-6">
                {dayGroups.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                        No itinerary events yet.
                    </div>
                ) : (
                    dayGroups.map((group) => (
                        <section key={group.date} className="space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                {group.label}
                            </h3>
                            <div className="divide-y rounded-lg border">
                                {group.items.map((item) => (
                                    <ItineraryItemCard
                                        key={item.id}
                                        trip={trip}
                                        item={item}
                                        highlighted={item.id === highlightItemId}
                                        onSelect={onSelect}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onNotify={onNotify}
                                    />
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </div>
    );
}
