import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, Button, Modal, Alert } from 'react-bootstrap';
import { FormContainer, TextareaInput, SelectInput, FileUploadInput, LocationSelector } from '../../components/common';
import { submitCase } from '../../api/axios';
import { useApp } from '../../contexts/AppContext';
import { formatLocation, type Location } from '../../utils/locationData';

// Zod validation schema - will be created with translations in component
const createReportIssueSchema = (t: any) => z.object({
  issueType: z.string().min(1, t('reportIssue.issueTypeRequired')),
  description: z.string().min(10, t('reportIssue.descriptionMinLength')),
  province: z.string().min(1, t('location.provinceRequired')),
  district: z.string().min(1, t('location.districtRequired')),
  sector: z.string().min(1, t('location.sectorRequired')),
  cell: z.string().min(1, t('location.cellRequired')),
  village: z.string().min(1, t('location.villageRequired')),
  image: z.instanceof(FileList).optional(),
});

const ReportIssue: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setLoading, showToast } = useApp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');

  const reportIssueSchema = createReportIssueSchema(t);
  type ReportIssueFormData = z.infer<typeof reportIssueSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ReportIssueFormData>({
    resolver: zodResolver(reportIssueSchema),
  });

  const issueTypeOptions = [
    { value: 'Leak', label: t('reportIssue.issueTypes.leak') },
    { value: 'Contamination', label: t('reportIssue.issueTypes.contamination') },
    { value: 'No Water', label: t('reportIssue.issueTypes.noWater') },
    { value: 'Infrastructure Damage', label: t('reportIssue.issueTypes.infrastructureDamage') },
    { value: 'Other', label: t('reportIssue.issueTypes.other') },
  ];

  const onSubmit = async (data: ReportIssueFormData) => {
    setError('');
    setLoading(true);

    try {
      // Build location object
      const location: Location = {
        province: data.province,
        district: data.district,
        sector: data.sector,
        cell: data.cell,
        village: data.village,
      };

      // Prepare data for submission
      const submitData = {
        issue_type: data.issueType,
        description: data.description,
        location: formatLocation(location),
        image: data.image && data.image.length > 0 ? data.image[0] : undefined,
      };

      // Call submitCase function (mock implementation)
      await submitCase(submitData);

      // Show success toast
      showToast(t('reportIssue.submittedSuccessfully'), 'success');

      // Show success modal
      setShowSuccessModal(true);
    } catch (err: any) {
      const errorMessage = err.message || t('reportIssue.failedToSubmit');
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Redirect to dashboard My Cases
    navigate('/cases');
  };

  return (
    <>
      <FormContainer title={t('reportIssue.title')}>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit(onSubmit)}>
          <SelectInput
            label={t('reportIssue.issueType')}
            name="issueType"
            register={register}
            error={errors.issueType}
            options={issueTypeOptions}
            required
            placeholder={t('reportIssue.selectIssueType')}
          />

          <TextareaInput
            label={t('reportIssue.description')}
            name="description"
            register={register}
            error={errors.description}
            placeholder={t('reportIssue.descriptionPlaceholder')}
            rows={6}
            required
          />

          <div>
            <h5 className="mb-3">{t('reportIssue.location')}</h5>
            <LocationSelector
              register={register}
              errors={errors}
              watch={watch}
              setValue={(name: string, value: string) => setValue(name as any, value)}
            />
          </div>

          <FileUploadInput
            label={t('reportIssue.uploadImage')}
            name="image"
            register={register}
            error={errors.image}
            accept="image/*"
            required={false}
          />

          <div className="d-flex gap-2">
            <Button
              variant="primary"
              type="submit"
            >
              {t('reportIssue.submitReport')}
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate('/cases')}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </Form>
      </FormContainer>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={handleSuccessModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('common.success')}!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('reportIssue.success')}</p>
          <p>{t('reportIssue.redirectMessage')}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSuccessModalClose}>
            {t('common.goToMyCases')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReportIssue;

