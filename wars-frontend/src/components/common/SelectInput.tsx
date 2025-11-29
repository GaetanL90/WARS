import React from 'react';
import { Form } from 'react-bootstrap';
import type { UseFormRegister } from 'react-hook-form';

interface FieldError {
  message?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  options: SelectOption[];
  required?: boolean;
  placeholder?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  name,
  register,
  error,
  options,
  required = false,
  placeholder,
}) => {
  return (
    <Form.Group className="mb-3">
      <Form.Label>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </Form.Label>
      <Form.Select
        {...register(name, { required: required ? `${label} is required` : false })}
        isInvalid={!!error}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Form.Select>
      {error && (
        <Form.Control.Feedback type="invalid">
          {error.message}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default SelectInput;

