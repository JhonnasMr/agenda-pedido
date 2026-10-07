import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { ErrorState } from '../components/form/ErrorState';
import { Truck } from 'lucide-react';

export const InvalidMerchantPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const merchantId = searchParams.get('merchant');

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-[520px] mx-auto space-y-4">
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-semibold">
          <Truck className="w-4 h-4 text-slate-400" />
          <span>Portal de Envíos</span>
        </div>

        <Card variant="elevated" padding="lg">
          <ErrorState
            title="Enlace no válido"
            message="No hemos podido identificar la tienda. Verifica que el enlace contenga el parámetro de comercio correcto."
            merchantId={merchantId}
          />
        </Card>
      </div>
    </div>
  );
};
