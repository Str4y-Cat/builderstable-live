<?php

namespace App\Enums;

enum TripBadge: string
{
    case Planning = 'planning';
    case Locked = 'locked';
    case OnHold = 'on-hold';
    case Wrap = 'wrap';
}
