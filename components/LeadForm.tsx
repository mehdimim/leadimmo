'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import CTAButton from '@/components/CTAButton';
import { leadSubmissionSchema, type LeadSubmissionInput } from '@/lib/validation';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (...args: unknown[]) => void;
  }
}

type LeadFormProps = {
  className?: string;
};

const areaOptions = ['Bophut', 'Chaweng', 'Lamai', 'Maenam', 'Choeng Mon'];

export default function LeadForm({ className }: LeadFormProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('leadForm');
  const optionsBudget = useTranslations('leadFormOptions.budget');
  const optionsProperty = useTranslations('leadFormOptions.propertyType');
  const optionsTiming = useTranslations('leadFormOptions.timing');
  const optionsCall = useTranslations('leadFormOptions.callPreference');

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LeadSubmissionInput>({
    resolver: zodResolver(leadSubmissionSchema),
    defaultValues: {
      firstName: '',
      email: '',
      phone: '',
      budget: 'under500k',
      propertyType: 'villa',
      areas: [],
      timing: 'soon',
      callPreference: 'phone',
      timezone: 'Asia/Bangkok',
      locale,
      consent: false
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, locale })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Unexpected error');
    }

    reset();
    if (typeof window !== 'undefined') {
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'lead_submit', locale });
        if (typeof window.fbq === 'function') {
          window.fbq('trackCustom', 'lead_submit', { locale });
        }
      } catch (trackingError) {
        console.warn('tracking_failed', trackingError);
      }
    }
    router.push(`/${locale}/merci`);
  });

  return (
    <form
      onSubmit={onSubmit}
      className={clsx(
        'rounded-3xl border border-slate-200 bg-white p-8 shadow-lg',
        className
      )}
    >
      <input type="hidden" {...register('_hpt')} value="" />
      <h3 className="text-2xl font-semibold text-slate-900">{t('title')}</h3>
      <p className="mt-2 text-sm text-slate-600">{t('description')}</p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label={t('firstName')}
          error={errors.firstName?.message}
          required
        >
          <input
            type="text"
            {...register('firstName')}
            className="form-input"
            placeholder="Jane"
          />
        </Field>

        <Field label={t('email')} error={errors.email?.message}>
          <input
            type="email"
            {...register('email')}
            className="form-input"
            placeholder="you@example.com"
          />
        </Field>

        <Field
          label={t('phone')}
          error={errors.phone?.message}
          required
        >
          <input
            type="tel"
            {...register('phone')}
            className="form-input"
            placeholder="+66 ..."
          />
        </Field>

        <Field
          label={t('budget')}
          error={errors.budget?.message}
          required
        >
          <select {...register('budget')} className="form-select">
            {Object.entries({
              under500k: optionsBudget('under500k'),
              '500kto1m': optionsBudget('500kto1m'),
              '1mto2m': optionsBudget('1mto2m'),
              above2m: optionsBudget('above2m')
            }).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={t('propertyType')}
          error={errors.propertyType?.message}
          required
        >
          <select {...register('propertyType')} className="form-select">
            {Object.entries({
              villa: optionsProperty('villa'),
              apartment: optionsProperty('apartment'),
              hotel: optionsProperty('hotel'),
              land: optionsProperty('land')
            }).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('areas')} error={errors.areas?.message}>
          <div className="grid grid-cols-2 gap-2">
            {areaOptions.map((area) => (
              <label key={area} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  value={area}
                  {...register('areas')}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                {area}
              </label>
            ))}
          </div>
        </Field>

        <Field label={t('timing')} error={errors.timing?.message} required>
          <select {...register('timing')} className="form-select">
            {Object.entries({
              soon: optionsTiming('soon'),
              mid: optionsTiming('mid'),
              later: optionsTiming('later')
            }).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('callPreference')} error={errors.callPreference?.message} required>
          <select {...register('callPreference')} className="form-select">
            {Object.entries({
              phone: optionsCall('phone'),
              video: optionsCall('video'),
              inPerson: optionsCall('inPerson')
            }).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t('message')} error={errors.message?.message}>
        <textarea
          {...register('message')}
          className="form-textarea"
          rows={4}
          placeholder="Timeline, financing, partners..."
        />
      </Field>

      <Field label={t('timezone')} error={errors.timezone?.message}>
        <input type="text" {...register('timezone')} className="form-input" />
      </Field>

      <Field error={errors.consent?.message}>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            {...register('consent', { required: true })}
            className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
          />
          {t('consent')}
        </label>
      </Field>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <CTAButton
        type="submit"
        variant="primary"
        className="mt-6 w-full sm:w-auto"
      >
        {isSubmitting ? t('submit') + '...' : t('submit')}
      </CTAButton>
    </form>
  );
}

type FieldProps = {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
};

function Field({ label, error, children, required }: FieldProps) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-sm font-semibold text-slate-700">
          {label}
          {required ? <span className="ml-1 text-primary">*</span> : null}
        </span>
      ) : null}
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

