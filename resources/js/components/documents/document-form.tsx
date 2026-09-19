import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TravelerAssignPicker } from '@/components/travelers/traveler-assign-picker';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { store, update } from '@/routes/trips/documents';
import type { Document, Trip } from '@/types/trip';

const DOC_TYPES = [
    { value: 'application/pdf', label: 'PDF' },
    { value: 'image/*', label: 'Image' },
    { value: 'text/plain', label: 'Text / notes' },
    { value: 'application/vnd.google-apps.document', label: 'Google Doc' },
    { value: 'other', label: 'Other' },
] as const;

export function DocumentForm({
    open,
    onOpenChange,
    trip,
    document,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trip: Trip;
    document: Document | null;
}) {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [type, setType] = useState('application/pdf');
    const [pinned, setPinned] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (document) {
            setName(document.name);
            setUrl(document.url);
            setType(document.type);
            setPinned(document.pinned);
            setSelectedIds([...document.assignedTravelerIds]);
        } else {
            setName('');
            setUrl('');
            setType('application/pdf');
            setPinned(false);
            setSelectedIds([]);
        }
    }, [open, document]);

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!name.trim() || !url.trim()) {
            toast.error('Name and URL are required');

            return;
        }

        const payload = {
            name: name.trim(),
            url: url.trim(),
            type,
            pinned,
            assigned_traveler_ids: selectedIds,
        };

        if (document) {
            router.patch(update.url([trip.id, document.id]), payload, {
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
                    <DialogTitle>
                        {document ? 'Edit document' : 'Add document'}
                    </DialogTitle>
                    <DialogDescription>
                        {document
                            ? 'Update file details, pin, and crew assignment.'
                            : 'Link a file for this trip. Empty assignment = all crew.'}
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="doc-name">Name</Label>
                        <Input
                            id="doc-name"
                            required
                            placeholder="Call sheet — Day 1.pdf"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="doc-url">URL</Label>
                        <Input
                            id="doc-url"
                            required
                            type="url"
                            placeholder="https://…"
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="doc-type">Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger id="doc-type" className="w-full">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {DOC_TYPES.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                            checked={pinned}
                            onCheckedChange={(checked) => setPinned(checked === true)}
                        />
                        <span>
                            Pinned
                            <span className="text-muted-foreground">
                                {' '}
                                · show at top of the list
                            </span>
                        </span>
                    </label>
                    <TravelerAssignPicker
                        travelers={trip.travelers}
                        value={selectedIds}
                        onChange={setSelectedIds}
                        label="Assign crew"
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {document ? 'Save changes' : 'Add document'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
