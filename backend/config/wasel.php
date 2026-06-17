<?php

return [
    'base_url' => env('WASEL_API_URL', 'https://wasl.itsyosefali.cloud/api/v1'),

    'otp_length' => 6,

    'otp_ttl_seconds' => 300,

    'otp_resend_cooldown_seconds' => 60,

    'otp_max_attempts' => 5,

    'otp_message' => 'Your Purrfect Match verification code is :code. Valid for 5 minutes.',
];
