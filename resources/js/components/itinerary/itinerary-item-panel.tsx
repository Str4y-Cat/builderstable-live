import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ResponseRollup } from '@/components/features/response-rollup';
import { EventDocumentsPicker } from '@/components/itinerary/event-documents-picker';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { itemTypeBadgeClass, itemTypeLabel } from '@/lib/itemTypeStyles';
import {
    affectedTravelers,
    eventTaskProgress,
    getResponse,
    initials,
    isRecentlyUpdated,
} from '@/lib/tripHelpers';
import { update } from '@/routes/trips/itinerary-items';
import type { ItineraryItem, ResponseStatus, Trip } from '@/types/trip';

function statusClass(status: ResponseStatus): string {
    if (status === 'confirmed') {
        return 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
    }

    if (status === 'declined') {
        return 'border-transparent bg-red-100 text-red-800 hover:bg-red-100';
    }

    return 'border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100';
}

export function ItineraryItemPanel({
    open,
    onOpenChange,
    trip,
    item,
    onEdit,
    onDelete,
    onNotify,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trip: Trip;
    item: ItineraryItem | null;
    onEdit: (item: ItineraryItem) => void;
    onDelete: (item: ItineraryItem) => void;
    onNotify: (item: ItineraryItem) => void;
}) {
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        setNewTaskTitle('');
    }, [item?.id]);

    if (!item) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md" />
            </Sheet>
        );
    }

    const currentItem = item;
    const progress = eventTaskProgress(currentItem);
    const linkedDocuments = trip.documents.filter((doc) =>
        (item.documentIds ?? []).includes(doc.id),
    );
    const metaLine = [
        new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        }).format(new Date(item.date)),
        item.time,
        item.location,
    ]
        .filter(Boolean)
        .join(' · ');
    const crewRows = affectedTravelers(trip, item).map((traveler) => ({
        traveler,
        status: (getResponse(trip, item.id, traveler.id)?.status ??
            'pending') as ResponseStatus,
    }));

    function patchItem(payload: {
        tasks?: { id?: number; title: string; done: boolean }[];
        document_ids?: number[];
    }) {
        router.patch(update.url([trip.id, currentItem.id]), payload, {
            preserveScroll: true,
        });
    }

    function submitNewTask(event: React.FormEvent) {
        event.preventDefault();
        const title = newTaskTitle.trim();

        if (!title) {
            return;
        }

        patchItem({
            tasks: [
                ...currentItem.tasks.map((task) => ({
                    id: task.id,
                    title: task.title,
                    done: task.done,
                })),
                { title, done: false },
            ],
        });
        setNewTaskTitle('');
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                <SheetHeader className="border-b pr-12">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={itemTypeBadgeClass(item.type)}>
                            {itemTypeLabel(item.type)}
                        </Badge>
                        {isRecentlyUpdated(item) ? (
                            <Badge variant="outline">Updated</Badge>
                        ) : null}
                        {progress.total ? (
                            <Badge variant="secondary">
                                {progress.done}/{progress.total} tasks
                            </Badge>
                        ) : null}
                    </div>
                    <SheetTitle className="text-left text-lg leading-snug">
                        {item.title}
                    </SheetTitle>
                    <SheetDescription className="text-left">
                        {metaLine || 'Event details and sub-tasks'}
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
                    {item.description ? (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                    ) : null}
                    <section className="space-y-3">
                        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Sub-tasks
                        </h3>
                        {item.tasks.length ? (
                            <ul className="divide-y rounded-lg border">
                                {item.tasks.map((task) => (
                                    <li
                                        key={task.id}
                                        className="flex items-start gap-3 px-3 py-2.5"
                                    >
                                        <Checkbox
                                            id={`task-${task.id}`}
                                            className="mt-0.5"
                                            checked={task.done}
                                            onCheckedChange={(checked) =>
                                                patchItem({
                                                    tasks: currentItem.tasks.map((current) =>
                                                        current.id === task.id
                                                            ? {
                                                                  id: current.id,
                                                                  title: current.title,
                                                                  done: checked === true,
                                                              }
                                                            : {
                                                                  id: current.id,
                                                                  title: current.title,
                                                                  done: current.done,
                                                              },
                                                    ),
                                                })
                                            }
                                        />
                                        <label
                                            htmlFor={`task-${task.id}`}
                                            className={`min-w-0 flex-1 cursor-pointer text-sm leading-snug ${
                                                task.done
                                                    ? 'text-muted-foreground line-through'
                                                    : ''
                                            }`}
                                        >
                                            {task.title}
                                        </label>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                                            onClick={() =>
                                                patchItem({
                                                    tasks: currentItem.tasks
                                                        .filter((current) => current.id !== task.id)
                                                        .map((current) => ({
                                                            id: current.id,
                                                            title: current.title,
                                                            done: current.done,
                                                        })),
                                                })
                                            }
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
                                No sub-tasks for this event yet.
                            </p>
                        )}
                        <form className="flex gap-2" onSubmit={submitNewTask}>
                            <Input
                                className="flex-1"
                                maxLength={120}
                                placeholder="Add a sub-task…"
                                value={newTaskTitle}
                                onChange={(event) => setNewTaskTitle(event.target.value)}
                            />
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={!newTaskTitle.trim()}
                            >
                                Add
                            </Button>
                        </form>
                    </section>
                    <section className="space-y-3">
                        <EventDocumentsPicker
                            documents={trip.documents}
                            value={item.documentIds ?? []}
                            hint="Same links as in Edit entry — attach trip files to this event."
                            onChange={(ids) => patchItem({ document_ids: ids })}
                        />
                        {linkedDocuments.length ? (
                            <ul className="divide-y rounded-lg border">
                                {linkedDocuments.map((doc) => (
                                    <li key={doc.id} className="px-3 py-2">
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium underline-offset-4 hover:underline"
                                        >
                                            {doc.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </section>
                    <section className="space-y-3">
                        <div className="flex items-baseline justify-between gap-2">
                            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Crew responses
                            </h3>
                            <ResponseRollup trip={trip} item={item} />
                        </div>
                        {crewRows.length ? (
                            <ul className="divide-y rounded-lg border">
                                {crewRows.map((row) => (
                                    <li
                                        key={row.traveler.id}
                                        className="flex items-start justify-between gap-3 px-3 py-2.5"
                                    >
                                        <div className="min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="size-6">
                                                    <AvatarFallback className="text-[10px]">
                                                        {initials(row.traveler.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="truncate text-sm font-medium">
                                                    {row.traveler.name}
                                                </span>
                                            </div>
                                            <p className="pl-8 text-xs text-muted-foreground">
                                                {row.traveler.roleOnProduction}
                                            </p>
                                        </div>
                                        <Badge
                                            className={`shrink-0 capitalize ${statusClass(row.status)}`}
                                        >
                                            {row.status}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
                                No travelers on this trip yet.
                            </p>
                        )}
                    </section>
                </div>
                <SheetFooter className="border-t sm:flex-row sm:justify-stretch">
                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => onNotify(item)}
                    >
                        Notify
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => onEdit(item)}>
                        Edit
                    </Button>
                    <Button
                        className="w-full text-destructive hover:text-destructive"
                        variant="ghost"
                        onClick={() => onDelete(item)}
                    >
                        Delete
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
