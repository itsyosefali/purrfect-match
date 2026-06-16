<?php

namespace App\Enums;

enum ListingStatus: string
{
    case Available = 'available';
    case Pending = 'pending';
    case Adopted = 'adopted';
}
