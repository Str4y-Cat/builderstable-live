<?php

namespace App\Enums;

enum ItineraryItemType: string
{
    case Flight = 'flight';
    case Accommodation = 'accommodation';
    case Activity = 'activity';
    case Meal = 'meal';
    case Transport = 'transport';
    case CallTime = 'call-time';
    case Other = 'other';
}
