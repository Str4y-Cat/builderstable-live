import { jsPDF } from 'jspdf';
import { itemTypeLabel } from '@/lib/itemTypeStyles';
import { displayDateRange } from '@/lib/tripHelpers';
import type { Document, ItineraryItem, Traveler, Trip } from '@/types/trip';

export type TripPdfOptions = {
    traveler?: Traveler;
    items?: ItineraryItem[];
    documents?: Document[];
    filename?: string;
};

function formatRange(trip: Trip): string {
    const { startDate, endDate } = displayDateRange(trip);

    if (!startDate || !endDate) {
        return 'Dates TBD';
    }

    const fmt = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return `${fmt.format(new Date(startDate))} – ${fmt.format(new Date(endDate))}`;
}

function slugify(value: string): string {
    return (
        value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 48) || 'trip'
    );
}

function ensureSpace(doc: jsPDF, y: number, need: number): number {
    const pageHeight = doc.internal.pageSize.getHeight();

    if (y + need > pageHeight - 14) {
        doc.addPage();

        return 16;
    }

    return y;
}

function writeWrapped(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight = 5,
): number {
    const lines = doc.splitTextToSize(text, maxWidth) as string[];

    for (const line of lines) {
        y = ensureSpace(doc, y, lineHeight);
        doc.text(line, x, y);
        y += lineHeight;
    }

    return y;
}

export function downloadTripPdf(trip: Trip, options: TripPdfOptions = {}): void {
    const items = options.items ?? [...trip.itinerary];
    const documents = options.documents ?? [...trip.documents];
    const traveler = options.traveler;

    const sortedItems = [...items].sort(
        (a, b) =>
            a.date.localeCompare(b.date) ||
            (a.time ?? '').localeCompare(b.time ?? '') ||
            a.title.localeCompare(b.title),
    );

    const sortedDocs = [...documents].sort(
        (a, b) => Number(b.pinned) - Number(a.pinned) || a.name.localeCompare(b.name),
    );

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 16;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;
    let y = 18;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    y = writeWrapped(doc, trip.name, margin, y, maxWidth, 7);
    y += 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    if (trip.destination) {
        y = writeWrapped(doc, trip.destination, margin, y, maxWidth);
    }

    y = writeWrapped(doc, formatRange(trip), margin, y, maxWidth);

    if (traveler) {
        y = writeWrapped(
            doc,
            `Prepared for ${traveler.name} (${traveler.roleOnProduction})`,
            margin,
            y,
            maxWidth,
        );
    }

    if (trip.description) {
        y += 2;
        y = writeWrapped(doc, trip.description, margin, y, maxWidth);
    }

    y += 6;
    y = ensureSpace(doc, y, 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Documents', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    if (!sortedDocs.length) {
        y = writeWrapped(doc, 'No documents.', margin, y, maxWidth);
    } else {
        for (const file of sortedDocs) {
            y = ensureSpace(doc, y, 10);
            const pin = file.pinned ? ' [pinned]' : '';
            y = writeWrapped(doc, `• ${file.name}${pin}`, margin, y, maxWidth);
            doc.setTextColor(80, 80, 80);
            y = writeWrapped(doc, file.url, margin + 4, y, maxWidth - 4, 4.5);
            doc.setTextColor(0, 0, 0);
            y += 1.5;
        }
    }

    y += 4;
    y = ensureSpace(doc, y, 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(traveler ? 'Your schedule' : 'Itinerary', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    if (!sortedItems.length) {
        y = writeWrapped(doc, 'No events.', margin, y, maxWidth);
    } else {
        let currentDate = '';
        const dayFmt = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

        for (const item of sortedItems) {
            if (item.date !== currentDate) {
                currentDate = item.date;
                y += 3;
                y = ensureSpace(doc, y, 8);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                y = writeWrapped(
                    doc,
                    dayFmt.format(new Date(item.date)),
                    margin,
                    y,
                    maxWidth,
                    6,
                );
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
            }

            y = ensureSpace(doc, y, 12);
            const timePart = item.time ? `${item.time} · ` : '';
            y = writeWrapped(
                doc,
                `• ${timePart}${item.title} (${itemTypeLabel(item.type)})`,
                margin,
                y,
                maxWidth,
            );

            if (item.location) {
                doc.setTextColor(80, 80, 80);
                y = writeWrapped(doc, item.location, margin + 4, y, maxWidth - 4, 4.5);
                doc.setTextColor(0, 0, 0);
            }

            if (item.description) {
                doc.setTextColor(80, 80, 80);
                y = writeWrapped(doc, item.description, margin + 4, y, maxWidth - 4, 4.5);
                doc.setTextColor(0, 0, 0);
            }

            if (item.tasks?.length) {
                for (const task of item.tasks) {
                    const mark = task.done ? '[x]' : '[ ]';
                    y = writeWrapped(
                        doc,
                        `${mark} ${task.title}`,
                        margin + 4,
                        y,
                        maxWidth - 4,
                        4.5,
                    );
                }
            }

            y += 1.5;
        }
    }

    const who = traveler ? slugify(traveler.name) : 'full';
    doc.save(options.filename ?? `${slugify(trip.name)}-${who}.pdf`);
}
