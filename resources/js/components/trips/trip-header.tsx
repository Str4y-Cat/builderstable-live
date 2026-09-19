import { router } from '@inertiajs/react';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    formatDateRangeLabel,
    isDateRangeDerived,
    responseRollup,
    taskProgress,
} from '@/lib/tripHelpers';
import { tripTagLabel } from '@/lib/tripLabels';
import { downloadTripPdf } from '@/lib/tripPdf';
import { share, update } from '@/routes/trips';
import type { Trip } from '@/types/trip';

export function TripHeader({ trip }: { trip: Trip }) {
    const tasks = taskProgress(trip);
    const pendingCount = trip.itinerary.reduce(
        (sum, item) => sum + responseRollup(trip, item).pending,
        0,
    );
    const firstShareCode = trip.travelers[0]?.shareCode;
    const datesDerived = isDateRangeDerived(trip);

    function onAutoNotifyChange(checked: boolean | 'indeterminate') {
        if (checked === 'indeterminate') {
            return;
        }

        router.patch(update.url(trip.id), {
            auto_notify_on_assign: checked,
        });
    }

    function downloadPdf() {
        try {
            downloadTripPdf(trip);
            toast.success('PDF downloaded');
        } catch {
            toast.error('Could not generate PDF');
        }
    }

    function previewTraveler() {
        if (!firstShareCode) {
            toast.info('Add a traveler before previewing their view');

            return;
        }

        router.visit(share.url(firstShareCode));
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    {trip.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="font-normal">
                            {tripTagLabel[tag]}
                        </Badge>
                    ))}
                </div>
                <h1 className="text-2xl font-bold tracking-tight">{trip.name}</h1>
                {trip.destination ? (
                    <p className="text-muted-foreground">{trip.destination}</p>
                ) : null}
                <p className="text-sm text-muted-foreground">
                    {formatDateRangeLabel(trip)}
                    {datesDerived ? (
                        <span className="ml-1.5 text-xs text-muted-foreground/80">
                            · from events
                        </span>
                    ) : null}
                </p>
                {trip.description ? (
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        {trip.description}
                    </p>
                ) : null}
                <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary">
                        {trip.travelers.length} travelers
                    </Badge>
                    <Badge variant="secondary">{trip.itinerary.length} events</Badge>
                    {tasks.total ? (
                        <Badge variant="secondary">
                            {tasks.done}/{tasks.total} tasks
                        </Badge>
                    ) : null}
                    <Badge variant="outline">{pendingCount} pending</Badge>
                </div>
                <label className="flex max-w-md cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm">
                    <Checkbox
                        className="mt-0.5"
                        checked={trip.autoNotifyOnAssign}
                        onCheckedChange={onAutoNotifyChange}
                    />
                    <span>
                        <span className="font-medium">Auto-notify on first assign</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                            Simulated email + Telegram when someone is newly assigned to an
                            event or document.
                        </span>
                    </span>
                </label>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
                <Button variant="outline" onClick={downloadPdf}>
                    <Download className="h-4 w-4" />
                    Download PDF
                </Button>
                <Button disabled={!firstShareCode} onClick={previewTraveler}>
                    <ExternalLink className="h-4 w-4" />
                    Preview traveler view
                </Button>
            </div>
        </div>
    );
}
