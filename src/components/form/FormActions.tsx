import React from 'react';
import { ArrowRight, Lock, Check } from 'lucide-react';
import { Button } from '../ui/Button';

export interface FormActionsProps {
  isSubmitting?: boolean;
  submitButtonText?: string;
  submittingText?: string;
  disabled?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isSubmitting = false,
  submitButtonText = 'Agendar y ver resumen',
  submittingText = 'Procesando...',
  disabled = false,
}) => {
  return (
    <div className="pt-4 space-y-3">
      <Button
        type="submit"
        size="lg"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        loadingText={submittingText}
        disabled={disabled}
        rightIcon={!isSubmitting ? <ArrowRight className="w-5 h-5 ml-1" /> : undefined}
        className="font-bold text-base shadow-lg hover:shadow-xl transition-all"
      >
        {submitButtonText}
      </Button>

      {/* Trust & Security Footnote */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
        <Lock className="w-3.5 h-3.5 text-slate-400" />
        <span>Tus datos están protegidos y son confidenciales</span>
        <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
        <Check className="w-3.5 h-3.5 text-emerald-500" />
        <span>Despacho oficial</span>
      </div>
    </div>
  );
};
