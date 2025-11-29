import React, { useMemo, useState } from 'react';
import { Card, Table, Badge, Form, Row, Col, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { Case } from '../../../utils/mockData';
import {
  getProvinces,
  getDistricts,
  getSectors,
  getCells,
  getVillages,
} from '../../../utils/locationData';

interface RegionStatisticsProps {
  cases: Case[];
}

// Parse location string to extract hierarchical location data
// Format: "Village, Cell, Sector, District, Province"
const parseLocation = (location: string): {
  village?: string;
  cell?: string;
  sector?: string;
  district?: string;
  province?: string;
} => {
  if (!location) return {};
  const parts = location.split(',').map(p => p.trim());
  return {
    village: parts[0],
    cell: parts[1],
    sector: parts[2],
    district: parts[3],
    province: parts[4],
  };
};

// Check if a case matches the selected location filter
const matchesLocation = (caseLocation: string, selected: {
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}): boolean => {
  const parsed = parseLocation(caseLocation);
  
  if (selected.province && parsed.province !== selected.province) return false;
  if (selected.district && parsed.district !== selected.district) return false;
  if (selected.sector && parsed.sector !== selected.sector) return false;
  if (selected.cell && parsed.cell !== selected.cell) return false;
  if (selected.village && parsed.village !== selected.village) return false;
  
  return true;
};

const RegionStatistics: React.FC<RegionStatisticsProps> = ({ cases }) => {
  const { t } = useTranslation();
  
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<string>('');

  // Get available options based on selections
  const provinces = getProvinces();
  const districts = selectedProvince ? getDistricts(selectedProvince) : [];
  const sectors = selectedProvince && selectedDistrict ? getSectors(selectedProvince, selectedDistrict) : [];
  const cells = selectedProvince && selectedDistrict && selectedSector 
    ? getCells(selectedProvince, selectedDistrict, selectedSector) 
    : [];
  const villages = selectedProvince && selectedDistrict && selectedSector && selectedCell
    ? getVillages(selectedProvince, selectedDistrict, selectedSector, selectedCell)
    : [];

  // Reset dependent fields when parent changes
  React.useEffect(() => {
    if (!selectedProvince) {
      setSelectedDistrict('');
      setSelectedSector('');
      setSelectedCell('');
      setSelectedVillage('');
    }
  }, [selectedProvince]);

  React.useEffect(() => {
    if (!selectedDistrict) {
      setSelectedSector('');
      setSelectedCell('');
      setSelectedVillage('');
    }
  }, [selectedDistrict]);

  React.useEffect(() => {
    if (!selectedSector) {
      setSelectedCell('');
      setSelectedVillage('');
    }
  }, [selectedSector]);

  React.useEffect(() => {
    if (!selectedCell) {
      setSelectedVillage('');
    }
  }, [selectedCell]);

  // Filter cases based on selected location
  const filteredCases = useMemo(() => {
    const selected = {
      province: selectedProvince || undefined,
      district: selectedDistrict || undefined,
      sector: selectedSector || undefined,
      cell: selectedCell || undefined,
      village: selectedVillage || undefined,
    };

    return cases.filter(case_ => matchesLocation(case_.location, selected));
  }, [cases, selectedProvince, selectedDistrict, selectedSector, selectedCell, selectedVillage]);

  // Determine what level to show statistics for
  // If village selected -> show village stats (single row)
  // If cell selected -> show villages in that cell
  // If sector selected -> show cells in that sector
  // If district selected -> show sectors in that district
  // If province selected -> show districts in that province
  // If nothing selected -> show provinces
  const getStatisticsLevel = () => {
    if (selectedVillage) return 'village';
    if (selectedCell) return 'cell';
    if (selectedSector) return 'sector';
    if (selectedDistrict) return 'district';
    if (selectedProvince) return 'province';
    return 'country';
  };

  const statisticsLevel = getStatisticsLevel();

  // Calculate statistics based on the determined level
  const regionStats = useMemo(() => {
    const stats: Record<string, {
      total: number;
      pending: number;
      inProgress: number;
      resolved: number;
    }> = {};

    filteredCases.forEach((case_) => {
      const parsed = parseLocation(case_.location);
      let key = '';

      if (statisticsLevel === 'village') {
        // Show single village
        key = parsed.village || t('dashboard.manager.unknown');
      } else if (statisticsLevel === 'cell') {
        // Show villages in selected cell
        key = parsed.village || t('dashboard.manager.unknown');
      } else if (statisticsLevel === 'sector') {
        // Show cells in selected sector
        key = parsed.cell || t('dashboard.manager.unknown');
      } else if (statisticsLevel === 'district') {
        // Show sectors in selected district
        key = parsed.sector || t('dashboard.manager.unknown');
      } else if (statisticsLevel === 'province') {
        // Show districts in selected province
        key = parsed.district || t('dashboard.manager.unknown');
      } else {
        // Show provinces
        key = parsed.province || t('dashboard.manager.unknown');
      }

      if (!stats[key]) {
        stats[key] = {
          total: 0,
          pending: 0,
          inProgress: 0,
          resolved: 0,
        };
      }

      stats[key].total++;
      if (case_.status === 'pending') stats[key].pending++;
      else if (case_.status === 'in_progress') stats[key].inProgress++;
      else if (case_.status === 'resolved') stats[key].resolved++;
    });

    // Convert to array and sort by total cases (descending)
    return Object.entries(stats)
      .map(([region, data]) => ({ region, ...data }))
      .filter(item => item.total > 0) // Only show regions with cases
      .sort((a, b) => b.total - a.total);
  }, [filteredCases, statisticsLevel, t]);

  // Get the label for the current statistics level (what we're displaying in the table)
  // The label should be the NEXT level down from what was selected
  const getLevelLabel = () => {
    if (statisticsLevel === 'village') return t('location.village'); // Village selected, showing single village
    if (statisticsLevel === 'cell') return t('location.village'); // Cell selected, showing villages
    if (statisticsLevel === 'sector') return t('location.cell'); // Sector selected, showing cells
    if (statisticsLevel === 'district') return t('location.sector'); // District selected, showing sectors
    if (statisticsLevel === 'province') return t('location.district'); // Province selected, showing districts
    return t('location.province'); // Nothing selected, showing provinces
  };

  const handleClear = () => {
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedSector('');
    setSelectedCell('');
    setSelectedVillage('');
  };

  const hasSelection = selectedProvince || selectedDistrict || selectedSector || selectedCell || selectedVillage;

  return (
    <Card className="shadow-sm">
      <Card.Header>
        <h5 className="mb-0">{t('dashboard.manager.regionStatistics')}</h5>
      </Card.Header>
      <Card.Body>
        {/* Location Filters */}
        <div className="mb-4">
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('location.province')}</Form.Label>
                <Form.Select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                >
                  <option value="">{t('dashboard.manager.allProvinces')}</option>
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
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    <option value="">{t('dashboard.manager.allDistricts')}</option>
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
                    onChange={(e) => setSelectedSector(e.target.value)}
                  >
                    <option value="">{t('dashboard.manager.allSectors')}</option>
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
                    onChange={(e) => setSelectedCell(e.target.value)}
                  >
                    <option value="">{t('dashboard.manager.allCells')}</option>
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
                    <option value="">{t('dashboard.manager.allVillages')}</option>
                    {villages.map(village => (
                      <option key={village} value={village}>{village}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            {hasSelection && (
              <Col md={12}>
                <Button variant="outline-secondary" size="sm" onClick={handleClear}>
                  {t('dashboard.manager.clearFilters')}
                </Button>
              </Col>
            )}
          </Row>
        </div>

        {/* Statistics Table */}
        {regionStats.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted mb-0">{t('dashboard.manager.noRegionData')}</p>
          </div>
        ) : (
          <div className="table-responsive">
            <div className="mb-2">
              <small className="text-muted">
                {t('dashboard.manager.showingStatisticsFor', { 
                  level: getLevelLabel(),
                  count: filteredCases.length 
                })}
              </small>
            </div>
            <Table hover>
              <thead>
                <tr>
                  <th>{getLevelLabel()}</th>
                  <th className="text-center">{t('dashboard.manager.total')}</th>
                  <th className="text-center">{t('status.pending')}</th>
                  <th className="text-center">{t('status.inProgress')}</th>
                  <th className="text-center">{t('status.resolved')}</th>
                </tr>
              </thead>
              <tbody>
                {regionStats.map((stat) => (
                  <tr key={stat.region}>
                    <td><strong>{stat.region}</strong></td>
                    <td className="text-center">
                      <Badge bg="primary">{stat.total}</Badge>
                    </td>
                    <td className="text-center">
                      {stat.pending > 0 && (
                        <Badge bg="warning" text="dark">{stat.pending}</Badge>
                      )}
                      {stat.pending === 0 && <span className="text-muted">-</span>}
                    </td>
                    <td className="text-center">
                      {stat.inProgress > 0 && (
                        <Badge bg="info" text="dark">{stat.inProgress}</Badge>
                      )}
                      {stat.inProgress === 0 && <span className="text-muted">-</span>}
                    </td>
                    <td className="text-center">
                      {stat.resolved > 0 && (
                        <Badge bg="success">{stat.resolved}</Badge>
                      )}
                      {stat.resolved === 0 && <span className="text-muted">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RegionStatistics;
