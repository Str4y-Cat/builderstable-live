import { Link, router } from '@inertiajs/react';
import { MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateRangeLabel } from '@/lib/tripHelpers';
import { tripBadgeLabel, tripTagLabel } from '@/lib/tripLabels';
import { destroy, show, store, update } from '@/routes/trips';
import type { TripSummary } from '@/types/trip';

export function TripCard({ trip }: { trip: TripSummary }) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: trip.name,
        destination: trip.destination ?? '',
        startDate: trip.dateRange.startDate ?? '',
        endDate: trip.dateRange.endDate ?? '',
    });

    function openEdit(event: React.MouseEvent) {
        event.stopPropagation();
        setEditForm({
            name: trip.name,
            destination: trip.destination ?? '',
            startDate: trip.dateRange.startDate ?? '',
            endDate: trip.dateRange.endDate ?? '',
        });
        setEditOpen(true);
    }

    function saveEdit(event: React.FormEvent) {
        event.preventDefault();
        const name = editForm.name.trim();

        if (!name) {
            toast.error('Name is required');

            return;
        }

        if (
            editForm.startDate &&
            editForm.endDate &&
            editForm.endDate < editForm.startDate
        ) {
            toast.error('End date must be on or after start date');

            return;
        }

        router.patch(
            update.url(trip.id),
            {
                name,
                destination: editForm.destination.trim() || null,
                start_date: editForm.startDate || null,
                end_date: editForm.endDate || null,
            },
            {
                onSuccess: () => setEditOpen(false),
            },
        );
    }

    function handleDuplicate(event: React.MouseEvent) {
        event.stopPropagation();
        router.post(store.url(), {
            name: `${trip.name} (Copy)`,
            description: trip.description ?? '',
            badge: trip.badge,
            tags: trip.tags,
            auto_notify_on_assign: trip.autoNotifyOnAssign ?? false,
            destination: trip.destination,
            start_date: trip.dateRange.startDate,
            end_date: trip.dateRange.endDate,
        });
    }

    function confirmDelete() {
        router.delete(destroy.url(trip.id), {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    return (
        <Card className="outline-none transition-shadow duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring">
            <Link
                href={show.url(trip.id)}
                className="block cursor-pointer"
                onClick={(event) => {
                    if ((event.target as HTMLElement).closest('[data-card-menu]')) {
                        event.preventDefault();
                    }
                }}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 space-y-2">
                            <CardTitle className="text-base leading-snug">
                                {trip.name}
                            </CardTitle>
                            {trip.destination ? (
                                <CardDescription className="line-clamp-1">
                                    {trip.destination}
                                </CardDescription>
                            ) : null}
                        </div>
                        <div data-card-menu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0"
                                        onClick={(event) => event.preventDefault()}
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <DropdownMenuItem onClick={openEdit}>
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDuplicate}>
                                        Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setDeleteOpen(true);
                                        }}
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                    <p className="text-xs text-muted-foreground">
                        {formatDateRangeLabel(trip)}
                    </p>
                    {trip.description ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                            {trip.description}
                        </p>
                    ) : null}
                    {trip.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {trip.tags.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="outline"
                                    className="font-normal"
                                >
                                    {tripTagLabel[tag]}
                                </Badge>
                            ))}
                        </div>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                        {trip.travelerCount}{' '}
                        {trip.travelerCount === 1 ? 'traveler' : 'travelers'}
                    </p>
                </CardContent>
            </Link>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-md" onClick={(event) => event.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle>Edit trip</DialogTitle>
                        <DialogDescription>
                            Update trip name, destination, and dates.
                        </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={saveEdit}>
                        <div className="space-y-2">
                            <Label htmlFor="edit-trip-name">Name</Label>
                            <Input
                                id="edit-trip-name"
                                required
                                value={editForm.name}
                                onChange={(event) =>
                                    setEditForm({ ...editForm, name: event.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-trip-destination">Destination</Label>
                            <Input
                                id="edit-trip-destination"
                                value={editForm.destination}
                                onChange={(event) =>
                                    setEditForm({
                                        ...editForm,
                                        destination: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="edit-trip-start">Start date</Label>
                                <Input
                                    id="edit-trip-start"
                                    type="date"
                                    value={editForm.startDate}
                                    onChange={(event) =>
                                        setEditForm({
                                            ...editForm,
                                            startDate: event.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-trip-end">End date</Label>
                                <Input
                                    id="edit-trip-end"
                                    type="date"
                                    value={editForm.endDate}
                                    onChange={(event) =>
                                        setEditForm({
                                            ...editForm,
                                            endDate: event.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-md" onClick={(event) => event.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle>Delete trip?</DialogTitle>
                        <DialogDescription>
                            “{trip.name}” and its itinerary will be removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
