import { ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';

const Transactions = () => {
    const allTransactions = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        name: i % 2 === 0 ? 'Dribbble Pro' : 'Upwork Freelance',
        date: `2${i} Jun 2025`,
        time: '14:00 PM',
        status: i % 3 === 0 ? 'Pending' : 'Successful',
        amount: (Math.random() * 1000).toFixed(2),
        type: i % 2 === 0 ? 'expense' : 'income',
        logo: i % 2 === 0 ? 'https://cdn.worldvectorlogo.com/logos/dribbble-icon-1.svg' : 'https://cdn.worldvectorlogo.com/logos/upwork.svg'
    }));

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                    <p className="text-gray-500">View all your transactions and history.</p>
                </div>
                 <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">
                    <Filter size={16} />
                    Filter
                 </button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Desktop/Tablet Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <th className="px-6 py-4">Transaction</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {allTransactions.map((tx) => (
                                 <tr key={tx.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {tx.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{tx.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{tx.type}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                                        <p>{tx.date}</p>
                                        <p className="text-xs text-gray-400">{tx.time}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            tx.status === 'Successful' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                        {tx.type === 'expense' ? '-' : '+'}${tx.amount}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                         <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                            ...
                                         </button>
                                    </td>
                                 </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List View */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                    {allTransactions.map((tx) => (
                        <div key={tx.id} className="p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {tx.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{tx.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{tx.type}</p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    tx.status === 'Successful' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300'
                                }`}>
                                    {tx.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-end pl-14">
                                <div className="text-xs text-gray-400">
                                    <p>{tx.date}</p>
                                    <p>{tx.time}</p>
                                </div>
                                <p className="font-bold text-lg text-gray-900 dark:text-white">
                                    {tx.type === 'expense' ? '-' : '+'}${tx.amount}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Transactions;
