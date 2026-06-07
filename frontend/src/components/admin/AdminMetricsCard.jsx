import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

/**
 * AdminMetricsCard Component
 * Displays a key metric with optional trend indicator
 *
 * Props:
 * - title: Metric title (e.g., "Total Users")
 * - value: Main metric value to display
 * - description: Optional description text
 * - trend: Optional trend object { value: number, direction: 'up'|'down' }
 * - icon: Optional Lucide icon component
 */
export function AdminMetricsCard({
  title,
  value,
  description,
  trend,
  icon: Icon
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            {trend.direction === 'up' ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-xs font-medium ${
              trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
