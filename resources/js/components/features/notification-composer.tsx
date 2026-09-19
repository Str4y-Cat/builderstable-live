import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import { affectedTravelers } from '@/lib/tripHelpers';
import type { ItineraryItem, NotifyChannel, Trip } from '@/types/trip';

export function NotificationComposer({
    open,
    onOpenChange,
    trip,
    item,
    onSent,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trip: Trip;
    item: ItineraryItem | null;
    onSent?: (itemId: number) => void;
}) {
    const [emailChannel, setEmailChannel] = useState(true);
    const [telegramChannel, setTelegramChannel] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [recipientQuery, setRecipientQuery] = useState('');

    const assigned = item ? affectedTravelers(trip, item) : [];
    const filteredAssigned = useMemo(() => {
        const query = recipientQuery.trim().toLowerCase();

        if (!query) {
            return assigned;
        }

        return assigned.filter((traveler) =>
            [traveler.name, traveler.roleOnProduction, traveler.email, traveler.phone ?? '']
                .join(' ')
                .toLowerCase()
                .includes(query),
        );
    }, [assigned, recipientQuery]);

    const allSelected =
        assigned.length > 0 && assigned.every((traveler) => selectedIds.includes(traveler.id));
    const selectedChannels: NotifyChannel[] = [
        ...(emailChannel ? (['email'] as const) : []),
        ...(telegramChannel ? (['telegram'] as const) : []),
    ];
    const canSend =
        !!item &&
        selectedIds.length > 0 &&
        selectedChannels.length > 0 &&
        message.trim().length > 0;

    useEffect(() => {
        if (!open || !item) {
            return;
        }

        setEmailChannel(true);
        setTelegramChannel(true);
        setMessage(
            `Schedule update: ${item.title} on ${item.date}${item.time ? ` at ${item.time}` : ''}. Please confirm your availability.`,
        );
        setSelectedIds(affectedTravelers(trip, item).map((traveler) => traveler.id));
        setRecipientQuery('');
    }, [open, item, trip]);

    function send() {
        if (!item || !canSend) {
            if (!selectedChannels.length) {
                toast.error('Select at least one channel');
            } else if (!selectedIds.length) {
                toast.error('Select at least one recipient');
            } else if (!message.trim()) {
                toast.error('Message is required');
            }

            return;
        }

        toast.success(
            `Notified ${selectedIds.length} traveler${selectedIds.length === 1 ? '' : 's'}`,
        );
        onSent?.(item.id);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Notify assigned travelers</DialogTitle>
                    <DialogDescription>
                        {item
                            ? `Simulated send for “${item.title}”. Only currently assigned crew (or your selection) are notified — not the whole trip by default.`
                            : null}
                    </DialogDescription>
                </DialogHeader>
                {item ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium">Recipients</p>
                                {assigned.length ? (
                                    <button
                                        type="button"
                                        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                                        onClick={() =>
                                            setSelectedIds(
                                                allSelected
                                                    ? []
                                                    : assigned.map((traveler) => traveler.id),
                                            )
                                        }
                                    >
                                        {allSelected ? 'Clear' : 'Select all assigned'}
                                    </button>
                                ) : null}
                            </div>
                            {assigned.length === 0 ? (
                                <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                                    No travelers on this trip to notify.
                                </div>
                            ) : (
                                <>
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            className="pl-8"
                                            placeholder="Search assigned crew…"
                                            value={recipientQuery}
                                            onChange={(event) =>
                                                setRecipientQuery(event.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                                        {filteredAssigned.map((traveler) => (
                                            <label
                                                key={traveler.id}
                                                className="flex cursor-pointer items-start gap-2 text-sm"
                                            >
                                                <Checkbox
                                                    className="mt-0.5"
                                                    checked={selectedIds.includes(traveler.id)}
                                                    onCheckedChange={(checked) =>
                                                        setSelectedIds((current) =>
                                                            checked === true
                                                                ? [...current, traveler.id]
                                                                : current.filter(
                                                                      (id) => id !== traveler.id,
                                                                  ),
                                                        )
                                                    }
                                                />
                                                <span className="min-w-0">
                                                    <span className="font-medium">
                                                        {traveler.name}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {' '}
                                                        · {traveler.roleOnProduction}
                                                    </span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Channels</p>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex cursor-pointer items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={emailChannel}
                                        onCheckedChange={(checked) =>
                                            setEmailChannel(checked === true)
                                        }
                                    />
                                    Email
                                </label>
                                <label className="flex cursor-pointer items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={telegramChannel}
                                        onCheckedChange={(checked) =>
                                            setTelegramChannel(checked === true)
                                        }
                                    />
                                    Telegram
                                </label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notify-message">Message</Label>
                            <Textarea
                                id="notify-message"
                                rows={4}
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                            />
                        </div>
                    </div>
                ) : null}
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" disabled={!canSend} onClick={send}>
                        Send update
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
