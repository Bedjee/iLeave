import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import MyBalanceView from '@/Components/Shared/MyBalanceView';

export default function Index({ leaveBalances, employee }) {
    return (
        <AdminLayout>
            <Head title="My Leave Balances" />
            <MyBalanceView
                leaveBalances={leaveBalances}
                employee={employee}
                historyRouteName="admin.my-leave-balances.history"   // 👈 add
            />
        </AdminLayout>
    );
}