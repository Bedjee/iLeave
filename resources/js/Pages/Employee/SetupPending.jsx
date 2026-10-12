import EmployeeLayout from '@/Layouts/EmployeeLayout';
import { Head, Link } from '@inertiajs/react';

const NAVY = '#0F2A52';

export default function SetupPending() {
    return (
        <EmployeeLayout>
            <Head title="Profile setup pending" />

            <div className="max-w-2xl mx-auto mt-6 sm:mt-12">
                <div
                    className="bg-white rounded-2xl border shadow-sm p-8 sm:p-12 text-center"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    {/* Illustration */}
                    <div className="flex justify-center">
                        <img
                            src="/images/lost-amico.png"
                            alt=""
                            className="w-72 sm:w-96 md:w-[28rem] h-auto select-none pointer-events-none"
                            draggable="false"
                        />
                    </div>

                    {/* Heading */}
                    <h1
                        className="mt-6 text-lg sm:text-xl font-bold"
                        style={{ color: NAVY }}
                    >
                        Your account is being set up
                    </h1>

                    {/* Single line of context */}
                    <p className="mt-2 text-sm text-gray-500">
                        HRMO will activate your profile shortly.
                    </p>

                    {/* Small contact hint */}
                    <p className="mt-5 text-xs text-gray-400">
                        Questions? Visit the{' '}
                        <span className="font-medium text-gray-500">
                            Human Resource Management Office
                        </span>
                        .
                    </p>

                    {/* Sign out */}
                    <div className="mt-7 pt-5 border-t border-gray-100">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-xs font-medium text-gray-500 hover:text-gray-800 transition"
                        >
                            Sign out
                        </Link>
                    </div>
                </div>
            </div>
        </EmployeeLayout>
    );
}