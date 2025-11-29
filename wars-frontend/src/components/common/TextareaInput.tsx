import React from 'react';
import { Form } from 'react-bootstrap';
import type { UseFormRegister } from 'react-hook-form';

interface FieldError {
  message?: string;
}

interface TextareaInputProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

const TextareaInput: React.FC<TextareaInputProps> = ({
  label,
  name,
  register,
  error,
  placeholder,
  rows = 4,
  required = false,
}) => {
  return (
    <Form.Group className="mb-3">
      <Form.Label>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </Form.Label>
      <Form.Control
        as="textarea"
        rows={rows}
        placeholder={placeholder}
        {...register(name, { required: required ? `${label} is required` : false })}
        isInvalid={!!error}
      />
      {error && (
        <Form.Control.Feedback type="invalid">
          {error.message}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default TextareaInput;

