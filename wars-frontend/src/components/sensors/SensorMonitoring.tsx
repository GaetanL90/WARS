import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form, Row, Col, Badge, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LineChart, Line, ReferenceLine } from 'recharts';
import { 
  getAllSensors, 
  getSensorActivities,
  subscribeToSensorUpdates 
} from '../../api/sensors';
import { SensorCategory, type Sensor, type SensorActivity } from '../../types/Sensor';
import {
  getProvinces,
  getDistricts,
  getSectors,
  getCells,
  getVillages,
} from '../../utils/locationData';

interface SensorMonitoringProps {
  userId?: string; // Optional: filter by user's location
}

const SensorMonitoring: React.FC<SensorMonitoringProps> = () => {
  const { t } = useTranslation();
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<SensorCategory | ''>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  const [selectedSensorId, setSelectedSensorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(''); // For historical view
  const [viewMode, setViewMode] = useState<'realtime' | 'historical'>('realtime');
  const [sortByCritical, setSortByCritical] = useState<boolean>(false);

  // Data states
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [activities, setActivities] = useState<SensorActivity[]>([]);
  const [historicalDays, setHistoricalDays] = useState<Array<{ date: string; criticalCount: number; totalCount: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Get available options
  const provinces = getProvinces();
  const districts = selectedProvince ? getDistricts(selectedProvince) : [];
  const sectors = selectedProvince && selectedDistrict 
    ? getSectors(selectedProvince, selectedDistrict) 
    : [];
  const cells = selectedProvince && selectedDistrict && selectedSector
    ? getCells(selectedProvince, selectedDistrict, selectedSector)
    : [];
  const villages = selectedProvince && selectedDistrict && selectedSector && selectedCell
    ? getVillages(selectedProvince, selectedDistrict, selectedSector, selectedCell)
    : [];

  // Filter sensors based on selections
  const filteredSensors = useMemo(() => {
    return sensors.filter(sensor => {
      if (selectedCategory && sensor.category !== selectedCategory) return false;
      if (selectedProvince && sensor.province !== selectedProvince) return false;
      if (selectedDistrict && sensor.district !== selectedDistrict) return false;
      if (selectedSector && sensor.sector !== selectedSector) return false;
      if (selectedCell && sensor.cell !== selectedCell) return false;
      if (selectedVillage && sensor.village !== selectedVillage) return false;
      return true;
    });
  }, [sensors, selectedCategory, selectedProvince, selectedDistrict, selectedSector, selectedCell, selectedVillage]);

  // Load sensors on mount
  useEffect(() => {
    loadSensors();
    // Cleanup on unmount
    return () => {
      // Any cleanup if needed
    };
  }, []);

  // Load activities when filters change
  useEffect(() => {
    loadActivities();
  }, [selectedCategory, selectedProvince, selectedDistrict, selectedSector, selectedCell, selectedVillage, selectedSensorId, selectedDate, viewMode]);

  // Load historical days data
  useEffect(() => {
    if (viewMode === 'historical') {
      loadHistoricalDays();
    }
  }, [viewMode, selectedSensorId, selectedCategory, sortByCritical]);

  // Subscribe to real-time updates (only if we have sensors and in realtime mode)
  useEffect(() => {
    if (viewMode !== 'realtime' || filteredSensors.length === 0) return;
    
    const sensorIds = selectedSensorId ? [selectedSensorId] : filteredSensors.map(s => s.id);
    const unsubscribe = subscribeToSensorUpdates(sensorIds, (activity) => {
      // Only add if it's from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activityDate = new Date(activity.timestamp);
      if (activityDate >= today) {
        setActivities(prev => [activity, ...prev].slice(0, 100)); // Keep last 100
      }
    });

    return unsubscribe;
  }, [selectedSensorId, filteredSensors, viewMode]);

  const loadSensors = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: any = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedProvince) filters.province = selectedProvince;
      if (selectedDistrict) filters.district = selectedDistrict;
      if (selectedSector) filters.sector = selectedSector;
      if (selectedCell) filters.cell = selectedCell;
      if (selectedVillage) filters.village = selectedVillage;

      const data = await getAllSensors(filters);
      setSensors(data);
      // Clear error if data loaded successfully (even from mock)
      setError('');
    } catch (err: any) {
      // Only show error if it's not a connection error (mock data will handle it)
      if (err.code !== 'ERR_NETWORK' && !err.message?.includes('ERR_CONNECTION_REFUSED')) {
        setError(err.message || t('sensors.failedToLoad'));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const filters: any = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedProvince) filters.province = selectedProvince;
      if (selectedDistrict) filters.district = selectedDistrict;
      if (selectedSector) filters.sector = selectedSector;
      if (selectedCell) filters.cell = selectedCell;
      if (selectedVillage) filters.village = selectedVillage;
      if (selectedSensorId) filters.sensorId = selectedSensorId;

      // Increase limit to get more activities for sensor lifeline
      // When filtering by sensorId, API returns all matching activities (no limit)
      const limit = selectedSensorId ? 10000 : 100;
      let data = await getSensorActivities(filters, limit);
      
      // Debug: log what we got
      if (selectedSensorId) {
        const matchingActivities = data.filter(a => a.sensorId === selectedSensorId);
        console.log(`Loaded ${data.length} total activities, ${matchingActivities.length} match sensorId ${selectedSensorId}`);
        if (matchingActivities.length === 0 && data.length > 0) {
          console.log(`Sample sensorIds in loaded data:`, [...new Set(data.slice(0, 10).map(a => a.sensorId))]);
        }
      }
      
      // Filter by date if in historical mode
      if (viewMode === 'historical' && selectedDate) {
        const selectedDateObj = new Date(selectedDate);
        const startOfDay = new Date(selectedDateObj);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDateObj);
        endOfDay.setHours(23, 59, 59, 999);
        
        data = data.filter(activity => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= startOfDay && activityDate <= endOfDay;
        });
      } else if (viewMode === 'realtime') {
        // For realtime, only show today's activities
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const now = new Date();
        
        data = data.filter(activity => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= today && activityDate <= now;
        });
      }
      
      setActivities(data);
    } catch (err: any) {
      // Silently handle connection errors - don't show error for activities
      // as it's expected if backend isn't available
      if (err.code !== 'ERR_NETWORK' && !err.message?.includes('ERR_CONNECTION_REFUSED')) {
        console.error('Failed to load activities:', err);
      }
      // Set empty array to show empty state
      setActivities([]);
    }
  };

  const loadHistoricalDays = async () => {
    try {
      const filters: any = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedSensorId) filters.sensorId = selectedSensorId;

      const allActivities = await getSensorActivities(filters);
      
      // Group activities by date
      const daysMap = new Map<string, { criticalCount: number; totalCount: number }>();
      
      allActivities.forEach(activity => {
        const activityDate = new Date(activity.timestamp);
        const dateKey = activityDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!daysMap.has(dateKey)) {
          daysMap.set(dateKey, { criticalCount: 0, totalCount: 0 });
        }
        
        const dayData = daysMap.get(dateKey)!;
        dayData.totalCount++;
        if (activity.severity === 'critical') {
          dayData.criticalCount++;
        }
      });
      
      // Convert to array and sort
      const days = Array.from(daysMap.entries()).map(([date, data]) => ({
        date,
        ...data,
      }));
      
      // Sort by critical count if sortByCritical is true, otherwise by date (newest first)
      if (sortByCritical) {
        days.sort((a, b) => {
          if (b.criticalCount !== a.criticalCount) {
            return b.criticalCount - a.criticalCount;
          }
          return b.date.localeCompare(a.date);
        });
      } else {
        days.sort((a, b) => b.date.localeCompare(a.date));
      }
      
      setHistoricalDays(days);
    } catch (err: any) {
      console.error('Failed to load historical days:', err);
      setHistoricalDays([]);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedSector('');
    setSelectedCell('');
    setSelectedVillage('');
    setSelectedSensorId('');
  };

  const getCategoryLabel = (category: SensorCategory) => {
    return category === SensorCategory.WATER_HYGIENE
      ? t('sensors.waterHygiene')
      : t('sensors.pipeFailure');
  };

  // Get selected sensor for lifeline view
  const selectedSensor = useMemo(() => {
    if (!selectedSensorId) return null;
    return sensors.find(s => s.id === selectedSensorId) || null;
  }, [selectedSensorId, sensors]);

  // Determine thresholds based on sensor category
  const getThresholds = (category: SensorCategory) => {
    if (category === SensorCategory.WATER_HYGIENE) {
      return {
        normal: { min: 6.5, max: 8.0 },
        warning: { min: 5.5, max: 8.5 },
        unit: 'pH',
      };
    } else {
      // PIPE_FAILURE - using flow rate or pressure
      return {
        normal: { min: 0.5, max: 8.0 },
        warning: { min: 0.1, max: 10.0 },
        unit: 'L/min', // or could be Hp, bar, etc.
      };
    }
  };

  // Prepare chart data - show sensor readings lifeline when sensor is selected
  const chartData = useMemo(() => {
    // Prepare activity count data (fallback when no sensor selected)
    const prepareActivityCountData = () => {
      if (activities.length === 0) return [];

      let startDate: Date;
      let endDate: Date;
      
      if (viewMode === 'historical' && selectedDate) {
        startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
      }

      const grouped: Record<string, {
        time: string;
        info: number;
        warning: number;
        critical: number;
        waterHygiene: number;
        pipeFailure: number;
      }> = {};

      const current = new Date(startDate);
      while (current <= endDate) {
        const timeKey = current.toISOString();
        const hours = current.getHours().toString().padStart(2, '0');
        const timeLabel = `${hours}:00`;
        
        grouped[timeKey] = {
          time: timeLabel,
          info: 0,
          warning: 0,
          critical: 0,
          waterHygiene: 0,
          pipeFailure: 0,
        };
        
        current.setHours(current.getHours() + 1);
      }

      activities.forEach(activity => {
        const activityDate = new Date(activity.timestamp);
        const roundedDate = new Date(activityDate);
        roundedDate.setMinutes(0, 0, 0);
        const timeKey = roundedDate.toISOString();
        
        if (grouped[timeKey]) {
          if (activity.severity === 'info') grouped[timeKey].info++;
          else if (activity.severity === 'warning') grouped[timeKey].warning++;
          else if (activity.severity === 'critical') grouped[timeKey].critical++;

          if (activity.category === SensorCategory.WATER_HYGIENE) {
            grouped[timeKey].waterHygiene++;
          } else if (activity.category === SensorCategory.PIPE_FAILURE) {
            grouped[timeKey].pipeFailure++;
          }
        }
      });

      return Object.values(grouped)
        .sort((a, b) => {
          const timeA = a.time.split(':').map(Number);
          const timeB = b.time.split(':').map(Number);
          return timeA[0] - timeB[0];
        });
    };

    if (!selectedSensorId || activities.length === 0) {
      // Fallback to activity counts if no sensor selected
      return prepareActivityCountData();
    }

    // Activities are already filtered by sensorId in loadActivities, but double-check
    // Filter activities for selected sensor that have values
    const sensorActivities = activities.filter(a => {
      const matches = a.sensorId === selectedSensorId && 
        a.value !== undefined && 
        a.unit !== undefined &&
        a.value !== null &&
        a.unit !== null;
      return matches;
    });

    if (sensorActivities.length === 0) {
      // Debug: log first few activities to see their sensorIds
      if (activities.length > 0) {
        console.log('Sensor ID mismatch:', {
          selectedSensorId,
          totalActivities: activities.length,
          activitiesWithSensorId: activities.filter(a => a.sensorId === selectedSensorId).length,
          sampleSensorIds: [...new Set(activities.slice(0, 10).map(a => a.sensorId))],
        });
      }
      return [];
    }

    // Determine the date range
    let startDate: Date;
    let endDate: Date;
    
    if (viewMode === 'historical' && selectedDate) {
      startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Realtime mode: from 00:00 today to current time
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(); // Current time
    }

    const thresholds = getThresholds(selectedSensor?.category || SensorCategory.PIPE_FAILURE);

    // Group readings by hour and calculate average value per hour
    const grouped: Record<string, {
      time: string;
      value: number;
      status: 'normal' | 'warning' | 'critical';
      count: number;
    }> = {};

    // Initialize all 30-minute intervals from start to end (current time in realtime mode)
    const current = new Date(startDate);
    // Round endDate up to the next 30-minute interval to ensure we include current time
    const roundedEndDate = new Date(endDate);
    if (viewMode !== 'historical' || !selectedDate) {
      // For realtime, round up to next 30-minute mark to include current interval
      const endMinutes = roundedEndDate.getMinutes();
      const roundedMinutes = Math.ceil(endMinutes / 30) * 30;
      roundedEndDate.setMinutes(roundedMinutes, 0, 0);
    }
    
    while (current <= roundedEndDate) {
      const timeKey = current.toISOString();
      const hours = current.getHours().toString().padStart(2, '0');
      const minutes = current.getMinutes().toString().padStart(2, '0');
      const timeLabel = `${hours}:${minutes}`;
      
      grouped[timeKey] = {
        time: timeLabel,
        value: 0,
        status: 'normal',
        count: 0,
      };
      
      current.setMinutes(current.getMinutes() + 30);
    }

    // Process sensor readings
    sensorActivities.forEach(activity => {
      if (activity.value === undefined) return;
      
      const activityDate = new Date(activity.timestamp);
      const roundedDate = new Date(activityDate);
      // Round down to nearest 30 minutes
      const minutes = Math.floor(roundedDate.getMinutes() / 30) * 30;
      roundedDate.setMinutes(minutes, 0, 0);
      const timeKey = roundedDate.toISOString();
      
      if (grouped[timeKey]) {
        // Accumulate values for averaging
        grouped[timeKey].value += activity.value;
        grouped[timeKey].count++;
        
        // Determine status based on thresholds
        const value = activity.value;
        let status: 'normal' | 'warning' | 'critical' = 'normal';
        
        if (value < thresholds.normal.min || value > thresholds.normal.max) {
          if (value < thresholds.warning.min || value > thresholds.warning.max) {
            status = 'critical';
          } else {
            status = 'warning';
          }
        }
        
        // Keep the most severe status
        if (status === 'critical' || 
            (status === 'warning' && grouped[timeKey].status === 'normal')) {
          grouped[timeKey].status = status;
        }
      }
    });

    // Calculate averages and format data - include all intervals even if no data
    return Object.values(grouped)
      .map(item => ({
        time: item.time,
        value: item.count > 0 ? item.value / item.count : null,
        status: item.status,
      }))
      // Don't filter out null values - show all intervals, null means no data for that interval
      .sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
        return timeA[1] - timeB[1];
      });
  }, [activities, viewMode, selectedDate, selectedSensorId, selectedSensor]);

  const hasFilters = selectedCategory || selectedProvince || selectedDistrict || 
                     selectedSector || selectedCell || selectedVillage || selectedSensorId;

  return (
    <div>
      <Card className="shadow-sm mb-4">
        <Card.Header>
          <h5 className="mb-0">{t('sensors.realTimeMonitoring')}</h5>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="warning" dismissible onClose={() => setError('')}>
              {error}
              {error.includes('backend') && (
                <div className="mt-2">
                  <small>{t('sensors.backendNotAvailableHint')}</small>
                </div>
              )}
            </Alert>
          )}

          {/* Filters */}
          <Row className="g-3 mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('sensors.category')}</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as SensorCategory | '')}
                >
                  <option value="">{t('sensors.allCategories')}</option>
                  <option value={SensorCategory.WATER_HYGIENE}>
                    {t('sensors.waterHygiene')}
                  </option>
                  <option value={SensorCategory.PIPE_FAILURE}>
                    {t('sensors.pipeFailure')}
                  </option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('sensors.selectSensor')}</Form.Label>
                <Form.Select
                  value={selectedSensorId}
                  onChange={(e) => setSelectedSensorId(e.target.value)}
                >
                  <option value="">{t('sensors.allSensors')}</option>
                  {filteredSensors.map(sensor => (
                    <option key={sensor.id} value={sensor.id}>
                      {sensor.name} ({getCategoryLabel(sensor.category)})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('location.province')}</Form.Label>
                <Form.Select
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    setSelectedDistrict('');
                    setSelectedSector('');
                    setSelectedCell('');
                    setSelectedVillage('');
                  }}
                >
                  <option value="">{t('sensors.allProvinces')}</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {selectedProvince && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('location.district')}</Form.Label>
                  <Form.Select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedSector('');
                      setSelectedCell('');
                      setSelectedVillage('');
                    }}
                  >
                    <option value="">{t('sensors.allDistricts')}</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {selectedProvince && selectedDistrict && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('location.sector')}</Form.Label>
                  <Form.Select
                    value={selectedSector}
                    onChange={(e) => {
                      setSelectedSector(e.target.value);
                      setSelectedCell('');
                      setSelectedVillage('');
                    }}
                  >
                    <option value="">{t('sensors.allSectors')}</option>
                    {sectors.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {selectedProvince && selectedDistrict && selectedSector && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('location.cell')}</Form.Label>
                  <Form.Select
                    value={selectedCell}
                    onChange={(e) => {
                      setSelectedCell(e.target.value);
                      setSelectedVillage('');
                    }}
                  >
                    <option value="">{t('sensors.allCells')}</option>
                    {cells.map(cell => (
                      <option key={cell} value={cell}>{cell}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {selectedProvince && selectedDistrict && selectedSector && selectedCell && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('location.village')}</Form.Label>
                  <Form.Select
                    value={selectedVillage}
                    onChange={(e) => setSelectedVillage(e.target.value)}
                  >
                    <option value="">{t('sensors.allVillages')}</option>
                    {villages.map(village => (
                      <option key={village} value={village}>{village}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {hasFilters && (
              <Col md={12}>
                <Button variant="outline-secondary" size="sm" onClick={handleClearFilters}>
                  {t('sensors.clearFilters')}
                </Button>
              </Col>
            )}
          </Row>

          {/* Sensors Summary */}
          <div className="mb-3">
            <small className="text-muted">
              {t('sensors.showingSensors', { 
                count: filteredSensors.length,
                total: sensors.length 
              })}
            </small>
          </div>
        </Card.Body>
      </Card>

      {/* View Mode and Date Selection */}
      <Card className="shadow-sm mb-4">
        <Card.Header>
          <h5 className="mb-0">{t('sensors.activitiesChart')}</h5>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('sensors.viewMode')}</Form.Label>
                <Form.Select
                  value={viewMode}
                  onChange={(e) => {
                    setViewMode(e.target.value as 'realtime' | 'historical');
                    if (e.target.value === 'realtime') {
                      setSelectedDate('');
                    }
                  }}
                >
                  <option value="realtime">{t('sensors.realTime')}</option>
                  <option value="historical">{t('sensors.historical')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            {viewMode === 'historical' && (
              <>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>{t('sensors.selectDate')}</Form.Label>
                    <Form.Control
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]} // Can't select future dates
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>{t('sensors.sortBy')}</Form.Label>
                    <Form.Select
                      value={sortByCritical ? 'critical' : 'date'}
                      onChange={(e) => setSortByCritical(e.target.value === 'critical')}
                    >
                      <option value="date">{t('sensors.sortByDate')}</option>
                      <option value="critical">{t('sensors.sortByCritical')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </>
            )}
          </Row>

          {/* Historical Days List */}
          {viewMode === 'historical' && historicalDays.length > 0 && (
            <div className="mt-3">
              <h6 className="mb-2">{t('sensors.availableDays')}</h6>
              <div className="d-flex flex-wrap gap-2">
                {historicalDays.map((day) => (
                  <Button
                    key={day.date}
                    variant={selectedDate === day.date ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setSelectedDate(day.date)}
                  >
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {day.criticalCount > 0 && (
                      <Badge bg="danger" className="ms-2">
                        {day.criticalCount} {t('sensors.critical')}
                      </Badge>
                    )}
                    <Badge bg="secondary" className="ms-1">
                      {day.totalCount} {t('sensors.total')}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Activities Chart or Sensor Lifeline */}
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">
            {selectedSensorId && selectedSensor
              ? t('sensors.sensorLifeline', { name: selectedSensor.name })
              : viewMode === 'realtime' 
                ? t('sensors.realTimeActivities') 
                : t('sensors.historicalActivities', { date: selectedDate ? new Date(selectedDate).toLocaleDateString() : '' })}
          </h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <p className="text-muted">{t('common.loading')}</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">{t('sensors.noActivities')}</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">
                {viewMode === 'historical' && !selectedDate
                  ? t('sensors.selectDateToView')
                  : selectedSensorId
                    ? t('sensors.noReadingsForSensor')
                    : t('sensors.noActivities')}
              </p>
            </div>
          ) : selectedSensorId && selectedSensor ? (
            // Sensor Lifeline View
            <>
              <div className="mb-3">
                <Row>
                  <Col md={6}>
                    <small className="text-muted">
                      {t('sensors.sensorStatus', { 
                        name: selectedSensor.name,
                        category: getCategoryLabel(selectedSensor.category)
                      })}
                    </small>
                  </Col>
                  <Col md={6} className="text-end">
                    <Badge bg={selectedSensor.isActive ? 'success' : 'secondary'}>
                      {selectedSensor.isActive ? t('sensors.active') : t('sensors.inactive')}
                    </Badge>
                  </Col>
                </Row>
              </div>
              {(() => {
                const thresholds = getThresholds(selectedSensor.category);
                const unit = chartData.length > 0 && activities.find(a => a.sensorId === selectedSensorId && a.unit)?.unit || thresholds.unit;
                const sensorReadings = chartData as Array<{ time: string; value: number; status: string }>;
                
                return (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={sensorReadings}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis 
                        label={{ value: unit, angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, t('sensors.reading')]}
                        labelFormatter={(label) => `${t('sensors.time')}: ${label}`}
                      />
                      <Legend />
                      {/* Threshold zones */}
                      <ReferenceLine 
                        y={thresholds.normal.min} 
                        stroke="#198754" 
                        strokeDasharray="5 5" 
                        label={{ value: `${t('sensors.normalMin')} (${thresholds.normal.min})`, position: 'right' }}
                      />
                      <ReferenceLine 
                        y={thresholds.normal.max} 
                        stroke="#198754" 
                        strokeDasharray="5 5" 
                        label={{ value: `${t('sensors.normalMax')} (${thresholds.normal.max})`, position: 'right' }}
                      />
                      <ReferenceLine 
                        y={thresholds.warning.min} 
                        stroke="#ffc107" 
                        strokeDasharray="3 3" 
                        label={{ value: `${t('sensors.warningMin')} (${thresholds.warning.min})`, position: 'right' }}
                      />
                      <ReferenceLine 
                        y={thresholds.warning.max} 
                        stroke="#ffc107" 
                        strokeDasharray="3 3" 
                        label={{ value: `${t('sensors.warningMax')} (${thresholds.warning.max})`, position: 'right' }}
                      />
                      {/* Sensor value line */}
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0d6efd" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        connectNulls={false}
                        name={t('sensors.sensorValue')}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                );
              })()}
            </>
          ) : (
            // Activity Count View (when no sensor selected)
            <>
              <div className="mb-3">
                <small className="text-muted">
                  {viewMode === 'realtime'
                    ? t('sensors.showingToday', { count: activities.length })
                    : t('sensors.showingForDate', { 
                        count: activities.length,
                        date: selectedDate ? new Date(selectedDate).toLocaleDateString() : ''
                      })}
                </small>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = {
                        info: t('sensors.severityInfo'),
                        warning: t('sensors.severityWarning'),
                        critical: t('sensors.severityCritical'),
                        waterHygiene: t('sensors.waterHygiene'),
                        pipeFailure: t('sensors.pipeFailure'),
                      };
                      return [value, labels[name] || name];
                    }}
                  />
                  <Legend 
                    formatter={(value: string) => {
                      const labels: Record<string, string> = {
                        info: t('sensors.severityInfo'),
                        warning: t('sensors.severityWarning'),
                        critical: t('sensors.severityCritical'),
                        waterHygiene: t('sensors.waterHygiene'),
                        pipeFailure: t('sensors.pipeFailure'),
                      };
                      return labels[value] || value;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="info" 
                    stackId="severity"
                    stroke="#0dcaf0" 
                    fill="#0dcaf0" 
                    fillOpacity={0.6}
                    name="info"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="warning" 
                    stackId="severity"
                    stroke="#ffc107" 
                    fill="#ffc107" 
                    fillOpacity={0.6}
                    name="warning"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="critical" 
                    stackId="severity"
                    stroke="#dc3545" 
                    fill="#dc3545" 
                    fillOpacity={0.6}
                    name="critical"
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Category breakdown chart */}
              <div className="mt-4">
                <h6 className="mb-3">{t('sensors.activitiesByCategory')}</h6>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = {
                          waterHygiene: t('sensors.waterHygiene'),
                          pipeFailure: t('sensors.pipeFailure'),
                        };
                        return [value, labels[name] || name];
                      }}
                    />
                    <Legend 
                      formatter={(value: string) => {
                        const labels: Record<string, string> = {
                          waterHygiene: t('sensors.waterHygiene'),
                          pipeFailure: t('sensors.pipeFailure'),
                        };
                        return labels[value] || value;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="waterHygiene" 
                      stackId="category"
                      stroke="#198754" 
                      fill="#198754" 
                      fillOpacity={0.6}
                      name="waterHygiene"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pipeFailure" 
                      stackId="category"
                      stroke="#0d6efd" 
                      fill="#0d6efd" 
                      fillOpacity={0.6}
                      name="pipeFailure"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default SensorMonitoring;

