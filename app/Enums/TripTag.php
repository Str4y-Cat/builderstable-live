<?php

namespace App\Enums;

enum TripTag: string
{
    case Festival = 'festival';
    case Commercial = 'commercial';
    case Documentary = 'documentary';
    case PostProduction = 'post-production';
    case Market = 'market';
    case MultiCity = 'multi-city';
}
