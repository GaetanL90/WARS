import React from 'react';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { SensorMonitoring } from '../../components/sensors';

const SensorsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container fluid className="mt-4">
      <div className="mb-4">
        <h1 className="mb-2">{t('sensors.realTimeMonitoring')}</h1>
        <p className="text-muted">
          {t('sensors.pageDescription')}
        </p>
      </div>
      <SensorMonitoring />
    </Container>
  );
};

export default SensorsPage;

