import MayorLayout from '@/Layouts/MayorLayout';
import { Head } from '@inertiajs/react';
import MyBalanceView from '@/Components/Shared/MyBalanceView';

export default function Index({ leaveBalances, employee }) {
    return (
        <MayorLayout>
            <Head title="My Leave Balances" />
          <MyBalanceView
    leaveBalances={leaveBalances}
    employee={employee}
    historyRouteName="mayor.my-leave-balances.history"   // 👈 add
/>

        </MayorLayout>
    );
}