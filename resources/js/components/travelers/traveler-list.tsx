import { router } from '@inertiajs/react';
import { ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';
import { ShareLinkButton } from '@/components/features/share-link-button';
import { TravelerForm } from '@/components/travelers/traveler-form';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { destroy } from '@/routes/trips/travelers';
import type { Traveler, Trip } from '@/types/trip';

export function TravelerList({ trip }: { trip: Trip }) {
    const [open, setOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Traveler | null>(null);

    return (
        <section className="rounded-xl border">
            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-expanded={open}
                    onClick={() => setOpen(!open)}
                >
                    <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                            open ? 'rotate-180' : ''
                        }`}
                    />
                    <h2 className="text-lg font-semibold">Travelers</h2>
                    <span className="text-sm text-muted-foreground">
                        {trip.travelers.length}
                    </span>
                </button>
                <Button
                    size="sm"
                    className="shrink-0"
                    onClick={() => setFormOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Add traveler
                </Button>
            </div>
            {open ? (
                <div className="space-y-3 border-t px-4 py-3">
                    {trip.travelers.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                            No travelers yet.
                        </div>
                    ) : (
                        <ul className="divide-y rounded-lg border">
                            {trip.travelers.map((traveler) => (
                                <li
                                    key={traveler.id}
                                    className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
                                >
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                            <p className="font-medium">{traveler.name}</p>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <ShareLinkButton shareCode={traveler.shareCode} />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setDeleteTarget(traveler)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {traveler.roleOnProduction}
                                        </p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {traveler.email}
                                        </p>
                                        {traveler.phone ? (
                                            <p className="text-sm text-muted-foreground">
                                                Tel. {traveler.phone}
                                            </p>
                                        ) : null}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : null}
            <TravelerForm open={formOpen} onOpenChange={setFormOpen} trip={trip} />
            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(next) => {
                    if (!next) {
                        setDeleteTarget(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove traveler?</DialogTitle>
                        <DialogDescription>
                            {deleteTarget
                                ? `“${deleteTarget.name}” will be removed from this trip and any item assignments.`
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
                                    onSuccess: () => setDeleteTarget(null),
                                });
                            }}
                        >
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}
