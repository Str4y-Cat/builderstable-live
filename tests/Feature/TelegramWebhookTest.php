<?php

use DefStudio\Telegraph\Facades\Telegraph;
use DefStudio\Telegraph\Models\TelegraphBot;
use DefStudio\Telegraph\Models\TelegraphChat;

test('the bot welcomes a registered chat on /start', function () {
    Telegraph::fake();

    $bot = TelegraphBot::factory()->create(['token' => 'test-bot-token']);
    TelegraphChat::factory()->for($bot, 'bot')->create(['chat_id' => '123456789']);

    $this->post(route('telegraph.webhook', $bot->token), [
        'update_id' => 1,
        'message' => [
            'message_id' => 1,
            'date' => now()->getTimestamp(),
            'from' => ['id' => 123456789, 'first_name' => 'Alex'],
            'chat' => ['id' => 123456789, 'type' => 'private'],
            'text' => '/start',
        ],
    ])->assertNoContent();

    Telegraph::assertSent(
        'Welcome to <b>DML</b> — your production day-management bot. '
        .'Use <code>/chatid</code> to see this chat ID, or <code>/help</code> for the command list.'
    );
});

test('the bot lists its commands on /help', function () {
    Telegraph::fake();

    $bot = TelegraphBot::factory()->create(['token' => 'test-bot-token']);
    TelegraphChat::factory()->for($bot, 'bot')->create(['chat_id' => '123456789']);

    $this->post(route('telegraph.webhook', $bot->token), [
        'update_id' => 1,
        'message' => [
            'message_id' => 1,
            'date' => now()->getTimestamp(),
            'from' => ['id' => 123456789, 'first_name' => 'Alex'],
            'chat' => ['id' => 123456789, 'type' => 'private'],
            'text' => '/help',
        ],
    ])->assertNoContent();

    Telegraph::assertSent(
        'Available commands:<br>'
        .'- <code>/start</code> — show the welcome message<br>'
        .'- <code>/chatid</code> — show this chat ID<br>'
        .'- <code>/help</code> — show this help'
    );
});

test('the bot rejects messages from chats that are not registered', function () {
    Telegraph::fake();

    $bot = TelegraphBot::factory()->create(['token' => 'test-bot-token']);

    $this->post(route('telegraph.webhook', $bot->token), [
        'update_id' => 1,
        'message' => [
            'message_id' => 1,
            'date' => now()->getTimestamp(),
            'from' => ['id' => 999999, 'first_name' => 'Stranger'],
            'chat' => ['id' => 999999, 'type' => 'private'],
            'text' => '/start',
        ],
    ])->assertNotFound();

    Telegraph::assertNothingSent();
});

test('the bot answers unknown chats when allowed by configuration', function () {
    Telegraph::fake();

    config()->set('telegraph.security.allow_messages_from_unknown_chats', true);

    $bot = TelegraphBot::factory()->create(['token' => 'test-bot-token']);

    $this->post(route('telegraph.webhook', $bot->token), [
        'update_id' => 1,
        'message' => [
            'message_id' => 1,
            'date' => now()->getTimestamp(),
            'from' => ['id' => 999999, 'first_name' => 'Stranger'],
            'chat' => ['id' => 999999, 'type' => 'private'],
            'text' => '/start',
        ],
    ])->assertNoContent();

    Telegraph::assertSent(
        'Welcome to <b>DML</b> — your production day-management bot. '
        .'Use <code>/chatid</code> to see this chat ID, or <code>/help</code> for the command list.'
    );
});
