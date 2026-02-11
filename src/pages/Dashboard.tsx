import { AreaChart, Area, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, ArrowUpRight, TrendingUp, Calendar, CreditCard as CardIcon } from 'lucide-react';

// Mock Data
const barData = [
  { name: 'JAN', value: 2000 },
  { name: 'FEB', value: 4500 },
  { name: 'MAR', value: 3000 },
  { name: 'APR', value: 5500 },
  { name: 'MAY', value: 4000 },
  { name: 'JUN', value: 4800 },
];

const lineData = [
  { value: 1000 },
  { value: 2000 },
  { value: 1500 },
  { value: 2800 },
  { value: 2200 },
  { value: 3500 },
];

const transactions = [
    { id: 1, name: 'Dribbble Design', date: '16 Jun 2025', time: '10:30 PM', status: 'Successful', amount: '89.345.23', logo: 'https://cdn.worldvectorlogo.com/logos/dribbble-icon-1.svg', type: 'subscription' },
    { id: 2, name: 'Google Pay', date: '15 Jun 2025', time: '11:45 PM', status: 'Successful', amount: '12.345.89', logo: 'https://cdn.worldvectorlogo.com/logos/google-pay-1.svg', type: 'income' },
    { id: 3, name: 'Amazon Shopping', date: '14 Jun 2025', time: '10:15 PM', status: 'Successful', amount: '32.123.67', logo: 'https://cdn.worldvectorlogo.com/logos/amazon-icon-1.svg', type: 'shopping' },
];

const Dashboard = () => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-medium text-gray-900 dark:text-white">Welcome Back, <span className="text-gray-500 dark:text-gray-400">Sujon</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300">
                        <Calendar size={16} />
                        <span>29 Jun, 2025 - 29 August, 2025</span>
                    </div>
                    <button className="flex items-center gap-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow text-sm font-medium">
                        <Plus size={16} />
                        Add New Wallet
                    </button>
                </div>
            </div>

            {/* Top Row Grid */}
            <div className="grid grid-cols-12 gap-6">
                
                {/* Card 1: Payment Goal / Credit Card */}
                <div className="col-span-12 lg:col-span-4 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Payment Goal</p>
                            <p className="text-sm text-gray-400">Total amount goal</p>
                        </div>
                        <button className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400">
                             <ArrowUpRight size={18} />
                        </button>
                    </div>

                    <div className="bg-emerald-600 text-white p-6 rounded-3xl relative overflow-hidden shadow-emerald-200 dark:shadow-none shadow-xl">
                        <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full transform translate-x-10 -translate-y-10"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-lg italic">VISA</span>
                                <CardIcon size={24} />
                            </div>
                            <div>
                                <p className="text-xs opacity-80 mb-1">Credit Card</p>
                                <p className="text-2xl font-bold tracking-wider mb-4">$ 78,989.09</p>
                                <div className="flex justify-between items-end">
                                    <p className="text-xs tracking-widest opacity-80">**** 909090</p>
                                    <p className="text-xs opacity-80">EXP 09/26</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                         <div>
                            <p className="text-xs text-gray-400 mb-1">Weekly Revenue</p>
                            <p className="text-xl font-bold dark:text-white">+3,945 USD</p>
                         </div>
                         <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
                            +12.8%
                         </div>
                    </div>
                </div>

                {/* Card 2: Engagement Rate */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                         <div className="flex items-center gap-2">
                             <TrendingUp size={20} className="text-gray-400" />
                             <span className="font-semibold text-gray-900 dark:text-white">Engagement Rate</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex text-xs font-medium">
                                <button className="px-3 py-1 text-gray-500 dark:text-gray-400 rounded-full hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm">Monthly</button>
                                <button className="px-3 py-1 bg-emerald-600 text-white rounded-full shadow-md">Annually</button>
                            </div>
                            <button className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400">
                                <ArrowUpRight size={18} />
                            </button>
                         </div>
                    </div>
                    
                    <div className="h-[200px] w-full mt-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} barSize={32}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1F2937', color: '#fff' }} />
                                <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'APR' ? '#10B981' : '#374151'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Card 3: Payment Goal (Line) */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Payment Goal</p>
                            <p className="text-sm text-gray-400">Total amount goal</p>
                        </div>
                        <button className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400">
                             <ArrowUpRight size={18} />
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-400 mb-1">Total Balance</p>
                        <p className="text-3xl font-bold dark:text-white">$32,678.90</p>
                    </div>

                    <div className="h-[120px] w-full -mx-2">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={lineData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1F2937', color: '#fff' }} />
                                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                     <div className="flex gap-3 mt-4">
                        <button className="flex-1 bg-emerald-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-emerald-700 transition-colors">
                            Send ↑
                        </button>
                        <button className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Receive ↓
                        </button>
                     </div>
                </div>
            </div>

            {/* Bottom Row Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Transaction History */}
                <div className="col-span-12 lg:col-span-8 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                         <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Payment History</p>
                            <p className="text-sm text-gray-400">Recent payments history</p>
                        </div>
                        <button className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400">
                                <ArrowUpRight size={18} />
                        </button>
                    </div>

                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-gray-400 border-b border-gray-50 dark:border-gray-800">
                                    <th className="pb-4 font-normal">Name</th>
                                    <th className="pb-4 font-normal">Date</th>
                                    <th className="pb-4 font-normal">Time</th>
                                    <th className="pb-4 font-normal">Status</th>
                                    <th className="pb-4 font-normal text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 p-2 flex items-center justify-center">
                                                    <img src={tx.logo} alt={tx.name} className="w-6 h-6 object-contain" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{tx.name}</p>
                                                    <p className="text-xs text-emerald-500">+{Math.floor(Math.random() * 20)}%</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-gray-600 dark:text-gray-400 font-medium">{tx.date}</td>
                                        <td className="py-4 text-gray-600 dark:text-gray-400 font-medium">{tx.time}</td>
                                        <td className="py-4">
                                            <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right font-bold text-gray-900 dark:text-white">{tx.amount} USD</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 p-2 flex items-center justify-center shadow-sm">
                                        <img src={tx.logo} alt={tx.name} className="w-6 h-6 object-contain" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{tx.name}</p>
                                        <p className="text-xs text-gray-400">{tx.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 dark:text-white">{tx.amount}</p>
                                    <span className="text-xs text-emerald-500 flex items-center justify-end gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Amount of Credit & Faces */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
                                <CardIcon size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Amount of credit</p>
                                <p className="text-xs text-gray-400">Total refund amount with fee</p>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">$8,945.89</span>
                            <span className="px-2 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">+12.8%</span>
                        </div>
                    </div>

                     <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex-1">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Mandatory Payments</p>
                                <p className="text-sm text-gray-400">Recent payments</p>
                            </div>
                            <button className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400">
                                <ArrowUpRight size={18} />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4">
                            {[1, 2, 3, 4].map((i) => (
                                <img 
                                    key={i} 
                                    src={`https://images.unsplash.com/photo-${1500000000000 + i * 1000}?auto=format&fit=crop&w=64&h=64`} 
                                    className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 shadow-sm object-cover"
                                    alt="User"
                                />
                            ))}
                             <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold border-2 border-white dark:border-gray-800 shadow-sm text-sm">
                                +2
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
