import React, { useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import type { UseFormRegister } from 'react-hook-form';

interface FieldError {
  message?: string;
}

interface FileUploadInputProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  accept?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({
  label,
  name,
  register,
  error,
  accept = 'image/*',
  required = false,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
    if (onChange) {
      onChange(e);
    }
  };

  const { ref, onChange: registerOnChange, ...registerProps } = register(name, {
    required: required ? `${label} is required` : false,
  });

  return (
    <Form.Group className="mb-3">
      <Form.Label>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </Form.Label>
      <div>
        <Form.Control
          type="file"
          accept={accept}
          {...registerProps}
          isInvalid={!!error}
          ref={(e) => {
            ref(e);
            fileInputRef.current = e;
          }}
          onChange={(e) => {
            registerOnChange(e);
            handleFileChange(e as React.ChangeEvent<HTMLInputElement>);
          }}
        />
        {fileName && (
          <div className="mt-2">
            <small className="text-muted">Selected: {fileName}</small>
          </div>
        )}
      </div>
      {error && (
        <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
          {error.message}
        </Form.Control.Feedback>
      )}
      <Form.Text className="text-muted">
        {accept.includes('image') ? 'Upload an image file (JPG, PNG, etc.)' : 'Upload a file'}
      </Form.Text>
    </Form.Group>
  );
};

export default FileUploadInput;

