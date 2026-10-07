import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Truck, MapPin, CreditCard, User, CheckCircle2, Lock, ArrowDown } from 'lucide-react';
import { MerchantConfig } from '../../types/merchant';
import { ShipmentData } from '../../types/shipment';
import { baseShipmentSchema, BaseShipmentFormValues } from '../../utils/validation';
import { isValidPeruvianPhone, isValidPhoneNumber, extractPeruvianMobileDigits } from '../../utils/phone';
import { getFutureScheduleOptions } from '../../utils/date';
import { FormHeader } from './FormHeader';
import { CutoffNotice } from './CutoffNotice';
import { PhoneInput } from './PhoneInput';
import { DateScheduler } from './DateScheduler';
import { FormActions } from './FormActions';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { agencias as agenciasShalom } from '../../data/agencias';
import { agencias as agenciasOlva } from '../../data/agenciasOlva';

export interface ShippingFormProps {
  merchant: MerchantConfig;
  initialValues?: Partial<ShipmentData> | null;
  onSubmit: (data: ShipmentData) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({
  merchant,
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitError,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const futureOptions = getFutureScheduleOptions();
  const defaultFutureDate = futureOptions[0]?.value || '';

  // Couriers list from merchant or defaults
  const couriers = merchant.allowedCouriers && merchant.allowedCouriers.length > 0
    ? merchant.allowedCouriers
    : ['Shalom', 'Olva Courier', 'Marvisur'];

  // Default initial form state
  const defaultValues: BaseShipmentFormValues = {
    phone: initialValues?.phone || '',
    fullName: initialValues?.fullName || '',
    documentType: initialValues?.documentType || 'DNI',
    documentNumber: initialValues?.documentNumber || '',
    deliveryType: (initialValues?.deliveryType as any) || 'agencia',
    courier: initialValues?.courier || merchant.defaultCourier || couriers[0],
    destinationSede: initialValues?.destinationSede || '',
    department: initialValues?.department || '',
    province: initialValues?.province || '',
    district: initialValues?.district || '',
    reference: initialValues?.reference || '',
    preferredDate: initialValues?.preferredDate || defaultFutureDate,
    notes: initialValues?.notes || '',
  };
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BaseShipmentFormValues>({
    resolver: zodResolver(baseShipmentSchema),
    defaultValues,
    mode: 'onChange',
  });

  const currentPhone = watch('phone');
  const selectedCourier = watch('courier');
  const destinationQuery = watch('destinationSede') || '';
  const [isAgencyListOpen, setIsAgencyListOpen] = useState(false);
  const [activeAgencyIndex, setActiveAgencyIndex] = useState(-1);

  const matchingAgencies = useMemo(() => {
    const normalizedQuery = destinationQuery
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .trim();
    const normalizedCourier = selectedCourier?.toLocaleLowerCase() || '';
    const courierAgencies = normalizedCourier.includes('shalom')
      ? agenciasShalom
      : normalizedCourier.includes('olva')
        ? agenciasOlva
        : [];

    return courierAgencies
      .filter(({ name, place, reference }) => {
        const searchableText = `${name} ${place} ${reference}`
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLocaleLowerCase();
        return searchableText.includes(normalizedQuery);
      })
      /*.slice(0, 8)*/;
  }, [destinationQuery, selectedCourier]);

  // Check whether the phone is currently valid
  const isPhoneValid = merchant.phoneCountryCode === '+51' || !merchant.phoneCountryCode
    ? isValidPeruvianPhone(currentPhone)
    : isValidPhoneNumber(currentPhone, merchant.phoneCountryCode);

  // Progressive disclosure state
  const [isPhoneUnlocked, setIsPhoneUnlocked] = useState<boolean>(() => {
    return Boolean(initialValues?.phone && isValidPeruvianPhone(initialValues.phone));
  });

  // Auto-unlock progressive fields as soon as phone reaches a valid 9-digit format
  useEffect(() => {
    if (isPhoneValid) {
      setIsPhoneUnlocked(true);
    }
  }, [isPhoneValid]);

  // Smooth scroll to first error if submit fails
  useEffect(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const el = document.getElementById(firstKey) || document.getElementById(`field-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus?.();
      }
    }
  }, [errors]);

  const onFormSubmit = (data: BaseShipmentFormValues) => {
    const rawMobile = extractPeruvianMobileDigits(data.phone);

    const shipment: ShipmentData = {
      merchantId: merchant.id,
      phone: data.phone,
      rawPhone: rawMobile,
      fullName: data.fullName.trim(),
      documentType: data.documentType || 'DNI',
      documentNumber: data.documentNumber?.trim(),
      deliveryType: data.deliveryType || 'agencia',
      courier: data.courier,
      destinationSede: data.destinationSede.trim(),
      department: data.department,
      province: data.province,
      district: data.district,
      reference: data.reference,
      preferredDate: data.preferredDate,
      notes: data.notes?.trim(),
    };

    onSubmit(shipment);
  };

  return (
    <div className="space-y-6">
      {/* Merchant Header */}
      <FormHeader merchant={merchant} />

      {/* Cutoff Alert Notification */}
      <CutoffNotice merchant={merchant} />

      {/* Global submission error alert */}
      {submitError && (
        <Alert type="error" title="No se pudo registrar el envío">
          {submitError}
        </Alert>
      )}

      {/* Step Tracker */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-slate-800">
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              isPhoneUnlocked
                ? 'bg-emerald-500 text-white'
                : 'bg-merchant-primary text-white'
            }`}
          >
            {isPhoneUnlocked ? '✓' : '1'}
          </span>
          <span>1. Tu WhatsApp</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              isPhoneUnlocked
                ? 'bg-merchant-primary text-white'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            2
          </span>
          <span className={isPhoneUnlocked ? 'text-slate-800 font-semibold' : ''}>
            2. Destino & Fecha
          </span>
        </div>
      </div>

      {/* The Form */}
      <form
        ref={formRef}
        onSubmit={handleSubmit(onFormSubmit)}
        noValidate
        className="space-y-5 text-left"
      >
        {/* STEP 1: WhatsApp Input */}
        <div className="bg-slate-50/60 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                id="phone"
                label="Tu WhatsApp"
                value={field.value || ''}
                defaultCountryCode={merchant.phoneCountryCode || '+51'}
                placeholder={merchant.phonePlaceholder || '9XXXXXXXX'}
                helpText="Ingresa los 9 dígitos de tu celular personal. Al validarlo, se habilitarán los datos de envío."
                required
                error={errors.phone?.message}
                disabled={isSubmitting}
                onChange={(normalized) => {
                  field.onChange(normalized);
                  setValue('phone', normalized, { shouldValidate: true });
                }}
              />
            )}
          />

          {/* Validation Status message below phone input */}
          {!isPhoneUnlocked ? (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-800 text-xs animate-fadeIn">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Escribe tu número de WhatsApp válido para continuar con tu pedido.
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs animate-fadeIn">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp validado correctamente</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Desbloqueado
              </span>
            </div>
          )}
        </div>

        {/* STEP 2: Progressive Fields (Unlocked when phone is valid) */}
        {isPhoneUnlocked && (
          <div className="space-y-4 pt-1 animate-fadeIn">
            {/* Divider notice */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider pt-1">
              <ArrowDown className="w-4 h-4 text-merchant-primary animate-bounce" />
              <span>Selecciona tipo de envio</span>
            </div>

            {/* 1. Empresa de Transporte */}
            <div className="w-full text-left space-y-1.5">
              <label
                htmlFor="courier"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4 text-slate-500" />
                <span>Empresa de Transporte</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>

              {/* Courier Quick Selector Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {couriers.map((c) => {
                  const isSelected = selectedCourier === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        if (selectedCourier !== c) {
                          setValue('courier', c, { shouldValidate: true });
                          setValue('destinationSede', '', { shouldDirty: true });
                        }
                      }}
                      className={`
                        p-2.5 rounded-xl border text-xs font-bold text-center transition-all duration-150 flex items-center justify-center gap-1.5
                        ${
                          isSelected
                            ? 'border-merchant-primary bg-merchant-primary text-white shadow-sm ring-2 ring-merchant-primary/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }
                      `}
                    >
                      <Truck className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>

              {errors.courier?.message && (
                <p role="alert" className="text-xs text-rose-600 font-medium">
                  {errors.courier.message}
                </p>
              )}
            </div>

            {/* 2. Ciudad de Destino */}
            <Controller
              name="destinationSede"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    id="destinationSede"
                    type="text"
                    label="Sede de Destino"
                    placeholder="Escribe el nombre o ubicación de la sede"
                    isRequired
                    leftIcon={<MapPin className="w-4 h-4" />}
                    error={errors.destinationSede?.message}
                    helpText="También puedes escribir una dirección exacta."
                    disabled={isSubmitting}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={isAgencyListOpen}
                    aria-controls="destinationSede-options"
                    aria-activedescendant={
                      activeAgencyIndex >= 0 && matchingAgencies[activeAgencyIndex]
                        ? `destinationSede-option-${activeAgencyIndex}`
                        : undefined
                    }
                    onFocus={() => setIsAgencyListOpen(true)}
                    onBlur={() => {
                      field.onBlur();
                      setIsAgencyListOpen(false);
                    }}
                    onChange={(event) => {
                      field.onChange(event);
                      setActiveAgencyIndex(-1);
                      setIsAgencyListOpen(true);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowDown' && matchingAgencies.length > 0) {
                        event.preventDefault();
                        setIsAgencyListOpen(true);
                        setActiveAgencyIndex((current) =>
                          current < matchingAgencies.length - 1 ? current + 1 : 0
                        );
                      } else if (event.key === 'ArrowUp' && matchingAgencies.length > 0) {
                        event.preventDefault();
                        setIsAgencyListOpen(true);
                        setActiveAgencyIndex((current) =>
                          current > 0 ? current - 1 : matchingAgencies.length - 1
                        );
                      } else if (
                        event.key === 'Enter' &&
                        isAgencyListOpen &&
                        matchingAgencies[activeAgencyIndex]
                      ) {
                        event.preventDefault();
                        field.onChange(matchingAgencies[activeAgencyIndex].name);
                        setIsAgencyListOpen(false);
                      } else if (event.key === 'Escape') {
                        setIsAgencyListOpen(false);
                      }
                    }}
                  />
                  {isAgencyListOpen && (
                    <ul
                      id="destinationSede-options"
                      role="listbox"
                      className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                    >
                      {matchingAgencies.length > 0 ? (
                        matchingAgencies.map((agency, index) => (
                          <li
                            id={`destinationSede-option-${index}`}
                            key={`${agency.name}-${agency.place}`}
                            role="option"
                            aria-selected={activeAgencyIndex === index}
                          >
                            <button
                              type="button"
                              className={`w-full px-3.5 py-2 text-left transition-colors ${
                                activeAgencyIndex === index ? 'bg-slate-100' : 'hover:bg-slate-50'
                              }`}
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => {
                                field.onChange(agency.name);
                                setIsAgencyListOpen(false);
                                setActiveAgencyIndex(-1);
                              }}
                            >
                              <span className="block text-sm font-semibold text-slate-800">
                                {agency.name}
                              </span>
                              <span className="block text-xs text-slate-500">{agency.reference}</span>
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="px-3.5 py-2 text-sm text-slate-500" role="status">
                          No se encontraron sedes.
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            />

            {/* 3. DNI & 4. Nombre Completo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                id="documentNumber"
                label="DNI del Destinatario"
                placeholder="8 dígitos"
                isRequired
                leftIcon={<CreditCard className="w-4 h-4" />}
                error={errors.documentNumber?.message}
                helpText="Para retirar el paquete en agencia."
                disabled={isSubmitting}
                {...register('documentNumber')}
              />

              <Input
                id="fullName"
                label="Nombre Completo"
                placeholder="Nombres y Apellidos"
                isRequired
                leftIcon={<User className="w-4 h-4" />}
                error={errors.fullName?.message}
                helpText="Persona autorizada para recoger."
                disabled={isSubmitting}
                {...register('fullName')}
              />
            </div>

            {/* 5. Agendar Fecha (Día siguiente y dejando 2 días) */}
            <div className="pt-2">
              <Controller
                name="preferredDate"
                control={control}
                render={({ field }) => (
                  <DateScheduler
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      setValue('preferredDate', val, { shouldValidate: true });
                    }}
                    error={errors.preferredDate?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            {/* Notas opcionales */}
            <div className="w-full text-left pt-1">
              <label
                htmlFor="notes"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Indicaciones u Observaciones (Opcional)
              </label>
              <textarea
                id="notes"
                rows={2}
                placeholder="Ej: Color de prenda, referencia de ubicación, etc."
                disabled={isSubmitting}
                {...register('notes')}
                className="block w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-merchant-primary focus:ring-4 focus:ring-merchant-primary/10"
              />
            </div>

            {/* Form Action CTA */}
            <FormActions
              isSubmitting={isSubmitting}
              submitButtonText="Agendar y ver resumen"
              submittingText="Procesando..."
            />
          </div>
        )}
      </form>
    </div>
  );
};
