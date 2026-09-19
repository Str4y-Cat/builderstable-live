<?php

namespace App\Http\Webhooks;

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
            .'- <code>/help</code> — show this help'
        )->send();
    }
}
