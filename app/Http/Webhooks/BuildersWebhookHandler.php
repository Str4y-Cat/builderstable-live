<?php

namespace App\Http\Webhooks;

use App\Enums\ResponseStatus;
use App\Models\ItineraryItem;
use App\Models\Response as EntryResponse;
use App\Models\Traveler;
use DefStudio\Telegraph\Handlers\WebhookHandler;

class BuildersWebhookHandler extends WebhookHandler
{
    public function start(string $parameter = ''): void
    {
        $this->chat->html(
            'Welcome to <b>DML</b> — your production day-management bot. '
            .'Use <code>/chatid</code> to see this chat ID, or <code>/help</code> for the command list.'
        )->send();
    }

    public function help(string $parameter = ''): void
    {
        $this->chat->html(
            'Available commands:<br>'
            .'- <code>/start</code> — show the welcome message<br>'
            .'- <code>/chatid</code> — show this chat ID<br>'
            .'- <code>/help</code> — show this help<br>'
            .'When an itinerary item is assigned, use the Confirm / Decline buttons to reply.'
        )->send();
    }

    public function confirmInvite(int $traveler_id, int $itinerary_item_id): void
    {
        $this->respondToInvite($traveler_id, $itinerary_item_id, ResponseStatus::Confirmed);
    }

    public function declineInvite(int $traveler_id, int $itinerary_item_id): void
    {
        $this->respondToInvite($traveler_id, $itinerary_item_id, ResponseStatus::Declined);
    }

    private function respondToInvite(int $travelerId, int $itineraryItemId, ResponseStatus $status): void
    {
        $resolved = $this->resolveInvitation($travelerId, $itineraryItemId);

        if ($resolved === null) {
            return;
        }

        EntryResponse::query()->updateOrCreate(
            [
                'itinerary_item_id' => $resolved['item']->id,
                'traveler_id' => $resolved['traveler']->id,
            ],
            [
                'status' => $status,
                'responded_at' => now(),
            ],
        );

        $verb = $status === ResponseStatus::Confirmed ? 'confirmed' : 'declined';

        $this->deleteKeyboard();

        $this->chat->html(sprintf('<b>%s</b> %s the assignment.', e($resolved['traveler']->name), $verb))->send();

        $this->reply('');
    }

    /**
     * @return array{traveler: Traveler, item: ItineraryItem}|null
     */
    private function resolveInvitation(int $travelerId, int $itineraryItemId): ?array
    {
        $traveler = Traveler::query()->find($travelerId);
        $item = ItineraryItem::query()->find($itineraryItemId);

        if ($traveler === null || $item === null || $item->trip_id !== $traveler->trip_id || ! $item->isAssignedTo($traveler)) {
            $this->deleteKeyboard();
            $this->reply(__('This assignment is no longer valid.'));

            return null;
        }

        return [
            'traveler' => $traveler,
            'item' => $item,
        ];
    }
}
