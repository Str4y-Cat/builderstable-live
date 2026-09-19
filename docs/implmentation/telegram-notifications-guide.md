# Telegram Notifications — Guide for Adding More

Everything you need to know when wiring additional outbound notifications or
inbound button handlers, learned while implementing assignment confirmations.

## Sending outbound notifications

- Pattern: `Telegraph::chat($chat)->html($text)->keyboard($keyboard)->send()`.
- HTML is the default parse mode — escape user data with `e()` (names, titles).
- `send()` is **synchronous** (`Http::post` to the Telegram API). It does **not**
  depend on the webhook or the ngrok tunnel — only inbound updates (commands,
  button presses) ride the tunnel. Use `->dispatch()` if you want a queued job.
- Chat resolution (single-shared-chat decision): `TelegraphBot::query()->first()?->chats()->first()`,
  and **return early (never throw)** when no bot/chat is registered.
- Guard with the relevant feature flag (e.g. `auto_notify_on_assign`) and compute
  diffs so **only newly added** targets are notified — not removals or unchanged.

## Inbound callbacks (webhook handler)

- Buttons: `Button::make('Label')->action('methodName')->param('key', $value)`.
  Callback data becomes `action:methodName;key:value;...` (colon/semicolon).
- Dispatch is `App::call([$this, $action], $data)` in the base handler, so methods
  must be **public**. Params match by name; strings coerce to `int` (the handler
  files have no `strict_types`).
- **Never trust callback data.** In a shared chat anyone can press a button, so
  validate: traveler exists, item belongs to the traveler's trip, and
  `isAssignedTo($traveler)` before writing anything.
- `ItineraryItem::isAssignedTo()` returns `true` when the assigned list is empty
  (interpreted as "assigned to all") — keep in mind when validating.
- Keyboard cleanup: `deleteKeyboard()` (`editMessageReplyMarkup` with empty markup)
  removes stale Confirm/Decline buttons; `$this->reply('')` clears Telegram's button
  loading spinner without a visible toast.
- Reply semantics:
  - `$this->chat->html(...)->send()` — a real, visible chat message.
  - `$this->reply(...)` — `answerCallbackQuery` toast/alert.

## Testing

- `Telegraph::fake()`, then assertions on the fake:
  - `assertSent($text)` / `assertSent($text, exact: false)` (substring) /
    `assertNotSent` / `assertNothingSent` / `assertSentData('endpoint', [...])`.
- Endpoint names are constants on `DefStudio\Telegraph\Telegraph`, **not** the
  facade (e.g. `'editMessageReplyMarkup'`).
- `assertSent` / `assertSentData` return void — **no chaining**.
- Factories: `TelegraphBot::factory()`, `TelegraphChat::factory()->for($bot, 'bot')`.
  Reuse the `telegram_connected_bot()` / `callback_payload()` helpers in
  `tests/Feature/ItineraryAssignmentNotificationTest.php`.

## Conventions

- No chat↔traveler mapping; the single connected chat is shared by all trips.
- Out of scope (decided): `notification_logs` writes and `NotificationComposer`.
- Run `vendor/bin/pint --format agent` after any PHP edits.