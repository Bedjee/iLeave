<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],




    'portal_sso' => [
    'client_id'     => env('PORTAL_SSO_CLIENT_ID'),
    'client_secret' => env('PORTAL_SSO_CLIENT_SECRET'),
    'redirect_uri'  => env('PORTAL_SSO_REDIRECT_URI', '/auth/callback'),

    'authorize_url' => env('PORTAL_SSO_AUTHORIZE_URL'),
    'token_url'     => env('PORTAL_SSO_TOKEN_URL'),
    'userinfo_url'  => env('PORTAL_SSO_USERINFO_URL'),

    // Only users with these employment statuses may access iLeave via SSO.
    // Everyone else is rejected at the callback with a clear message.
    'allowed_employment_statuses' => ['regular', 'job_order'],

    // Timeout (seconds) for the token exchange and userinfo calls.
    'http_timeout' => 10,
],

];
