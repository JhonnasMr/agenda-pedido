import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Truck, MapPin, CreditCard, User, Mail, CheckCircle2, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
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
import { districts as agenciasDelivery } from '../../data/district';

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
  const futureOptions = getFutureScheduleOptions(new Date(), merchant.cutoffTime);
  const defaultFutureDate = futureOptions[0]?.value || '';

  // Couriers list from merchant or defaults
  const couriers = merchant.allowedCouriers && merchant.allowedCouriers.length > 0
    ? merchant.allowedCouriers
    : ['Shalom', 'Olva Courier', 'Marvisur'];

  // Default initial form state
  const defaultValues: BaseShipmentFormValues = {
    phone: initialValues?.phone || '',
    fullName: initialValues?.fullName || '',
    email: initialValues?.email || '',
    documentType: initialValues?.documentType || 'DNI',
    documentNumber: initialValues?.documentNumber || '',
    deliveryType: initialValues?.deliveryType || 'agencia',
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
    trigger,
    formState: { errors, submitCount },
  } = useForm<BaseShipmentFormValues>({
    resolver: zodResolver(baseShipmentSchema),
    defaultValues,
    mode: 'onChange',
  });

  const currentPhone = watch('phone');
  const selectedDeliveryType = watch('deliveryType');
  const selectedCourier = watch('courier');
  const destinationQuery = watch('destinationSede') || '';
  const districtQuery = watch('district') || '';

  const isPhoneValid = merchant.phoneCountryCode === '+51' || !merchant.phoneCountryCode
    ? isValidPeruvianPhone(currentPhone)
    : isValidPhoneNumber(currentPhone, merchant.phoneCountryCode);

  const [currentStep, setCurrentStep] = useState(1);
  const [isAgencyListOpen, setIsAgencyListOpen] = useState(false);
  const [activeAgencyIndex, setActiveAgencyIndex] = useState(-1);
  const [isDistrictListOpen, setIsDistrictListOpen] = useState(false);
  const [activeDistrictIndex, setActiveDistrictIndex] = useState(-1);
  const lastErrorSubmitCount = useRef(0);

  const matchingAgencies = useMemo(() => {
    const normalizeSearchText = (value: string) => value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
    const normalizedQuery = normalizeSearchText(destinationQuery);
    const normalizedCourier = selectedCourier?.toLocaleLowerCase() || '';
    const courierAgencies = normalizedCourier.includes('shalom')
      ? agenciasShalom
      : normalizedCourier.includes('olva')
        ? agenciasOlva
        : [];

    const seenAgencies = new Set<string>();
    return courierAgencies.filter(({ name, place, reference }) => {
      const normalizedName = normalizeSearchText(name);
      const normalizedPlace = normalizeSearchText(place);
      const normalizedReference = normalizeSearchText(reference);
      const searchableText = `${normalizedName} ${normalizedPlace} ${normalizedReference}`;
      const agencyKey = `${normalizedName}|${normalizedPlace}|${normalizedReference}`;

      if (!searchableText.includes(normalizedQuery) || seenAgencies.has(agencyKey)) {
      return false;
      }

      seenAgencies.add(agencyKey);
      return true;
    });
  }, [destinationQuery, selectedCourier]);

  const matchingDistricts = useMemo(() => {
    const normalizedQuery = districtQuery
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .trim();

    return agenciasDelivery.filter(({ name, place }) =>
      `${name} ${place}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase()
        .includes(normalizedQuery)
    );
  }, [districtQuery]);

  // Smooth scroll to first error if submit fails
  useEffect(() => {
    if (submitCount === 0 || submitCount === lastErrorSubmitCount.current) return;
    lastErrorSubmitCount.current = submitCount;

    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const el = document.getElementById(firstKey) || document.getElementById(`field-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [errors, submitCount]);

  const onFormSubmit = (data: BaseShipmentFormValues) => {
    const rawMobile = extractPeruvianMobileDigits(data.phone);

    const shipment: ShipmentData = {
      merchantId: merchant.id,
      phone: data.phone,
      rawPhone: rawMobile,
      fullName: data.fullName.trim(),
      email: data.email?.trim() || undefined,
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

  const handleNextStep = async () => {
    const fieldsByStep: Record<number, (keyof BaseShipmentFormValues)[]> = {
      1: ['phone'],
      2: ['deliveryType'],
      3: selectedDeliveryType === 'delivery'
        ? ['district', 'destinationSede']
        : ['courier', 'destinationSede'],
      4: ['documentNumber', 'fullName'],
    };
    const fieldsToValidate = fieldsByStep[currentStep];

    if (fieldsToValidate && !(await trigger(fieldsToValidate))) return;
    setCurrentStep((step) => Math.min(step + 1, 5));
  };

  const handleStepSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentStep === 5) {
      void handleSubmit(onFormSubmit)(event);
      return;
    }
    void handleNextStep();
  };

  const handleFormFocusCapture = (event: React.FocusEvent<HTMLFormElement>) => {
    const focusedField = event.target;
    if (!(focusedField instanceof HTMLElement)) return;

    window.setTimeout(() => {
      if (focusedField.isConnected) {
        focusedField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
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

      <nav aria-label="Progreso del formulario" className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Paso {currentStep} de 5</span>
          <span>{['WhatsApp', 'Tipo de envío', 'Destino', 'Datos personales', 'Fecha y nota'][currentStep - 1]}</span>
        </div>
        <ol className="grid grid-cols-5 gap-1.5">
          {['Número', 'Tipo', 'Destino', 'Datos', 'Fecha'].map((label, index) => {
            const step = index + 1;
            return (
              <li
                key={label}
                aria-current={step === currentStep ? 'step' : undefined}
                className={`h-1.5 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-merchant-primary' : 'bg-slate-200'
                }`}
              >
                <span className="sr-only">{label}</span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* The Form */}
      <form
        ref={formRef}
        onSubmit={handleStepSubmit}
        onFocusCapture={handleFormFocusCapture}
        noValidate
        className="space-y-5 text-left"
      >
        {currentStep === 1 && (
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
                helpText="Ingresa los 9 dígitos de tu celular personal para continuar."
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
          {!isPhoneValid ? (
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
          <button
            type="button"
            onClick={() => void handleNextStep()}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-merchant-primary px-4 py-3 font-bold text-white transition-colors hover:bg-merchant-primary-hover disabled:opacity-60"
          >
            Continuar <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 pt-1 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider pt-1">
              <Truck className="w-4 h-4 text-merchant-primary" />
              <span>Selecciona tipo de envío</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'agencia', label: 'Agencia' },
                // { value: 'domicilio', label: 'A domicilio' },
                { value: 'delivery', label: 'Delivery (Lima Metropolitana)' },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  disabled={isSubmitting}
                  aria-pressed={selectedDeliveryType === value}
                  onClick={() => {
                    if (selectedDeliveryType === value) return;
                    setValue('deliveryType', value, { shouldValidate: true });
                    setValue('district', '', { shouldValidate: true });
                    setValue('destinationSede', '', { shouldValidate: true });
                    setIsAgencyListOpen(false);
                    setIsDistrictListOpen(false);
                    if (value === 'delivery') {
                      setValue('courier', 'Delivery (Solo Lima-Metropolitana)', { shouldValidate: true });
                    } else if (selectedCourier?.toLocaleLowerCase().includes('delivery')) {
                      setValue('courier', merchant.defaultCourier || couriers[0], { shouldValidate: true });
                    }
                  }}
                  className={`rounded-xl border px-2 py-3 text-xs font-bold transition-colors ${
                    selectedDeliveryType === value
                      ? 'border-merchant-primary bg-merchant-primary text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" /> Atrás
              </button>
              <button
                type="button"
                onClick={() => void handleNextStep()}
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-merchant-primary px-4 py-3 font-bold text-white transition-colors hover:bg-merchant-primary-hover disabled:opacity-60"
              >
                Continuar <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && selectedDeliveryType && (
              <div className="space-y-4 pt-1 animate-fadeIn">
                {/* 1. Empresa de Transporte */}
                {selectedDeliveryType !== 'delivery' && (
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
                {couriers.filter((courier) => !courier.toLocaleLowerCase().includes('delivery')).map((c) => {
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
            )}

            {selectedDeliveryType === 'delivery' && (
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Input
                      {...field}
                      id="district"
                      label="Distrito de Lima"
                      placeholder="Escribe para buscar tu distrito"
                      isRequired
                      leftIcon={<MapPin className="w-4 h-4" />}
                      error={errors.district?.message}
                      helpText="Selecciona uno de los distritos disponibles."
                      disabled={isSubmitting}
                      role="combobox"
                      aria-autocomplete="list"
                      aria-expanded={isDistrictListOpen}
                      aria-controls="district-options"
                      aria-activedescendant={
                        activeDistrictIndex >= 0 && matchingDistricts[activeDistrictIndex]
                          ? `district-option-${activeDistrictIndex}`
                          : undefined
                      }
                      onFocus={() => setIsDistrictListOpen(true)}
                      onBlur={() => {
                        field.onBlur();
                        window.setTimeout(() => setIsDistrictListOpen(false), 100);
                      }}
                      onChange={(event) => {
                        field.onChange(event);
                        setValue('department', '');
                        setValue('province', '');
                        setActiveDistrictIndex(-1);
                        setIsDistrictListOpen(true);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'ArrowDown' && matchingDistricts.length > 0) {
                          event.preventDefault();
                          setIsDistrictListOpen(true);
                          setActiveDistrictIndex((current) =>
                            current < matchingDistricts.length - 1 ? current + 1 : 0
                          );
                        } else if (event.key === 'ArrowUp' && matchingDistricts.length > 0) {
                          event.preventDefault();
                          setIsDistrictListOpen(true);
                          setActiveDistrictIndex((current) =>
                            current > 0 ? current - 1 : matchingDistricts.length - 1
                          );
                        } else if (
                          event.key === 'Enter' &&
                          isDistrictListOpen &&
                          matchingDistricts[activeDistrictIndex]
                        ) {
                          event.preventDefault();
                          const district = matchingDistricts[activeDistrictIndex];
                          field.onChange(district.name);
                          setValue('department', district.place, { shouldValidate: true });
                          setValue('province', district.place, { shouldValidate: true });
                          setIsDistrictListOpen(false);
                        } else if (event.key === 'Escape') {
                          setIsDistrictListOpen(false);
                        }
                      }}
                    />
                    {isDistrictListOpen && (
                      <ul
                        id="district-options"
                        role="listbox"
                          className={`absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg ${
                            matchingDistricts.length === 0 ? 'pointer-events-none' : ''
                          }`}
                      >
                        {matchingDistricts.length > 0 ? (
                          matchingDistricts.map((district, index) => (
                            <li
                              id={`district-option-${index}`}
                              key={district.id}
                              role="option"
                              aria-selected={activeDistrictIndex === index}
                            >
                              <button
                                type="button"
                                className={`w-full px-3.5 py-2 text-left transition-colors ${
                                  activeDistrictIndex === index ? 'bg-slate-100' : 'hover:bg-slate-50'
                                }`}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                  field.onChange(district.name);
                                  setValue('department', district.place, { shouldValidate: true });
                                  setValue('province', district.place, { shouldValidate: true });
                                  setIsDistrictListOpen(false);
                                  setActiveDistrictIndex(-1);
                                }}
                              >
                                <span className="block text-sm font-semibold text-slate-800">
                                  {district.name}
                                </span>
                                <span className="block text-xs text-slate-500">{district.place}</span>
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="px-3.5 py-2 text-sm text-slate-500" role="status">
                            No se encontraron distritos.
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )}
              />
            )}

            <Controller
              name="destinationSede"
              control={control}
              render={({ field }) => selectedDeliveryType === 'agencia' ? (
                <div className="relative">
                  <Input
                    {...field}
                    id="destinationSede"
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
                      className={`absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg ${
                        matchingAgencies.length === 0 ? 'pointer-events-none' : ''
                      }`}
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
              ) : (
                <Input
                  {...field}
                  id="destinationSede"
                  label={selectedDeliveryType === 'delivery' ? 'Dirección de entrega' : 'Dirección de destino'}
                  placeholder="Escribe la calle, número y departamento"
                  isRequired
                  leftIcon={<MapPin className="w-4 h-4" />}
                  error={errors.destinationSede?.message}
                  helpText={selectedDeliveryType === 'delivery' ? 'Indica la dirección exacta en el distrito seleccionado.' : undefined}
                  disabled={isSubmitting}
                  onChange={(event) => field.onChange(event)}
                />
              )}
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" /> Atrás
              </button>
              <button
                type="button"
                onClick={() => void handleNextStep()}
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-merchant-primary px-4 py-3 font-bold text-white transition-colors hover:bg-merchant-primary-hover disabled:opacity-60"
              >
                Continuar <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 pt-1 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <User className="h-4 w-4 text-merchant-primary" />
              <span>Datos personales</span>
            </div>
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
            <Input
              id="email"
              type="email"
              label="Correo electrónico (Opcional)"
              placeholder="cliente@ejemplo.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              helpText="Lo usaremos para enviarte información de tu pedido."
              disabled={isSubmitting}
              {...register('email')}
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" /> Atrás
              </button>
              <button
                type="button"
                onClick={() => void handleNextStep()}
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-merchant-primary px-4 py-3 font-bold text-white transition-colors hover:bg-merchant-primary-hover disabled:opacity-60"
              >
                Continuar <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 5 && (
              <div className="space-y-4 pt-1 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4 text-merchant-primary" />
                  <span>Fecha de envío y observaciones</span>
                </div>
                {/* 5. Agendar Fecha (Día siguiente y dejando 2 días) */}
                <div className="pt-2">
                  <Controller
                    name="preferredDate"
                    control={control}
                    render={({ field }) => (
                      <DateScheduler
                        value={field.value}
                        cutoffTime={merchant.cutoffTime}
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
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700"
                >
                  <ArrowLeft className="h-4 w-4" /> Atrás
                </button>
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
