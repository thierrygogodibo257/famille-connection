import React from 'react';
import { Card } from '@/components/ui/card';

interface StatsChartProps {
  title: string;
  data: Record<string, number>;
  color?: string;
  maxBars?: number;
}

export const StatsChart: React.FC<StatsChartProps> = ({
  title,
  data,
  color = 'bg-whatsapp-500',
  maxBars = 5
}) => {
  const sortedData = Object.entries(data)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxBars);

  const maxValue = Math.max(...sortedData.map(([, value]) => value));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-3">
        {sortedData.map(([label, value]) => (
          <div key={label} className="flex items-center space-x-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-600 truncate">{label}</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${color}`}
                  style={{
                    width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-8 text-right">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
