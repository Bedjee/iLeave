<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Creates a single iLeave admin so HRMO can always log in and manage users,
 * even if the portal is unreachable.
 *
 * Reads credentials from env. Skips silently if unset.
 */
class BootstrapAdminSeeder extends Seeder
{
    public function run(): void
    {
        $email    = env('ILEAVE_ADMIN_EMAIL');
        $password = env('ILEAVE_ADMIN_PASSWORD');

        if (blank($email) || blank($password)) {
            $this->command?->warn('ILEAVE_ADMIN_EMAIL / ILEAVE_ADMIN_PASSWORD not set. Skipping.');
            return;
        }

        if (User::query()->where('role', 'admin')->exists()) {
            $this->command?->info('An iLeave admin already exists. Skipping.');
            return;
        }

        $user = new User();
        $user->name              = env('ILEAVE_ADMIN_NAME', 'iLeave Administrator');
        $user->email             = $email;
        $user->password          = $password;
        $user->role              = 'admin';
        $user->email_verified_at = now();
        $user->save();

        $this->command?->info("iLeave administrator [{$email}] created.");
    }
}