import DepartmentHeadLayout from '@/Layouts/DepartmentHeadLayout';
import { Head } from '@inertiajs/react';
import MyBalanceView from '@/Components/Shared/MyBalanceView';

export default function Index({ leaveBalances, employee }) {
    return (
        <DepartmentHeadLayout>
            <Head title="My Leave Balances" />
           <MyBalanceView
    leaveBalances={leaveBalances}
    employee={employee}
    historyRouteName="department-head.my-leave-balances.history"   // 👈 add
/>
        </DepartmentHeadLayout>
    );
}