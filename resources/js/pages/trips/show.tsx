import { Head, router, setLayoutProps } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DocumentList } from '@/components/documents/document-list';
import { NotificationComposer } from '@/components/features/notification-composer';
import { ItineraryItemForm } from '@/components/itinerary/itinerary-item-form';
import { ItineraryItemPanel } from '@/components/itinerary/itinerary-item-panel';
import { ItineraryTimeline } from '@/components/itinerary/itinerary-timeline';
import { TravelerList } from '@/components/travelers/traveler-list';
import { TripHeader } from '@/components/trips/trip-header';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { composeTrip, taskProgress } from '@/lib/tripHelpers';
import { dashboard } from '@/routes';
import { destroy } from '@/routes/trips/itinerary-items';
import { show } from '@/routes/trips';
import type { ItineraryItem, TripShowPageProps } from '@/types/trip';

export default function TripShow({
    trip: tripDetail,
    itinerary,
    travelers,
    documents,
    responses,
}: TripShowPageProps) {
    const trip = useMemo(
        () => composeTrip(tripDetail, itinerary, travelers, documents, responses),
        [tripDetail, itinerary, travelers, documents, responses],
    );

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Dashboard',
                href: dashboard(),
            },
            {
                title: trip.name,
                href: show.url(trip.id),
            },
        ],
    });
    const tasks = taskProgress(trip);
    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [panelItem, setPanelItem] = useState<ItineraryItem | null>(null);
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [notifyItem, setNotifyItem] = useState<ItineraryItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ItineraryItem | null>(null);

    function openCreate() {
        setEditingItem(null);
        setFormOpen(true);
    }

    function openEdit(item: ItineraryItem) {
        setPanelOpen(false);
        setEditingItem(item);
        setFormOpen(true);
    }

    function openItemPanel(item: ItineraryItem) {
        setPanelItem(item);
        setPanelOpen(true);
    }

    function openNotify(item: ItineraryItem) {
        setNotifyItem(item);
        setNotifyOpen(true);
    }

    return (
        <>
            <Head title={trip.name} />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <button
                        type="button"
                        className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-opacity hover:text-foreground hover:opacity-80"
                        onClick={() => router.visit(dashboard.url())}
                    >
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        My Trips
                    </button>
                    <TripHeader trip={trip} />
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
                    <section className="space-y-4 lg:col-span-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-baseline gap-2">
                                <h2 className="text-lg font-semibold">Itinerary</h2>
                                <span className="text-sm text-muted-foreground">
                                    {trip.itinerary.length} events
                                </span>
                                {tasks.total ? (
                                    <span className="text-sm text-muted-foreground">
                                        · {tasks.done}/{tasks.total} tasks
                                    </span>
                                ) : null}
                            </div>
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="h-4 w-4" />
                                Add entry
                            </Button>
                        </div>
                        <ItineraryTimeline
                            trip={trip}
                            highlightItemId={panelItem?.id}
                            onSelect={openItemPanel}
                            onEdit={openEdit}
                            onDelete={setDeleteTarget}
                            onNotify={openNotify}
                        />
                    </section>
                    <aside className="space-y-4 lg:col-span-2">
                        <TravelerList trip={trip} />
                        <DocumentList
                            trip={trip}
                            documents={trip.documents}
                            collapsible
                        />
                    </aside>
                </div>
            </div>
            <ItineraryItemForm
                open={formOpen}
                onOpenChange={setFormOpen}
                trip={trip}
                item={editingItem}
            />
            <ItineraryItemPanel
                open={panelOpen}
                onOpenChange={setPanelOpen}
                trip={trip}
                item={panelItem}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onNotify={openNotify}
            />
            <NotificationComposer
                open={notifyOpen}
                onOpenChange={setNotifyOpen}
                trip={trip}
                item={notifyItem}
            />
            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete this item?</DialogTitle>
                        <DialogDescription>
                            {deleteTarget
                                ? `“${deleteTarget.title}” will be removed from this trip’s itinerary.`
                                : null}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (!deleteTarget) {
                                    return;
                                }

                                router.delete(destroy.url([trip.id, deleteTarget.id]), {
                                    onSuccess: () => {
                                        setDeleteTarget(null);
                                        setPanelOpen(false);
                                    },
                                });
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}


