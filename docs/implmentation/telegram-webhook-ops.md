# Telegram Webhook — Ops Notes

## When the ngrok/tunnel URL changes (everything you need to do)

The ngrok tunnel dies and gets a brand new URL fairly often (crash, restart,
reconnect, or the 2-hour free-tier timeout). The app itself is unaffected — only
the **webhook registration** rides on the tunnel. Re-pointing it is quick:

1. **Restart the tunnel** pointing at the port your Laravel server actually uses:
   - app on port 80 (default `artisan serve`): `ngrok http 80`
   - app on port 8000: `ngrok http 8000`
   - A `502 Bad Gateway` from Telegram almost always means the tunnel port and the
     server port don't match (e.g. a tunnel on `http 8000` while the server is on
     port 80). Confirm what's listening:

       ```bash
       ss -tlnp | grep -E ':8000|:80 '
       ```

2. **Copy the new HTTPS URL** (e.g. `https://xxxx-....ngrok-free.app`).

3. **Update the domain in `.env`:**

       TELEGRAM_WEBHOOK_DOMAIN=https://xxxx-....ngrok-free.app

4. **Re-register the webhook** (bot id `1`):

       php artisan config:clear
       php artisan telegraph:set-webhook 1 --secret="$TELEGRAPH_WEBHOOK_SECRET"

   Add `--drop-pending-updates` if old updates are queued and repeating.

5. **Verify it's live:**

       php artisan telegraph:debug-webhook 1

   You should see the tunnel URL under `url:`, `pending_update_count: 0`, and no
   `last_error_message`.

> **Nothing else needs redoing.** The bot, the `BuildersWebhookHandler`, and the
> registered chat live in the database, not in the URL. Only re-register the
> webhook when the tunnel changes.

If Telegram still returns 502 after step 5, the tunnel port and the running
`artisan serve` port don't line up — go back to step 1.

## Getting / confirming the chat ID

Send **`/chatid`** to the bot in Telegram; it replies with the numeric chat ID.
Verify the registered chat matches at any time with:

    php artisan tinker --execute 'echo DefStudio\Telegraph\Models\TelegraphChat::query()->get()->map(fn ($c) => [$c->chat_id, $c->name])->toJson();'

## First-time bot setup (one-time, not needed on URL change)

1. Install + publish telegraph (`composer require defstudio/telegraph`, publish config/migrations, `php artisan migrate`).
2. Register a handler (`app/Http/Webhooks/...`) with a public `start()` method and
   point `config/telegraph.php` `webhook.handler` at it.
3. In `.env`: `TELEGRAM_WEBHOOK_DOMAIN`, `TELEGRAPH_BOT_TOKEN`,
   `TELEGRAPH_WEBHOOK_SECRET` (+ `TELEGRAPH_WEBHOOK_SECRET` export once). Keep
   tokens out of committed files (see `.env.example`).
4. Turn on `allow_messages_from_unknown_chats`, `config:clear`, message the bot,
   and fetch the chat ID via `/container` — then re-disable unknown chats.
5. Register the chat (`telegraph:new-chat 1`) and confirm the webhook
   (`telegraph:debug-webhook 1`).
