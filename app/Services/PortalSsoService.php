<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Talks to the Opol Portal's OAuth2 endpoints.
 *
 * Two operations:
 *   - exchangeCode(): swap an authorization code for an access token.
 *   - fetchUserInfo(): given an access token, fetch the user's identity claims.
 *
 * Both are server-to-server HTTP calls. No token ever reaches the browser.
 */
class PortalSsoService
{
    public function buildAuthorizationUrl(string $state): string
    {
        $config = config('services.portal_sso');

        return $config['authorize_url'].'?'.http_build_query([
            'client_id'     => $config['client_id'],
            'redirect_uri'  => $this->redirectUri(),
            'response_type' => 'code',
            'scope'         => 'profile',
            'state'         => $state,
        ]);
    }

    /**
     * Exchange the authorization code for an access token.
     *
     * @return string The access token.
     */
    public function exchangeCode(string $code): string
    {
        $config = config('services.portal_sso');

        $response = Http::asForm()
            ->timeout($config['http_timeout'])
            ->acceptJson()
            ->post($config['token_url'], [
                'grant_type'    => 'authorization_code',
                'client_id'     => $config['client_id'],
                'client_secret' => $config['client_secret'],
                'redirect_uri'  => $this->redirectUri(),
                'code'          => $code,
            ]);

        if (! $response->successful()) {
            throw new RuntimeException(
                'Portal token exchange failed: '.$response->status().' '.$response->body()
            );
        }

        $token = $response->json('access_token');

        if (! is_string($token) || $token === '') {
            throw new RuntimeException('Portal returned no access token.');
        }

        return $token;
    }

    /**
     * Fetch the identity claims for the given access token.
     *
     * @return array{sub:string,preferred_username:string,name:string,email:?string,office:?string,role:string,employment_status:?string}
     */
    public function fetchUserInfo(string $accessToken): array
    {
        $config = config('services.portal_sso');

        $response = Http::withToken($accessToken)
            ->timeout($config['http_timeout'])
            ->acceptJson()
            ->get($config['userinfo_url']);

        if (! $response->successful()) {
            throw new RuntimeException(
                'Portal userinfo failed: '.$response->status().' '.$response->body()
            );
        }

        $data = $response->json();

        foreach (['sub', 'preferred_username', 'name', 'role'] as $required) {
            if (empty($data[$required])) {
                throw new RuntimeException("Portal userinfo missing required claim: {$required}");
            }
        }

        return $data;
    }

    public function isEmploymentStatusAllowed(?string $status): bool
    {
        $allowed = config('services.portal_sso.allowed_employment_statuses');

        return $status !== null && in_array($status, $allowed, true);
    }

    /**
     * Absolute redirect URI. If the config value is relative, prepend APP_URL.
     */
    private function redirectUri(): string
    {
        $uri = config('services.portal_sso.redirect_uri');

        return Str::startsWith($uri, ['http://', 'https://'])
            ? $uri
            : url($uri);
    }

    public function generateState(): string
{
    $nonce = \Illuminate\Support\Str::random(32);
    $timestamp = now()->timestamp;
    $payload = "{$nonce}.{$timestamp}";
    $signature = hash_hmac('sha256', $payload, config('app.key'));

    return "{$payload}.{$signature}";
}

public function verifyState(string $state, int $maxAgeSeconds = 600): bool
{
    $parts = explode('.', $state);
    if (count($parts) !== 3) {
        return false;
    }

    [$nonce, $timestamp, $signature] = $parts;

    if (! ctype_digit($timestamp)) {
        return false;
    }

    $expected = hash_hmac('sha256', "{$nonce}.{$timestamp}", config('app.key'));

    if (! hash_equals($expected, $signature)) {
        return false;
    }

    if (now()->timestamp - (int) $timestamp > $maxAgeSeconds) {
        return false;
    }

    return true;
}
}