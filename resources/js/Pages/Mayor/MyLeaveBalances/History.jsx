import MayorLayout from '@/Layouts/MayorLayout';
import { Head } from '@inertiajs/react';
import MyBalanceHistoryView from '@/Components/Shared/MyBalanceHistoryView';

export default function History({ leaveType, transactions, currentBalance, employee }) {
    return (
        <MayorLayout>
            <Head title={`${leaveType.name} History`} />
            <MyBalanceHistoryView
                leaveType={leaveType}
                transactions={transactions}
                currentBalance={currentBalance}
                employee={employee}
                backRouteName="mayor.my-leave-balances.index"
            />
        </MayorLayout>
    );
}