import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { SuccessState } from '../components/form/SuccessState';
import { getLastSessionShipment } from '../services/shipmentService';
import { useMerchant } from '../hooks/useMerchant';
import { Button } from '../components/ui/Button';
import { AlertCircle } from 'lucide-react';

export const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const merchantId = searchParams.get('merchant');
  const { merchant } = useMerchant();

  const lastShipment = getLastSessionShipment();

  const handleReset = () => {
    if (merchantId) {
      navigate(`/form?merchant=${merchantId}`);
    } else {
      navigate('/form');
    }
  };

  if (!lastShipment || !merchant) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-10 px-4 flex items-center justify-center">
        <Card variant="elevated" padding="lg" className="w-full max-w-[500px] text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">No hay envíos recientes</h2>
          <p className="text-sm text-slate-500">
            No se encontró un registro activo en esta sesión.
          </p>
          <Button variant="primary" onClick={() => navigate(`/form?merchant=${merchantId || 'merchant-demo'}`)}>
            Ir al formulario
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 flex items-center justify-center">
      <Card variant="elevated" padding="lg" className="w-full max-w-[520px]">
        <SuccessState
          shipment={lastShipment}
          merchant={merchant}
          onReset={handleReset}
        />
      </Card>
    </div>
  );
};
