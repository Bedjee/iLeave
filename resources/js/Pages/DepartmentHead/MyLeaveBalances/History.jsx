import DepartmentHeadLayout from '@/Layouts/DepartmentHeadLayout';
import { Head } from '@inertiajs/react';
import MyBalanceHistoryView from '@/Components/Shared/MyBalanceHistoryView';

export default function History({ leaveType, transactions, currentBalance, employee }) {
    return (
        <DepartmentHeadLayout>
            <Head title={`${leaveType.name} History`} />
            <MyBalanceHistoryView
                leaveType={leaveType}
                transactions={transactions}
                currentBalance={currentBalance}
                employee={employee}
                backRouteName="department-head.my-leave-balances.index"
            />
        </DepartmentHeadLayout>
    );
}