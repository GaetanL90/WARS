import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { FormContainer, TextInput, FileUploadInput } from '../../components/common';
import { fileToBase64 } from '../../utils/mockData';

// Zod validation schema - will be created with translations
const createProfileSettingsSchema = (t: any) => z.object({
  name: z.string().min(2, t('profile.nameMinLength')),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  profileImage: z.instanceof(FileList).optional(),
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password.length >= 8;
  }
  return true;
}, {
  message: t('profile.passwordMinLength'),
  path: ['password'],
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: t('errors.passwordMismatch'),
  path: ['confirmPassword'],
});

const ProfileSettings: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateUserProfile } = useAuth();
  const { setLoading, showToast } = useApp();
  
  const profileSettingsSchema = createProfileSettingsSchema(t);
  type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>;
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      password: '',
      confirmPassword: '',
    },
  });

  // Watch for image changes
  const imageFile = watch('profileImage');

  useEffect(() => {
    if (user?.profileImage) {
      setPreviewImage(user.profileImage);
    }
  }, [user]);

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [imageFile]);

  const onSubmit = async (data: ProfileSettingsFormData) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updates: Partial<typeof user> = {
        name: data.name,
        phone: data.phone || undefined,
      };

      // Handle profile image upload
      if (data.profileImage && data.profileImage.length > 0) {
        const imageBase64 = await fileToBase64(data.profileImage[0]);
        updates.profileImage = imageBase64;
      }

      // Update user profile
      updateUserProfile(updates);

      // Handle password change (mock only - just show success)
      if (data.password && data.password.length > 0) {
        // In a real app, this would call an API to change the password
        // For now, we just show a success message
      }

      setSuccess(t('profile.profileUpdated'));
      showToast(t('profile.profileUpdated'), 'success');

      // Clear password fields
      setValue('password', '');
      setValue('confirmPassword', '');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Please log in to view your profile settings.</Alert>
      </Container>
    );
  }

  return (
    <FormContainer title="Profile Settings">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col md={4} className="mb-4">
            <div className="text-center">
              <div
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto 1rem',
                  border: '3px solid #dee2e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8f9fa',
                }}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: '3rem',
                      color: '#6c757d',
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <FileUploadInput
                label="Profile Image"
                name="profileImage"
                register={register}
                error={errors.profileImage}
                accept="image/*"
                required={false}
              />
            </div>
          </Col>
          <Col md={8}>
            <TextInput
              label="Full Name"
              name="name"
              register={register}
              error={errors.name}
              placeholder="Enter your full name"
              required
            />

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={user.email}
                disabled
                style={{ backgroundColor: '#e9ecef' }}
              />
              <Form.Text className="text-muted">
                Email cannot be changed
              </Form.Text>
            </Form.Group>

            <TextInput
              label="Phone Number"
              name="phone"
              register={register}
              error={errors.phone}
              placeholder="Enter your phone number"
              type="tel"
              required={false}
            />

            <hr className="my-4" />

            <h5 className="mb-3">Change Password</h5>
            <Form.Text className="text-muted mb-3 d-block">
              Leave blank to keep current password
            </Form.Text>

            <TextInput
              label="New Password"
              name="password"
              register={register}
              error={errors.password}
              placeholder="Enter new password (min 8 characters)"
              type="password"
              required={false}
            />

            <TextInput
              label="Confirm New Password"
              name="confirmPassword"
              register={register}
              error={errors.confirmPassword}
              placeholder="Confirm new password"
              type="password"
              required={false}
            />

            <div className="d-flex gap-2 mt-4">
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setValue('name', user.name || '');
                  setValue('phone', user.phone || '');
                  setValue('password', '');
                  setValue('confirmPassword', '');
                  setPreviewImage(user.profileImage || null);
                }}
              >
                Reset
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </FormContainer>
  );
};

export default ProfileSettings;

