import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Heart, Calendar } from 'lucide-react';
import { Card, CardContent } from '../ui';
import { hiveClient } from '../../lib/hive';

interface EarningsData {
  date: string;
  hbd: number;
  hive: number;
}

interface EarningsChartProps {
  hiveUsername: string;
}

export const EarningsChart = ({ hiveUsername }: EarningsChartProps) => {
  const [earnings, setEarnings] = useState<EarningsData[]>([]);
  const [totals, setTotals] = useState({
    totalHBD: 0,
    totalHIVE: 0,
    subscriptions: 0,
    tips: 0,
    percentChange: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    fetchEarningsData();
  }, [hiveUsername, timeRange]);

  const fetchEarningsData = async () => {
    setIsLoading(true);
    try {
      const history = await hiveClient.database.call('get_account_history', [
        hiveUsername,
        -1,
        Math.min(timeRange * 50, 2000),
      ]);

      const cutoffTime = Date.now() - (timeRange * 24 * 60 * 60 * 1000);
      const dailyEarnings: Record<string, { hbd: number; hive: number }> = {};
      let totalHBD = 0;
      let totalHIVE = 0;
      let subscriptions = 0;
      let tips = 0;

      // Initialize daily buckets
      for (let i = 0; i < timeRange; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        dailyEarnings[dateKey] = { hbd: 0, hive: 0 };
      }

      for (const [, operation] of history) {
        const timestamp = new Date(operation.timestamp + 'Z').getTime();
        if (timestamp < cutoffTime) continue;

        if (operation.op[0] === 'transfer') {
          const transfer = operation.op[1];
          if (transfer.to === hiveUsername) {
            const amount = parseFloat(transfer.amount.split(' ')[0]);
            const currency = transfer.amount.split(' ')[1];
            const dateKey = new Date(timestamp).toISOString().split('T')[0];

            if (dailyEarnings[dateKey]) {
              if (currency === 'HBD') {
                dailyEarnings[dateKey].hbd += amount;
                totalHBD += amount;
              } else {
                dailyEarnings[dateKey].hive += amount;
                totalHIVE += amount;
              }
            }

            // Categorize by memo
            try {
              const memo = JSON.parse(transfer.memo);
              if (memo.type === 'subscription') subscriptions++;
              else if (memo.type === 'tip') tips++;
            } catch {
              // Regular transfer
            }
          }
        }
      }

      // Calculate percent change (compare first half to second half)
      const earningsArray = Object.entries(dailyEarnings)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const midpoint = Math.floor(earningsArray.length / 2);
      const firstHalf = earningsArray.slice(0, midpoint).reduce((sum, d) => sum + d.hbd + d.hive, 0);
      const secondHalf = earningsArray.slice(midpoint).reduce((sum, d) => sum + d.hbd + d.hive, 0);
      const percentChange = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

      setEarnings(earningsArray);
      setTotals({ totalHBD, totalHIVE, subscriptions, tips, percentChange });
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxEarning = Math.max(...earnings.map(e => e.hbd + e.hive), 1);

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Earnings Analytics</h2>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days as 7 | 30 | 90)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === days
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total HBD"
          value={`${totals.totalHBD.toFixed(3)}`}
          color="green"
        />
        <StatCard
          icon={DollarSign}
          label="Total HIVE"
          value={`${totals.totalHIVE.toFixed(3)}`}
          color="indigo"
        />
        <StatCard
          icon={Users}
          label="Subscriptions"
          value={totals.subscriptions.toString()}
          color="purple"
        />
        <StatCard
          icon={Heart}
          label="Tips"
          value={totals.tips.toString()}
          color="pink"
        />
      </div>

      {/* Trend Indicator */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Period Trend</p>
              <div className="flex items-center space-x-2 mt-1">
                {totals.percentChange >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-lg font-semibold ${
                  totals.percentChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totals.percentChange >= 0 ? '+' : ''}{totals.percentChange.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-lg font-semibold text-gray-900">
                {(totals.totalHBD + totals.totalHIVE).toFixed(3)} tokens
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple Bar Chart */}
      <Card>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-900">Daily Earnings</h3>
          </div>
          
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
          ) : (
            <div className="h-40 flex items-end space-x-1">
              {earnings.slice(-30).map((day) => {
                const total = day.hbd + day.hive;
                const height = (total / maxEarning) * 100;
                return (
                  <div
                    key={day.date}
                    className="flex-1 group relative"
                  >
                    <div
                      className="bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors cursor-pointer"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {day.date}: {total.toFixed(3)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{earnings[0]?.date || ''}</span>
            <span>{earnings[earnings.length - 1]?.date || ''}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: 'green' | 'indigo' | 'purple' | 'pink';
}) => {
  const colors = {
    green: 'bg-green-100 text-green-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
