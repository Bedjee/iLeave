<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SsoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.portal_sso', [
            'client_id'     => 'test-client',
            'client_secret' => 'test-secret',
            'redirect_uri'  => 'http://ileave.test/auth/callback',
            'authorize_url' => 'http://portal.test/oauth/authorize',
            'token_url'     => 'http://portal.test/oauth/token',
            'userinfo_url'  => 'http://portal.test/oauth/userinfo',
            'allowed_employment_statuses' => ['regular', 'job_order'],
            'http_timeout'  => 5,
        ]);
    }

    public function test_redirect_sends_user_to_portal_with_state(): void
    {
        $response = $this->get('/auth/redirect');

        $response->assertRedirect();
        $location = $response->headers->get('Location');

        $this->assertStringContainsString('portal.test/oauth/authorize', $location);
        $this->assertStringContainsString('client_id=test-client', $location);
        $this->assertStringContainsString('response_type=code', $location);

        $this->assertNotEmpty(session('sso_state'));
    }

    public function test_callback_rejects_missing_state(): void
    {
        $this->get('/auth/callback?code=abc')
            ->assertRedirect(route('home'))
            ->assertSessionHasErrors('sso');
    }

    public function test_callback_rejects_state_mismatch(): void
    {
        $this->withSession(['sso_state' => 'expected'])
            ->get('/auth/callback?code=abc&state=wrong')
            ->assertRedirect(route('home'))
            ->assertSessionHasErrors('sso');
    }

    public function test_regular_employee_can_sign_in_and_is_created(): void
    {
        Http::fake([
            'portal.test/oauth/token'    => Http::response(['access_token' => 'tok-123', 'token_type' => 'Bearer']),
            'portal.test/oauth/userinfo' => Http::response([
                'sub'                => '42',
                'preferred_username' => 'juan.santos',
                'name'               => 'Juan Santos',
                'email'              => 'juan@example.test',
                'office'             => 'HRMO',
                'role'               => 'user',
                'employment_status'  => 'regular',
            ]),
        ]);

        $this->withSession(['sso_state' => 'good'])
            ->get('/auth/callback?code=abc&state=good')
            ->assertRedirect(route('employee.dashboard'));

        $this->assertAuthenticated();

        $user = User::query()->where('portal_user_id', '42')->first();
        $this->assertNotNull($user);
        $this->assertSame('Juan Santos', $user->name);
        $this->assertSame('employee', $user->role);
        $this->assertNotNull($user->last_sso_login_at);
    }

    public function test_job_order_is_allowed(): void
    {
        Http::fake([
            'portal.test/oauth/token'    => Http::response(['access_token' => 'tok-123']),
            'portal.test/oauth/userinfo' => Http::response([
                'sub' => '43', 'preferred_username' => 'jo', 'name' => 'JO',
                'email' => 'jo@example.test', 'office' => 'MO', 'role' => 'user',
                'employment_status' => 'job_order',
            ]),
        ]);

        $this->withSession(['sso_state' => 'good'])
            ->get('/auth/callback?code=abc&state=good')
            ->assertRedirect(route('employee.dashboard'));

        $this->assertAuthenticated();
    }

    public function test_contractual_is_rejected(): void
    {
        Http::fake([
            'portal.test/oauth/token'    => Http::response(['access_token' => 'tok-123']),
            'portal.test/oauth/userinfo' => Http::response([
                'sub' => '44', 'preferred_username' => 'co', 'name' => 'CO',
                'email' => 'co@example.test', 'office' => 'MO', 'role' => 'user',
                'employment_status' => 'contractual',
            ]),
        ]);

        $this->withSession(['sso_state' => 'good'])
            ->get('/auth/callback?code=abc&state=good')
            ->assertRedirect(route('home'))
            ->assertSessionHasErrors('sso');

        $this->assertGuest();
    }

    public function test_existing_user_matched_by_email_keeps_its_role(): void
    {
        $existing = new User();
        $existing->name     = 'Old Name';
        $existing->email    = 'juan@example.test';
        $existing->password = bcrypt('x');
        $existing->role     = 'hrmo';
        $existing->save();

        Http::fake([
            'portal.test/oauth/token'    => Http::response(['access_token' => 'tok-123']),
            'portal.test/oauth/userinfo' => Http::response([
                'sub' => '99', 'preferred_username' => 'juan.santos',
                'name' => 'Juan Santos', 'email' => 'juan@example.test',
                'office' => 'HRMO', 'role' => 'user', 'employment_status' => 'regular',
            ]),
        ]);

        $this->withSession(['sso_state' => 'good'])
            ->get('/auth/callback?code=abc&state=good')
            ->assertRedirect(route('hrmo.dashboard'));

        $existing->refresh();
        $this->assertSame('99', $existing->portal_user_id);
        $this->assertSame('hrmo', $existing->role);   // role preserved
        $this->assertSame('Juan Santos', $existing->name); // name updated
    }
}