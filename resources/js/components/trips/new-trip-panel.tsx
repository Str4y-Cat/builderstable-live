import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { store } from '@/routes/trips';
import { TRIP_DESCRIPTION_MAX } from '@/types/trip';

export function NewTripPanel({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [autoNotifyOnAssign, setAutoNotifyOnAssign] = useState(true);

    const remainingChars = TRIP_DESCRIPTION_MAX - description.length;
    const canSubmit = name.trim().length > 0 && description.length <= TRIP_DESCRIPTION_MAX;

    useEffect(() => {
        if (open) {
            setName('');
            setDescription('');
            setAutoNotifyOnAssign(true);
        }
    }, [open]);

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!name.trim()) {
            toast.error('Name is required');

            return;
        }

        if (description.length > TRIP_DESCRIPTION_MAX) {
            toast.error(
                `Description must be ${TRIP_DESCRIPTION_MAX} characters or fewer`,
            );

            return;
        }

        router.post(store.url(), {
            name: name.trim(),
            description: description.trim(),
            auto_notify_on_assign: autoNotifyOnAssign,
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
                <DialogHeader className="shrink-0 border-b px-6 py-4 pr-12">
                    <DialogTitle>New trip</DialogTitle>
                </DialogHeader>
                <form
                    className="flex flex-1 flex-col gap-0 overflow-hidden"
                    onSubmit={handleSubmit}
                >
                    <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-trip-name">Name</Label>
                            <Input
                                id="new-trip-name"
                                required
                                placeholder="Milan → Paris shoot"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between gap-2">
                                <Label htmlFor="new-trip-description">Description</Label>
                                <span
                                    className={`text-xs tabular-nums ${
                                        remainingChars < 0
                                            ? 'text-destructive'
                                            : remainingChars <= 40
                                              ? 'text-amber-700'
                                              : 'text-muted-foreground'
                                    }`}
                                >
                                    {description.length}/{TRIP_DESCRIPTION_MAX}
                                </span>
                            </div>
                            <Textarea
                                id="new-trip-description"
                                maxLength={TRIP_DESCRIPTION_MAX}
                                rows={4}
                                placeholder="Short trip brief for the board card…"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                {remainingChars} characters remaining
                            </p>
                        </div>
                        <label className="flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm">
                            <Checkbox
                                className="mt-0.5"
                                checked={autoNotifyOnAssign}
                                onCheckedChange={(checked) =>
                                    setAutoNotifyOnAssign(checked === true)
                                }
                            />
                            <span>
                                <span className="font-medium">Auto-notify on first assign</span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                    Simulated email + Telegram when someone is newly assigned.
                                </span>
                            </span>
                        </label>
                    </div>
                    <DialogFooter className="shrink-0 border-t px-6 py-4 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="w-full" disabled={!canSubmit}>
                            Create trip
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
