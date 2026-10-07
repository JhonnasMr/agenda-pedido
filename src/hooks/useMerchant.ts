import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MerchantConfig } from '../types/merchant';
import { getMerchantById, applyMerchantTheme } from '../services/merchantService';

export interface UseMerchantResult {
  merchant: MerchantConfig | null;
  merchantId: string | null;
  loading: boolean;
  error: string | null;
  isValid: boolean;
}

export function useMerchant(): UseMerchantResult {
  const [searchParams] = useSearchParams();
  const rawParam = searchParams.get('merchant');
  
  const [merchant, setMerchant] = useState<MerchantConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function loadMerchant() {
      setLoading(true);
      setError(null);

      if (!rawParam || !rawParam.trim()) {
        if (isMounted) {
          setMerchant(null);
          setError('No se proporcionó ningún parámetro de comercio en el enlace.');
          setLoading(false);
        }
        return;
      }

      try {
        const found = await getMerchantById(rawParam.trim());
        if (isMounted) {
          if (found) {
            setMerchant(found);
            applyMerchantTheme(found);
          } else {
            setMerchant(null);
            setError(`No se encontró la configuración para el comercio "${rawParam}".`);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setMerchant(null);
          setError('Ocurrió un error al cargar los datos de la tienda.');
          setLoading(false);
        }
      }
    }

    loadMerchant();

    return () => {
      isMounted = false;
    };
  }, [rawParam]);

  return {
    merchant,
    merchantId: rawParam,
    loading,
    error,
    isValid: Boolean(merchant && !loading && !error),
  };
}
