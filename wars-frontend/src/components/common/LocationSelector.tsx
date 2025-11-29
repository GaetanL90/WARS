import React from 'react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { UseFormRegister } from 'react-hook-form';
import {
  getProvinces,
  getDistricts,
  getSectors,
  getCells,
  getVillages,
} from '../../utils/locationData';

interface FieldError {
  message?: string;
}

interface LocationSelectorProps {
  register: UseFormRegister<any>;
  errors: {
    province?: FieldError;
    district?: FieldError;
    sector?: FieldError;
    cell?: FieldError;
    village?: FieldError;
  };
  watch: (name: string) => any;
  setValue: (name: string, value: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  register,
  errors,
  watch,
  setValue,
}) => {
  const { t } = useTranslation();
  const province = watch('province');
  const district = watch('district');
  const sector = watch('sector');
  const cell = watch('cell');

  const provinces = getProvinces();
  const districts = province ? getDistricts(province) : [];
  const sectors = province && district ? getSectors(province, district) : [];
  const cells = province && district && sector ? getCells(province, district, sector) : [];
  const villages = province && district && sector && cell
    ? getVillages(province, district, sector, cell)
    : [];

  // Reset dependent fields when parent changes
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('province', e.target.value);
    setValue('district', '');
    setValue('sector', '');
    setValue('cell', '');
    setValue('village', '');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('district', e.target.value);
    setValue('sector', '');
    setValue('cell', '');
    setValue('village', '');
  };

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('sector', e.target.value);
    setValue('cell', '');
    setValue('village', '');
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('cell', e.target.value);
    setValue('village', '');
  };

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>
          {t('location.province')} <span className="text-danger">*</span>
        </Form.Label>
        <Form.Select
          {...register('province', { required: t('location.provinceRequired') })}
          isInvalid={!!errors.province}
          onChange={handleProvinceChange}
        >
          <option value="">{t('location.selectProvince')}</option>
          {provinces.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </Form.Select>
        {errors.province && (
          <Form.Control.Feedback type="invalid">
            {errors.province.message}
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>
          {t('location.district')} <span className="text-danger">*</span>
        </Form.Label>
        <Form.Select
          {...register('district', { required: t('location.districtRequired') })}
          isInvalid={!!errors.district}
          disabled={!province}
          onChange={handleDistrictChange}
        >
          <option value="">{t('location.selectDistrict')}</option>
          {districts.map((dist) => (
            <option key={dist} value={dist}>
              {dist}
            </option>
          ))}
        </Form.Select>
        {errors.district && (
          <Form.Control.Feedback type="invalid">
            {errors.district.message}
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>
          {t('location.sector')} <span className="text-danger">*</span>
        </Form.Label>
        <Form.Select
          {...register('sector', { required: t('location.sectorRequired') })}
          isInvalid={!!errors.sector}
          disabled={!district}
          onChange={handleSectorChange}
        >
          <option value="">{t('location.selectSector')}</option>
          {sectors.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </Form.Select>
        {errors.sector && (
          <Form.Control.Feedback type="invalid">
            {errors.sector.message}
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>
          {t('location.cell')} <span className="text-danger">*</span>
        </Form.Label>
        <Form.Select
          {...register('cell', { required: t('location.cellRequired') })}
          isInvalid={!!errors.cell}
          disabled={!sector}
          onChange={handleCellChange}
        >
          <option value="">{t('location.selectCell')}</option>
          {cells.map((cel) => (
            <option key={cel} value={cel}>
              {cel}
            </option>
          ))}
        </Form.Select>
        {errors.cell && (
          <Form.Control.Feedback type="invalid">
            {errors.cell.message}
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>
          {t('location.village')} <span className="text-danger">*</span>
        </Form.Label>
        <Form.Select
          {...register('village', { required: t('location.villageRequired') })}
          isInvalid={!!errors.village}
          disabled={!cell}
        >
          <option value="">{t('location.selectVillage')}</option>
          {villages.map((vil) => (
            <option key={vil} value={vil}>
              {vil}
            </option>
          ))}
        </Form.Select>
        {errors.village && (
          <Form.Control.Feedback type="invalid">
            {errors.village.message}
          </Form.Control.Feedback>
        )}
      </Form.Group>
    </>
  );
};

export default LocationSelector;

