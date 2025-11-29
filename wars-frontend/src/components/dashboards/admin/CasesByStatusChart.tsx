import React, { useMemo, useState } from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Case } from '../../../utils/mockData';

interface CasesByStatusChartProps {
  cases: Case[];
}

type TimePeriod = 'week' | 'month' | 'year';

const CasesByStatusChart: React.FC<CasesByStatusChartProps> = ({ cases }) => {
  const { t } = useTranslation();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  // Get available years from cases
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    cases.forEach((case_) => {
      const year = new Date(case_.createdAt).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [cases]);

  // Get available weeks for selected year
  const availableWeeks = useMemo(() => {
    if (timePeriod !== 'week') return [];
    const weeks = new Set<number>();
    cases.forEach((case_) => {
      const caseDate = new Date(case_.createdAt);
      if (caseDate.getFullYear() === selectedYear) {
        const startOfYear = new Date(selectedYear, 0, 1);
        const days = Math.floor((caseDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        if (weekNumber > 0 && weekNumber <= 53) {
          weeks.add(weekNumber);
        }
      }
    });
    return Array.from(weeks).sort((a, b) => a - b);
  }, [cases, timePeriod, selectedYear]);

  // Get available months for selected year
  const availableMonths = useMemo(() => {
    if (timePeriod !== 'month') return [];
    const months = new Set<number>();
    cases.forEach((case_) => {
      const caseDate = new Date(case_.createdAt);
      if (caseDate.getFullYear() === selectedYear) {
        months.add(caseDate.getMonth() + 1);
      }
    });
    return Array.from(months).sort((a, b) => a - b);
  }, [cases, timePeriod, selectedYear]);

  // Filter cases based on selected period
  const filteredCases = useMemo(() => {
    return cases.filter((case_) => {
      const caseDate = new Date(case_.createdAt);
      const caseYear = caseDate.getFullYear();

      if (timePeriod === 'year') {
        return caseYear === selectedYear;
      } else if (timePeriod === 'month') {
        return caseYear === selectedYear && (caseDate.getMonth() + 1) === selectedMonth;
      } else if (timePeriod === 'week') {
        if (caseYear !== selectedYear) return false;
        const startOfYear = new Date(selectedYear, 0, 1);
        const days = Math.floor((caseDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return weekNumber === selectedWeek;
      }
      return false;
    });
  }, [cases, timePeriod, selectedYear, selectedMonth, selectedWeek]);

  // Count filtered cases by status
  const chartData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      pending: 0,
      in_progress: 0,
      resolved: 0,
    };

    filteredCases.forEach((case_) => {
      statusCounts[case_.status] = (statusCounts[case_.status] || 0) + 1;
    });

    // Convert to chart data format with translated labels
    const statusLabels: Record<string, string> = {
      pending: t('status.pending'),
      in_progress: t('status.inProgress'),
      resolved: t('status.resolved'),
    };

    return [
      {
        name: statusLabels.pending,
        value: statusCounts.pending,
        color: '#ffc107', // Warning (yellow)
      },
      {
        name: statusLabels.in_progress,
        value: statusCounts.in_progress,
        color: '#0dcaf0', // Info (blue)
      },
      {
        name: statusLabels.resolved,
        value: statusCounts.resolved,
        color: '#198754', // Success (green)
      },
    ].filter(item => item.value > 0); // Only show statuses with cases
  }, [filteredCases, t]);

  // Update selected period when time period changes
  React.useEffect(() => {
    if (timePeriod === 'month' && availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    }
    if (timePeriod === 'week' && availableWeeks.length > 0 && !availableWeeks.includes(selectedWeek)) {
      setSelectedWeek(availableWeeks[0]);
    }
  }, [timePeriod, availableMonths, availableWeeks, selectedMonth, selectedWeek]);

  const getPeriodLabel = () => {
    if (timePeriod === 'week') {
      return `${t('analytics.week')} ${selectedWeek}, ${selectedYear}`;
    } else if (timePeriod === 'month') {
      const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      return monthName;
    } else if (timePeriod === 'year') {
      return selectedYear.toString();
    }
    return '';
  };

  if (filteredCases.length === 0) {
    return (
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">{t('analytics.casesByStatus')}</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('analytics.selectPeriod')}</Form.Label>
                <Form.Select
                  size="sm"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                >
                  <option value="week">{t('analytics.byWeek')}</option>
                  <option value="month">{t('analytics.byMonth')}</option>
                  <option value="year">{t('analytics.byYear')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('analytics.selectYear')}</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            {timePeriod === 'month' && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>{t('analytics.selectMonth')}</Form.Label>
                  <Form.Select
                    size="sm"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  >
                    {availableMonths.map(month => (
                      <option key={month} value={month}>
                        {new Date(selectedYear, month - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            {timePeriod === 'week' && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>{t('analytics.selectWeek')}</Form.Label>
                  <Form.Select
                    size="sm"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                  >
                    {availableWeeks.map(week => (
                      <option key={week} value={week}>{t('analytics.week')} {week}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
          </Row>
          <div className="text-center py-5">
            <p className="text-muted mb-0">{t('analytics.noDataForPeriod')}</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header>
        <h5 className="mb-0">{t('analytics.casesByStatus')} - {getPeriodLabel()}</h5>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>{t('analytics.selectPeriod')}</Form.Label>
              <Form.Select
                size="sm"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              >
                <option value="week">{t('analytics.byWeek')}</option>
                <option value="month">{t('analytics.byMonth')}</option>
                <option value="year">{t('analytics.byYear')}</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>{t('analytics.selectYear')}</Form.Label>
              <Form.Select
                size="sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          {timePeriod === 'month' && (
            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('analytics.selectMonth')}</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {availableMonths.map(month => (
                    <option key={month} value={month}>
                      {new Date(selectedYear, month - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          )}
          {timePeriod === 'week' && (
            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('analytics.selectWeek')}</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                >
                  {availableWeeks.map(week => (
                    <option key={week} value={week}>{t('analytics.week')} {week}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          )}
        </Row>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) => {
                const { name, percent } = props;
                if (!name || percent === undefined) return '';
                return `${name}: ${(percent * 100).toFixed(0)}%`;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [value, t('analytics.cases')]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

export default CasesByStatusChart;
