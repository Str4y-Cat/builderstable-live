import { router } from '@inertiajs/react';
import { ChevronDown, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DocumentEntries } from '@/components/documents/document-entries';
import { DocumentForm } from '@/components/documents/document-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { destroy, update } from '@/routes/trips/documents';
import type { Document, Trip } from '@/types/trip';

export function DocumentList({
    documents,
    trip,
    collapsible = false,
    defaultOpen = false,
}: {
    documents: Document[];
    trip?: Trip;
    collapsible?: boolean;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const [formOpen, setFormOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

    const pinnedCount = documents.filter((doc) => doc.pinned).length;
    const sortedDocuments = useMemo(
        () => [...documents].sort((a, b) => Number(b.pinned) - Number(a.pinned)),
        [documents],
    );

    const entries = (
        <DocumentEntries
            documents={sortedDocuments}
            trip={trip}
            showAssignment={Boolean(trip)}
            manageable={Boolean(trip)}
            onEdit={(doc) => {
                setEditingDoc(doc);
                setFormOpen(true);
            }}
            onRemove={setDeleteTarget}
            onTogglePin={(doc) => {
                if (!trip) {
                    return;
                }

                router.patch(update.url([trip.id, doc.id]), { pinned: !doc.pinned });
            }}
        />
    );

    return (
        <>
            {collapsible ? (
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
                            <h2 className="text-lg font-semibold">Documents</h2>
                            <span className="text-sm text-muted-foreground">
                                {documents.length}
                            </span>
                            {pinnedCount ? (
                                <Badge variant="secondary" className="font-normal">
                                    {pinnedCount} pinned
                                </Badge>
                            ) : null}
                        </button>
                        {trip ? (
                            <Button
                                size="sm"
                                className="shrink-0"
                                onClick={() => {
                                    setEditingDoc(null);
                                    setFormOpen(true);
                                }}
                            >
                                <Plus className="h-4 w-4" />
                                Add
                            </Button>
                        ) : null}
                    </div>
                    {open ? <div className="space-y-3 border-t px-4 py-3">{entries}</div> : null}
                </section>
            ) : (
                <div>{entries}</div>
            )}
            {trip ? (
                <DocumentForm
                    open={formOpen}
                    onOpenChange={setFormOpen}
                    trip={trip}
                    document={editingDoc}
                />
            ) : null}
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
                        <DialogTitle>Remove document?</DialogTitle>
                        <DialogDescription>
                            {deleteTarget
                                ? `“${deleteTarget.name}” will be removed from this trip.`
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
                                if (!trip || !deleteTarget) {
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
        </>
    );
}
