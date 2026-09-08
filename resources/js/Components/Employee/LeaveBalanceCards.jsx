import { useState } from 'react';

export default function LeaveBalanceCards({ leaveTypes = [], balances, selectedId, onSelect }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Color palette
    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';

    // Filter leave types by name or code (case‑insensitive)
    const filteredTypes = leaveTypes.filter((type) =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search leave type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#ffbf00] focus:ring-[#ffbf00] transition pl-9 pr-4 py-2 text-sm"
                />
                <svg
                    className="absolute left-3 top-2.5 size-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>

            {/* Leave Types List – Compact Cards */}
            {filteredTypes.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                    {searchTerm ? 'No matching leave types found.' : 'No leave types available.'}
                </p>
            ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredTypes.map((type) => {
                        const balance = parseFloat(balances?.[type.id]) || 0;
                        const isSelected = selectedId === type.id;
                        return (
                            <div
                                key={type.id}
                                onClick={() => onSelect(type.id)}
                                className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition hover:shadow-sm ${
                                    isSelected
                                        ? 'border-[#ffbf00] bg-[#ffbf00]/10'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className={`size-2.5 rounded-full flex-shrink-0 ${
                                            isSelected ? 'bg-[#ffbf00]' : 'bg-gray-300'
                                        }`}
                                    />
                                    <div className="truncate">
                                        <h4 className="text-sm font-medium text-gray-800 truncate">
                                            {type.name}
                                        </h4>
                                        <p className="text-xs text-gray-500">{type.code}</p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-3">
                                    <p className="text-base font-bold" style={{ color: NAVY }}>
                                        {balance.toFixed(2)}
                                    </p>
                                    <p className="text-[10px] text-gray-400">days</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
