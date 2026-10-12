<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PortalSsoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SsoController extends Controller
{
    public function __construct(private readonly PortalSsoService $sso)
    {
    }

   public function redirect(Request $request): RedirectResponse
{
    $state = $this->sso->generateState();

    return redirect()->away($this->sso->buildAuthorizationUrl($state));
}


    public function callback(Request $request): RedirectResponse
    {
        if ($request->filled('error')) {
            Log::warning('Portal SSO returned error', [
                'error'             => $request->input('error'),
                'error_description' => $request->input('error_description'),
            ]);

            return redirect()->route('home')
                ->withErrors(['sso' => 'Sign-in was not completed. Please try again.']);
        }

        $code  = (string) $request->query('code', '');
        $state = (string) $request->query('state', '');

        if ($code === '') {
            return redirect()->route('home')
                ->withErrors(['sso' => 'Missing authorization code.']);
        }

        if (! $this->sso->verifyState($state)) {
    Log::warning('SSO state invalid or expired', ['given' => $state]);
    return redirect()->route('home')
        ->withErrors(['sso' => 'Security check failed. Please try again.']);
}

        try {
            $accessToken = $this->sso->exchangeCode($code);
            $claims      = $this->sso->fetchUserInfo($accessToken);
        } catch (\Throwable $e) {
            Log::error('SSO exchange failed', ['message' => $e->getMessage()]);
            return redirect()->route('home')
                ->withErrors(['sso' => 'Could not complete sign-in. Try again or contact support.']);
        }

        if (! $this->sso->isEmploymentStatusAllowed($claims['employment_status'] ?? null)) {
            return redirect()->route('home')
                ->withErrors(['sso' => 'Your employment status does not permit access to iLeave. Contact HRMO.']);
        }

        $user = $this->findOrCreateUser($claims);

        if (! $user->isActive()) {
            return redirect()->route('home')
                ->withErrors(['sso' => 'Your iLeave account is inactive. Contact HRMO.']);
        }

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        $user->forceFill(['last_sso_login_at' => now()])->saveQuietly();

        return redirect()->intended($this->dashboardFor($user));
    }

    private function findOrCreateUser(array $claims): User
    {
        return DB::transaction(function () use ($claims) {
            $user = User::query()
                ->where('portal_user_id', $claims['sub'])
                ->first();

            if (! $user && ! empty($claims['email'])) {
                $user = User::query()->where('email', $claims['email'])->first();
            }

            if ($user) {
                // Existing user — update name and adopt the portal identity.
                // Do NOT touch role, status, or password. Those are local.
                $user->fill([
                    'name'           => $claims['name'],
                    'portal_user_id' => $claims['sub'],
                ]);

                if (empty($user->email) && ! empty($claims['email'])) {
                    $user->email = $claims['email'];
                }

                $user->save();

                return $user;
            }

            // New SSO user — no local password, no forced change.
            $user = new User();
            $user->name                 = $claims['name'];
            $user->email                = $claims['email'] ?? null;
            $user->portal_user_id       = $claims['sub'];
            $user->role                 = 'employee';
            $user->status               = 'active';
            $user->password             = Str::random(64);   // unusable — SSO only
            $user->must_change_password = false;
            $user->password_changed_at  = now();
            $user->save();

            return $user;
        });
    }

    private function dashboardFor(User $user): string
    {
        return match ($user->role) {
            'admin'           => route('admin.dashboard'),
            'hrmo'            => route('hrmo.dashboard'),
            'department_head' => route('department-head.dashboard'),
            'mayor'           => route('mayor.dashboard'),
            'employee'        => route('employee.dashboard'),
            default           => route('home'),
        };
    }
}