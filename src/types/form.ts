export type FieldType =
  | 'text'
  | 'phone'
  | 'email'
  | 'number'
  | 'select'
  | 'textarea'
  | 'checkbox';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface FormFieldConfig {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  options?: SelectOption[];
  helpText?: string;
  rows?: number;
  min?: number;
  max?: number;
  colSpan?: 1 | 2;
  section?: 'personal' | 'delivery' | 'additional';
}

export interface FormError {
  field: string;
  message: string;
}
