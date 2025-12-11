'use client';

import { motion } from 'framer-motion';

interface ROICalculatorProps {
    monthlyFee?: number;
    totalEarnings?: number;
    monthsSubscribed?: number;
}

export default function ROICalculator({
    monthlyFee = 9.99,
    totalEarnings = 0,
    monthsSubscribed = 1
}: ROICalculatorProps) {
    const totalCost = monthlyFee * monthsSubscribed;
    const netProfit = totalEarnings - totalCost;
    const roi = totalCost > 0 ? ((totalEarnings - totalCost) / totalCost) * 100 : 0;

    const isProfitable = netProfit >= 0;
    const progressPercent = Math.min((totalEarnings / totalCost) * 100, 100);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Subscription Value</h3>

            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Cost: ${totalCost.toFixed(2)}</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Earned: ${totalEarnings.toFixed(2)}</span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>

            <div className="text-center">
                {isProfitable ? (
                    <div>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            +{roi.toFixed(0)}% ROI
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            You've made <span className="font-bold text-gray-900 dark:text-white">${netProfit.toFixed(2)}</span> profit!
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Earn <span className="font-bold text-gray-900 dark:text-white">${Math.abs(netProfit).toFixed(2)}</span> more to cover your subscription.
                        </p>
                        <button className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                            Go to Rewards Hub &rarr;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
