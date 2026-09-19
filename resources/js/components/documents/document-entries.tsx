import { Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Document, Trip } from '@/types/trip';

export function DocumentEntries({
    documents,
    trip,
    showAssignment = false,
    manageable = false,
    onEdit,
    onRemove,
    onTogglePin,
}: {
    documents: Document[];
    trip?: Trip;
    showAssignment?: boolean;
    manageable?: boolean;
    onEdit?: (doc: Document) => void;
    onRemove?: (doc: Document) => void;
    onTogglePin?: (doc: Document) => void;
}) {
    if (documents.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No documents yet.
            </div>
        );
    }

    return (
        <ul className="divide-y rounded-lg border">
            {documents.map((doc) => (
                <li key={doc.id} className="space-y-2 px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-start gap-2">
                            {manageable ? (
                                <button
                                    type="button"
                                    className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                    onClick={() => onTogglePin?.(doc)}
                                >
                                    <Pin
                                        className={`h-3.5 w-3.5 ${doc.pinned ? 'fill-current text-foreground' : ''}`}
                                    />
                                </button>
                            ) : doc.pinned ? (
                                <Pin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            ) : null}
                            <div className="min-w-0 space-y-0.5">
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block truncate font-medium text-foreground underline-offset-4 hover:underline"
                                >
                                    {doc.name}
                                </a>
                                {showAssignment ? (
                                    <p className="text-xs text-muted-foreground">
                                        {doc.assignedTravelerIds.length
                                            ? `${doc.assignedTravelerIds.length} assigned`
                                            : 'All crew'}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        {manageable ? (
                            <div className="flex shrink-0 flex-wrap gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit?.(doc)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => onRemove?.(doc)}
                                >
                                    Remove
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </li>
            ))}
        </ul>
    );
}
