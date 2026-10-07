import { z } from 'zod';
import { FormFieldConfig } from '../types/form';
import { cleanDigits, isValidPeruvianPhone, isValidPhoneNumber } from './phone';

/**
 * Peruvian mobile phone validation schema
 */
export const peruvianPhoneSchema = z
  .string({ required_error: 'El número de WhatsApp es obligatorio' })
  .trim()
  .min(1, 'Ingresa tu número de WhatsApp')
  .refine(
    (val) => {
      return isValidPeruvianPhone(val);
    },
    {
      message: 'Ingresa un número de WhatsApp válido de 9 dígitos que comience con 9 (ej: 987654321)',
    }
  );

/**
 * Generic international phone schema
 */
export const internationalPhoneSchema = z
  .string({ required_error: 'El teléfono es obligatorio' })
  .trim()
  .min(1, 'Ingresa tu teléfono')
  .refine(
    (val) => {
      return isValidPhoneNumber(val);
    },
    {
      message: 'Ingresa un número de teléfono válido (7 a 15 dígitos)',
    }
  );

/**
 * Helper to get the appropriate phone schema based on country dial code
 */
export function getPhoneSchemaByCountry(dialCode = '+51') {
  if (dialCode === '+51') {
    return peruvianPhoneSchema;
  }
  return internationalPhoneSchema;
}

/**
 * Base shipment schema with standard logistics validation
 */
export const baseShipmentSchema = z.object({
  phone: peruvianPhoneSchema,
  fullName: z
    .string({ required_error: 'Ingresa tu nombre y apellido' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  documentType: z.string().optional(),
  documentNumber: z
    .string()
    .trim()
    .min(1, 'Ingresa el número de DNI')
    .refine(
      (val) => {
        if (!val) return false;
        const clean = cleanDigits(val);
        return clean.length >= 8 && clean.length <= 12;
      },
      {
        message: 'Ingresa un número de documento válido (8 a 12 dígitos)',
      }
    ),
  deliveryType: z.enum(['agencia', 'domicilio']).default('agencia'),
  courier: z.string({ required_error: 'Selecciona la empresa de transporte' }).min(1, 'Selecciona la empresa de transporte'),
  destinationSede: z.string({ required_error: 'Ingresa la ciudad o agencia de destino' }).trim().min(3, 'Ingresa la ciudad o agencia de destino (mínimo 3 caracteres)'),
  department: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  reference: z.string().trim().optional(),
  preferredDate: z.string({ required_error: 'Selecciona una fecha de envío' }).min(1, 'Selecciona una fecha de envío'),
  notes: z.string().trim().optional(),
});

export type BaseShipmentFormValues = z.infer<typeof baseShipmentSchema>;

/**
 * Generates a dynamic Zod validation schema based on merchant's field configuration
 */
export function createDynamicFormSchema(
  fields: FormFieldConfig[],
  phoneCountryCode = '+51'
) {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let validator: z.ZodTypeAny;

    switch (field.type) {
      case 'phone':
        validator = field.required
          ? getPhoneSchemaByCountry(phoneCountryCode)
          : z.string().optional();
        break;

      case 'email':
        validator = field.required
          ? z.string({ required_error: `${field.label} es obligatorio` }).email('Ingresa un correo electrónico válido')
          : z.string().email('Ingresa un correo válido').optional().or(z.literal(''));
        break;

      case 'number':
        let numValidator = z.coerce.number({
          invalid_type_error: `${field.label} debe ser un número`,
        });
        if (field.min !== undefined) numValidator = numValidator.min(field.min, `Mínimo ${field.min}`);
        if (field.max !== undefined) numValidator = numValidator.max(field.max, `Máximo ${field.max}`);
        validator = field.required ? numValidator : numValidator.optional();
        break;

      case 'checkbox':
        validator = field.required
          ? z.boolean().refine((val) => val === true, {
              message: `Debes marcar ${field.label}`,
            })
          : z.boolean().optional();
        break;

      case 'select':
      case 'text':
      case 'textarea':
      default:
        let strValidator = z.string({
          required_error: `${field.label} es obligatorio`,
        }).trim();

        if (field.required) {
          strValidator = strValidator.min(1, `${field.label} es obligatorio`);
        } else {
          validator = z.string().trim().optional();
          shape[field.id] = validator;
          return;
        }

        if (field.min) {
          strValidator = strValidator.min(field.min, `Mínimo ${field.min} caracteres`);
        }
        if (field.max) {
          strValidator = strValidator.max(field.max, `Máximo ${field.max} caracteres`);
        }
        validator = strValidator;
        break;
    }

    shape[field.id] = validator;
  });

  return z.object(shape);
}
