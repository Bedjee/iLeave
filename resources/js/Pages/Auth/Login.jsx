import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

// Import your local image – adjust the path to your actual file
import avatarImage from '../../../../public/images/leave_logo.png'; // e.g., resources/images/avatar.png

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in - LeaveManager">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 dark:from-black dark:to-zinc-900"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:bg-zinc-900/80 dark:ring-1 dark:ring-zinc-800">
                    {/* User Image */}
                    <div className="mb-6 flex justify-center">
                        <div className="size-20 overflow-hidden ">
                            <img
                                src={avatarImage}
                                alt="User avatar"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Brand */}
                    <div className="mb-6 text-center">
                        <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            Leave<span className="text-[#FF2D20]">Manager</span>
                        </span>

                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            We're glad to see you again. Ready to manage your leave requests?
                        </p>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        {/* Email */}
                        <div>
                            <InputLabel htmlFor="email" value="Your Email" className="text-sm font-semibold text-gray-700 dark:text-gray-200" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF2D20] focus:ring-[#FF2D20] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:ring-[#FF2D20]"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@company.com"
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* Password */}
                        <div className="mt-4">
                            <InputLabel htmlFor="password" value="Your Password" className="text-sm font-semibold text-gray-700 dark:text-gray-200" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF2D20] focus:ring-[#FF2D20] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:ring-[#FF2D20]"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Remember Me & Forgot */}
                        <div className="mt-4 flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-gray-300 text-[#FF2D20] focus:ring-[#FF2D20] dark:border-zinc-600 dark:bg-zinc-700"
                                />
                                Keep me signed in
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-medium text-[#FF2D20] transition hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="mt-6">
                            <PrimaryButton
                                className="w-full justify-center rounded-lg bg-[#FF2D20] px-4 py-3 text-base font-semibold text-white shadow-md transition hover:bg-[#e62e1c] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FF2D20] focus:ring-offset-2 disabled:opacity-50"
                                disabled={processing}
                            >
                                {processing ? 'Logging in…' : 'Let’s go →'}
                            </PrimaryButton>
                        </div>

                        {/* Register Link */}
                        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
                            New here?{' '}
                            <Link
                                href={route('register')}
                                className="font-semibold text-[#FF2D20] transition hover:underline"
                            >
                                Create your account
                            </Link>
                            — it only takes a minute.
                        </p>
                    </form>

                    {/* Helpful micro-message with icon */}
                    <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Need help? Contact HR at hr@company.com</span>
                    </div>
                </div>
            </div>
        </>
    );
}
