# Handoff: Telegram confirmation for itinerary assignments

## Stack & versions
- Laravel 13.32, PHP 8.5, Inertia.js v3.7 + React 19, Tailwind v4, Pest 5.2
- SQLite database. Telegraph `defstudio/telegraph` v1.72.1
- Node/vite present. PHP formatting: `vendor/bin/pint --format agent` (required after PHP edits). Feature tests: `php artisan test --compact`.

## Relevant domain (from `.blueprint` / `draft.yaml`)
- `Trip` — `user_id` (curator), has `auto_notify_on_assign: bool default:false` (already exposed in UI + TripFormRequest validation).
- `Traveler` — belongs to trip, has a unique `share_code` (public id, e.g. `/trips/{share_code}`).
- `ItineraryItem` — belongs to trip; `assigned_traveler_ids` stored as **JSON array** (cast `'array'`); also `date`, `time`, `title`, `description`, `location`, `type` enum, `document_ids`. Method `isAssignedTo(Traveler): bool` and `responseRollup(): array`.
- `Response` — `itinerary_item_id`, `traveler_id` (unique pair), `status` enum `pending|confirmed|declined`, `responded_at` nullable datetime. Related via `updateOrCreate` already in `ResponseController`.
- `NotificationLog` — audit table (email/telegram), **not in scope** (decided).
- Route binding: `ItineraryItemController::update(UpdateItineraryItemRequest $request, Trip $trip, ItineraryItem $itineraryItem)` — nested `trips/{trip}/itinerary-items/...` routes with `scopeBindings`. `update` also calls private `syncTasks`.

## Existing Telegram wiring (commit `0231253 "telegram wiring"`)
- `app/Http/Webhooks/BuildersWebhookHandler.php` extends `DefStudio\Telegraph\Handlers\WebhookHandler`; currently implements `start(string $parameter='')`, `help(string $parameter='')`. `chatid()` comes from the base class.
- `config/telegraph.php` points `webhook.handler` at `BuildersWebhookHandler`; models use default `TelegraphBot`/`TelegraphChat`. Webhook route `POST telegraph/{token}/webhook` (name `telegraph.webhook`) registered by the package.
- `.env`: `TELEGRAM_WEBHOOK_DOMAIN`, `TELEGRAPH_BOT_TOKEN`, `TELEGRAPH_WEBHOOK_SECRET`. Ops doc `docs/implmentation/telegram-webhook-ops.md` describes one manually-registered chat via `telegraph:new-chat 1`.
- **Decision (hackathon):** no per-traveler chat mapping. Post to the single connected/registered chat session only.

## Feature to implement
When a curator adds a traveler to an itinerary item (update or store), and `$trip->auto_notify_on_assign` is true, send a confirmation message to that single chat.

Message: traveler name + item title + date/time (+ trip name). Inline keyboard with **Confirm / Decline** buttons. Buttons must carry `traveler_id` and `itinerary_item_id` in callback data (shared chat has no identity). Button syntax: `Button::make('Confirm')->action('confirmInvite')->param('traveler_id', $id)->param('itinerary_item_id', $itemId)` (and `'declineInvite'`). Send via `Telegraph::chat($chat)->html($text)->keyboard($kb)->send()`; HTML default parse mode — escape full names/titles.

Callback flow (webhook handler): dispatch works via `App::call([$this, $action], $data)` → define **public** `confirmInvite(int $traveler_id, int $itinerary_item_id)` and `declineInvite(...)`. Validate traveler exists, item belongs to traveler's trip and `isAssignedTo($traveler)`; `Response::updateOrCreate(['itinerary_item_id','traveler_id'], ['status'=>..., 'responded_at'=>now()])`. Reply via `$this->reply(...)`.

`Telegraph::fake()` is used in tests (`assertSent($message)`, `assertNothingSent()`). Factories: `TelegraphBot::factory()`, `TelegraphChat::factory()->for($bot,'bot')`, plus `TripFactory` has `auto_notify_on_assign => false` default.

## Scope decisions (confirmed by user)
- Notify **only** when `auto_notify_on_assign` is true.
- No chat↔traveler linking, no `notification_logs` writes, leave the simulated `NotificationComposer` untouched.
- Known tradeoff: anyone in the chat can press a button (no responder verification) — acceptable.

## Implementation outline
1. `ItineraryItemController`: new private `sendAssignmentInvites(Trip $trip, ItineraryItem $item, int[] $addedTravelerIds)` returning early if `! $trip->auto_notify_on_assign`; resolve chat via the bot's first chat (skip safely if none). Call from `store()` (all assigned are new) and `update()` (diff previous vs new `assigned_traveler_ids`).
2. `BuildersWebhookHandler`: add `confirmInvite`/`declineInvite` + shared validation/`updateOrCreate`; update `/help` text.
3. Tests (extend `tests/Feature/TelegramWebhookTest.php` or new `tests/Feature/ItineraryAssignmentNotificationTest.php`): send on assign when flag on; no send when flag off or assignment unchanged; callbacks write confirmed/declined `Response` rows; tampered/mismatched item vs traveler → no row.
4. Run `vendor/bin/pint --format agent`, run feature tests.