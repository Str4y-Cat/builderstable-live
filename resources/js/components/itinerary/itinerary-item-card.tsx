import { ChevronRight } from 'lucide-react';
import { ResponseRollup } from '@/components/features/response-rollup';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { itemTypeBadgeClass, itemTypeLabel } from '@/lib/itemTypeStyles';
import {
    areEventTasksComplete,
    eventTaskProgress,
    initials,
    isEventTimeElapsed,
    isRecentlyUpdated,
} from '@/lib/tripHelpers';
import type { ItineraryItem, Trip } from '@/types/trip';

export function ItineraryItemCard({
    trip,
    item,
    highlighted = false,
    onSelect,
    onEdit,
    onDelete,
    onNotify,
}: {
    trip: Trip;
    item: ItineraryItem;
    highlighted?: boolean;
    onSelect: (item: ItineraryItem) => void;
    onEdit: (item: ItineraryItem) => void;
    onDelete: (item: ItineraryItem) => void;
    onNotify: (item: ItineraryItem) => void;
}) {
    const updated = isRecentlyUpdated(item);
    const progress = eventTaskProgress(item);
    const tasksComplete = areEventTasksComplete(item);
    const timeElapsed = isEventTimeElapsed(item);
    const assignedTravelers = item.assignedTravelerIds.length
        ? trip.travelers.filter((traveler) =>
              item.assignedTravelerIds.includes(traveler.id),
          )
        : [];
    const metaLine = [item.time, item.location].filter(Boolean).join(' · ');
    const logs = (trip.notificationLogs ?? []).filter(
        (log) => log.itineraryItemId === item.id,
    );
    const latest = logs.length
        ? [...logs].sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0]
        : null;

    return (
        <article
            role="button"
            tabIndex={0}
            className={`space-y-3 px-4 py-4 outline-none transition-colors duration-300 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                highlighted ? 'bg-muted/50 ring-2 ring-primary/20 ring-inset' : ''
            } ${timeElapsed ? 'opacity-80' : ''}`}
            onClick={() => onSelect(item)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(item);
                }
            }}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={itemTypeBadgeClass(item.type)}>
                            {itemTypeLabel(item.type)}
                        </Badge>
                        {timeElapsed ? (
                            <Badge variant="secondary">Done</Badge>
                        ) : null}
                        {updated ? <Badge variant="outline">Updated</Badge> : null}
                        {progress.total ? (
                            <Badge
                                variant="secondary"
                                className={tasksComplete ? 'ring-1 ring-foreground' : ''}
                            >
                                {progress.done}/{progress.total}
                            </Badge>
                        ) : null}
                    </div>
                    <h3
                        className={`leading-snug font-medium ${
                            timeElapsed ? 'text-muted-foreground line-through' : ''
                        }`}
                    >
                        {item.title}
                    </h3>
                    {metaLine ? (
                        <p className="text-sm text-muted-foreground">{metaLine}</p>
                    ) : null}
                    {item.description ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                            {item.description}
                        </p>
                    ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    <div
                        className="hidden flex-wrap justify-end gap-2 sm:flex"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNotify(item)}
                        >
                            Notify
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                            Edit
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => onDelete(item)}
                        >
                            Delete
                        </Button>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                    Assigned
                </span>
                {assignedTravelers.length === 0 ? (
                    <Badge variant="secondary">All travelers</Badge>
                ) : (
                    assignedTravelers.map((traveler) => (
                        <div
                            key={traveler.id}
                            className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs"
                        >
                            <Avatar className="size-5">
                                <AvatarFallback className="text-[10px]">
                                    {initials(traveler.name)}
                                </AvatarFallback>
                            </Avatar>
                            {traveler.name}
                        </div>
                    ))
                )}
            </div>
            <ResponseRollup trip={trip} item={item} />
            {latest ? (
                <p className="text-xs text-muted-foreground">
                    Last notified{' '}
                    {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                    }).format(new Date(latest.sentAt))}
                    : “
                    {latest.messagePreview.length > 80
                        ? `${latest.messagePreview.slice(0, 80)}…`
                        : latest.messagePreview}
                    ”
                </p>
            ) : null}
        </article>
    );
}
