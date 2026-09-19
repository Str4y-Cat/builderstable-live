<?php

namespace App\Enums;

enum NotifyChannel: string
{
    case Email = 'email';
    case Telegram = 'telegram';
}
