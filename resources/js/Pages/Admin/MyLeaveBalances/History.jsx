import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import MyBalanceHistoryView from '@/Components/Shared/MyBalanceHistoryView';

export default function History({ leaveType, transactions, currentBalance, employee }) {
    return (
        <AdminLayout>
            <Head title={`${leaveType.name} History`} />
            <MyBalanceHistoryView
                leaveType={leaveType}
                transactions={transactions}
                currentBalance={currentBalance}
                employee={employee}
                backRouteName="admin.my-leave-balances.index"
            />
        </AdminLayout>
    );
}