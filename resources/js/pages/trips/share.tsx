import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, Mail } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { DocumentList } from '@/components/documents/document-list';
import { TravelerEntryCard } from '@/components/travelers/traveler-entry-card';
import { Button } from '@/components/ui/button';
import { composeTrip, formatDateRangeLabel } from '@/lib/tripHelpers';
import { downloadTripPdf } from '@/lib/tripPdf';
import { dashboard } from '@/routes';
import { show } from '@/routes/trips';
import type { Auth } from '@/types';
import type { ItineraryItem, TripSharePageProps } from '@/types/trip';

const dayFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

export default function TripShare({
    trip: tripDetail,
    traveler,
    itinerary,
    documents,
    responses,
}: TripSharePageProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const trip = useMemo(
        () => composeTrip(tripDetail, itinerary, [traveler], documents, responses),
        [tripDetail, itinerary, traveler, documents, responses],
    );

    const dayGroups = useMemo(() => {
        const byDate = new Map<string, ItineraryItem[]>();

        for (const item of itinerary) {
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
    }, [itinerary]);

    function downloadPdf() {
        try {
            downloadTripPdf(trip, {
                traveler,
                items: itinerary,
                documents,
            });
            toast.success('PDF downloaded');
        } catch {
            toast.error('Could not generate PDF');
        }
    }

    function contactCurator() {
        const email = auth.user?.email;

        if (!email) {
            toast.info('No curator email on file');

            return;
        }

        const subject = encodeURIComponent(`Question about ${trip.name}`);
        window.location.href = `mailto:${email}?subject=${subject}`;
    }

    return (
        <>
            <Head title={trip.name} />
            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                    {auth.user ? (
                        <button
                            type="button"
                            className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-opacity hover:text-foreground hover:opacity-80"
                            onClick={() => router.visit(show.url(trip.id))}
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back to trip
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-opacity hover:text-foreground hover:opacity-80"
                            onClick={() => router.visit(dashboard.url())}
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Go to My Trips
                        </button>
                    )}
                    <header className="space-y-4 border-b pb-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 space-y-2">
                                <h1 className="text-2xl font-bold tracking-tight break-words">
                                    {trip.name}
                                </h1>
                                {trip.destination ? (
                                    <p className="text-muted-foreground">{trip.destination}</p>
                                ) : null}
                                <p className="text-sm text-muted-foreground">
                                    {formatDateRangeLabel(trip)}
                                </p>
                                <p className="pt-1 text-base">
                                    Hi {traveler.name}, here’s your itinerary for {trip.name}.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="shrink-0"
                                onClick={downloadPdf}
                            >
                                <Download className="h-4 w-4" />
                                Download PDF
                            </Button>
                        </div>
                    </header>
                    <section className="space-y-3 border-b py-8">
                        <div className="flex items-baseline justify-between gap-2">
                            <h2 className="text-lg font-semibold">Documents</h2>
                            <span className="text-sm text-muted-foreground">
                                {documents.length}
                            </span>
                        </div>
                        <DocumentList documents={documents} />
                    </section>
                    <section className="space-y-6 py-8">
                        <h2 className="text-lg font-semibold">Your schedule</h2>
                        {dayGroups.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                No itinerary items assigned to you yet.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {dayGroups.map((group) => (
                                    <div key={group.date} className="space-y-2">
                                        <h3 className="text-sm font-semibold text-muted-foreground">
                                            {group.label}
                                        </h3>
                                        <div className="divide-y rounded-lg border">
                                            {group.items.map((item) => (
                                                <TravelerEntryCard
                                                    key={item.id}
                                                    trip={trip}
                                                    item={item}
                                                    traveler={traveler}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                    <footer className="border-t pt-6">
                        <Button variant="outline" onClick={contactCurator}>
                            <Mail className="h-4 w-4" />
                            Contact curator
                        </Button>
                    </footer>
                </div>
            </div>
        </>
    );
}
