import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Button } from 'react-bootstrap';
import { useGetPriceHistoryQuery } from '../slices/watchesApiSlice';
import type { PriceRange } from '../interfaces';

export default function PriceHistory({ watchId }: { watchId: string }) {
  const [range, setRange] = useState<PriceRange>('3m');
  const { data = [], isLoading } = useGetPriceHistoryQuery({
    id: watchId,
    range: range as PriceRange,
    public: true,
  });

  console.log(data);

  return (
    <div className="space-y-4">
      {/* range buttons */}
      <div className="flex gap-2">
        {(['3m', '6m', '1y', 'all'] as PriceRange[]).map((r) => (
          <Button
            key={r}
            size="sm"
            variant={r === range ? 'default' : 'secondary'}
            onClick={() => setRange(r)}
          >
            {r === 'all' ? 'All' : r.replace('m', ' mos').replace('y', ' year')}
          </Button>
        ))}
      </div>

      {/* chart */}
      <div className="w-full h-72">
        {isLoading ? (
          <p className="text-center text-sm text-slate-500">Loading…</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2ca6ff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2ca6ff" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-200"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(iso) => format(parseISO(iso), 'd MMM')}
                minTickGap={20}
              />
              <YAxis
                tickFormatter={(v) => `$${v.toLocaleString()}`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                formatter={(v: number) => `$${v.toLocaleString()}`}
                labelFormatter={(iso) => format(parseISO(iso), 'd MMM yyyy')}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#2ca6ff"
                fill="url(#priceFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
