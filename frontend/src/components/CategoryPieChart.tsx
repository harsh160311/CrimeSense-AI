'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308', '#84cc16', '#14b8a6'];

interface CategoryPieProps {
  data: { name: string; value: number; percentage: number }[];
}

export default function CategoryPieChart({ data }: CategoryPieProps) {
  const [showAll, setShowAll] = useState(false);
  const top = data.slice(0, 10);
  const display = showAll ? data : top;
  const hasMore = data.length > 10;

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Crime Distribution</h3>
      <p className="text-xs text-[var(--text-muted)] mb-4">By category</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={display}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {display.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'rgba(17,24,39,0.95)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: any, name: any) => [`${value} incidents`, name]}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px', color: '#64748b', overflowY: 'auto', maxHeight: '220px' }}
              layout="vertical"
              verticalAlign="middle"
              align="right"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-xs text-[var(--accent-blue)] hover:underline cursor-pointer bg-transparent border-none"
        >
          {showAll ? 'Show top 10' : `Show all (${data.length})`}
        </button>
      )}
    </div>
  );
}
