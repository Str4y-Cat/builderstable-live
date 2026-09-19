<?php

namespace App\Enums;

enum ResponseStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Declined = 'declined';
}
