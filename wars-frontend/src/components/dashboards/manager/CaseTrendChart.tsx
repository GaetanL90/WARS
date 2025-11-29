import React, { useMemo, useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Case } from '../../../utils/mockData';

interface CaseTrendChartProps {
  cases: Case[];
}

type TimePeriod = 'week' | 'month' | 'year';

const CaseTrendChart: React.FC<CaseTrendChartProps> = ({ cases }) => {
  const { t } = useTranslation();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');

  const chartData = useMemo(() => {
    // Group cases by time period
    const groupedData: Record<string, {
      pending: number;
      in_progress: number;
      resolved: number;
      total: number;
    }> = {};
    
    cases.forEach((case_) => {
      const caseDate = new Date(case_.createdAt);
      let periodKey = '';
      
      if (timePeriod === 'week') {
        // Get week number and year
        const year = caseDate.getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const days = Math.floor((caseDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        periodKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
      } else if (timePeriod === 'month') {
        // Format as YYYY-MM
        periodKey = `${caseDate.getFullYear()}-${(caseDate.getMonth() + 1).toString().padStart(2, '0')}`;
      } else if (timePeriod === 'year') {
        // Format as YYYY
        periodKey = caseDate.getFullYear().toString();
      }

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = {
          pending: 0,
          in_progress: 0,
          resolved: 0,
          total: 0,
        };
      }

      groupedData[periodKey].total++;
      if (case_.status === 'pending') {
        groupedData[periodKey].pending++;
      } else if (case_.status === 'in_progress') {
        groupedData[periodKey].in_progress++;
      } else if (case_.status === 'resolved') {
        groupedData[periodKey].resolved++;
      }
    });

    // Convert to chart data format with translated labels
    const statusLabels: Record<string, string> = {
      pending: t('status.pending'),
      in_progress: t('status.inProgress'),
      resolved: t('status.resolved'),
      total: t('dashboard.manager.total'),
    };

    const periods = Object.keys(groupedData).sort();
    return periods.map(period => {
      const periodData = groupedData[period];
      return {
        name: period,
        [statusLabels.pending]: periodData.pending,
        [statusLabels.in_progress]: periodData.in_progress,
        [statusLabels.resolved]: periodData.resolved,
        [statusLabels.total]: periodData.total,
      };
    });
  }, [cases, timePeriod, t]);

  const formatPeriodLabel = (period: string) => {
    if (timePeriod === 'week') {
      return period; // Already formatted as YYYY-W##
    } else if (timePeriod === 'month') {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (timePeriod === 'year') {
      return period;
    }
    return period;
  };

  if (chartData.length === 0) {
    return (
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{t('dashboard.manager.caseTrends')}</h5>
          <Form.Select
            size="sm"
            style={{ width: 'auto' }}
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
          >
            <option value="week">{t('analytics.byWeek')}</option>
            <option value="month">{t('analytics.byMonth')}</option>
            <option value="year">{t('analytics.byYear')}</option>
          </Form.Select>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <p className="text-muted mb-0">{t('analytics.noData')}</p>
        </Card.Body>
      </Card>
    );
  }

  const statusLabels: Record<string, string> = {
    pending: t('status.pending'),
    in_progress: t('status.inProgress'),
    resolved: t('status.resolved'),
    total: t('dashboard.manager.total'),
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{t('dashboard.manager.caseTrends')}</h5>
        <Form.Select
          size="sm"
          style={{ width: 'auto' }}
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
        >
          <option value="week">{t('analytics.byWeek')}</option>
          <option value="month">{t('analytics.byMonth')}</option>
          <option value="year">{t('analytics.byYear')}</option>
        </Form.Select>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tickFormatter={formatPeriodLabel}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [value, t('analytics.cases')]}
              labelFormatter={(label) => formatPeriodLabel(label)}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={statusLabels.total} 
              stroke="#0d6efd" 
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey={statusLabels.pending} 
              stroke="#ffc107" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey={statusLabels.in_progress} 
              stroke="#0dcaf0" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey={statusLabels.resolved} 
              stroke="#198754" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

export default CaseTrendChart;

