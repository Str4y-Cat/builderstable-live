import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { EventDocumentsPicker } from '@/components/itinerary/event-documents-picker';
import { EventTasksEditor } from '@/components/itinerary/event-tasks-editor';
import { TravelerAssignPicker } from '@/components/travelers/traveler-assign-picker';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    ITINERARY_ITEM_TYPES,
    itemTypeHint,
    itemTypeLabel,
} from '@/lib/itemTypeStyles';
import { store, update } from '@/routes/trips/itinerary-items';
import type { EventTask, ItineraryItem, ItineraryItemType, Trip } from '@/types/trip';

export function ItineraryItemForm({
    open,
    onOpenChange,
    trip,
    item,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trip: Trip;
    item: ItineraryItem | null;
}) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [title, setTitle] = useState('');
    const [type, setType] = useState<ItineraryItemType>('activity');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [draftTasks, setDraftTasks] = useState<EventTask[]>([]);
    const [linkedDocumentIds, setLinkedDocumentIds] = useState<number[]>([]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (item) {
            setDate(item.date);
            setTime(item.time ?? '');
            setTitle(item.title);
            setType(item.type);
            setLocation(item.location ?? '');
            setDescription(item.description ?? '');
            setSelectedIds([...item.assignedTravelerIds]);
            setDraftTasks(item.tasks.map((task) => ({ ...task })));
            setLinkedDocumentIds([...(item.documentIds ?? [])]);
        } else {
            setDate(trip.dateRange.startDate ?? trip.itinerary[0]?.date ?? '');
            setTime('');
            setTitle('');
            setType('activity');
            setLocation('');
            setDescription('');
            setSelectedIds([]);
            setDraftTasks([]);
            setLinkedDocumentIds([]);
        }
    }, [open, item, trip]);

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!title.trim() || !date) {
            toast.error('Title and date are required');

            return;
        }

        const tasks = draftTasks
            .map((task) => ({
                ...(task.id > 1_000_000_000 ? {} : { id: task.id }),
                title: task.title.trim(),
                done: task.done,
            }))
            .filter((task) => task.title.length > 0);

        const payload = {
            date,
            time: time || null,
            title: title.trim(),
            type,
            location: location.trim() || null,
            description: description.trim() || null,
            assigned_traveler_ids: selectedIds,
            tasks,
            document_ids: linkedDocumentIds,
        };

        if (item) {
            router.patch(update.url([trip.id, item.id]), payload, {
                onSuccess: () => onOpenChange(false),
            });
        } else {
            router.post(store.url(trip.id), payload, {
                onSuccess: () => onOpenChange(false),
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{item ? 'Edit entry' : 'Add entry'}</DialogTitle>
                    <DialogDescription>
                        {item
                            ? 'Update this itinerary event.'
                            : 'Create a new itinerary event for this trip.'}
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="item-date">Date</Label>
                            <Input
                                id="item-date"
                                type="date"
                                required
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="item-time">Time</Label>
                            <Input
                                id="item-time"
                                type="time"
                                value={time}
                                onChange={(event) => setTime(event.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="item-title">Title</Label>
                        <Input
                            id="item-title"
                            required
                            placeholder="e.g. Call time — Unit base"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="item-type">Type</Label>
                        <Select
                            value={type}
                            onValueChange={(value) => setType(value as ItineraryItemType)}
                        >
                            <SelectTrigger id="item-type" className="w-full">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {ITINERARY_ITEM_TYPES.map((itemType) => (
                                    <SelectItem key={itemType} value={itemType}>
                                        {itemTypeLabel(itemType)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">{itemTypeHint(type)}</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="item-location">Location</Label>
                        <Input
                            id="item-location"
                            placeholder="Optional"
                            value={location}
                            onChange={(event) => setLocation(event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="item-notes">Notes</Label>
                        <Textarea
                            id="item-notes"
                            placeholder="Optional details"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                        />
                    </div>
                    <EventTasksEditor value={draftTasks} onChange={setDraftTasks} />
                    <EventDocumentsPicker
                        documents={trip.documents}
                        value={linkedDocumentIds}
                        onChange={setLinkedDocumentIds}
                    />
                    <TravelerAssignPicker
                        travelers={trip.travelers}
                        value={selectedIds}
                        onChange={setSelectedIds}
                        hint={
                            trip.autoNotifyOnAssign
                                ? 'Search, then select. Leave unchecked for all travelers. First-time assignees are auto-notified.'
                                : 'Search, then select. Leave unchecked for all travelers.'
                        }
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">{item ? 'Save changes' : 'Add entry'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
