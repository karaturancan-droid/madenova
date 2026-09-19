'use client';

import { useState, useCallback, useEffect } from 'react';
import { callBackend } from '@/lib/tauri';

export interface Vehicle {
  id: string;
  plate: string;
  brand?: string;
  model?: string;
  year?: number;
  status: 'aktif' | 'bakımda' | 'pasif';
  km?: number;
  inspection_due_date?: string;
  insurance_due_date?: string;
  created_at: string;
}

export interface VehicleExpense {
  id: string;
  vehicle_id: string;
  type: string;
  amount: number;
  date: string;
  note?: string;
  created_at: string;
}

export interface Tire {
  id: string;
  vehicle_id: string;
  position?: string;
  dot_code?: string;
  tread_depth?: number;
  change_date?: string;
  created_at: string;
}

export interface VehicleExpenseSummary {
  total_by_type: Record<string, number>;
  grand_total: number;
}

export function useAraclar() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [vehicleExpenses, setVehicleExpenses] = useState<VehicleExpense[]>([]);
  const [vehicleExpenseSummary, setVehicleExpenseSummary] = useState<VehicleExpenseSummary | null>(null);
  const [tires, setTires] = useState<Tire[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Araçları listele
  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBackend<Vehicle[]>('list_vehicles');
      setVehicles(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Araçlar yüklenemedi';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Seçili araç için masraf ve lastik verilerini yükle
  const loadVehicleData = useCallback(async (vehicleId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [expenses, summary, tiresList] = await Promise.all([
        callBackend<VehicleExpense[]>('list_vehicle_expenses', {
          vehicle_id: vehicleId,
        }),
        callBackend<VehicleExpenseSummary>('get_vehicle_expense_summary', {
          vehicle_id: vehicleId,
        }),
        callBackend<Tire[]>('list_tires', {
          vehicle_id: vehicleId,
        }),
      ]);
      setVehicleExpenses(expenses);
      setVehicleExpenseSummary(summary);
      setTires(tiresList);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Araç verileri yüklenemedi';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Araç seç ve verilerini yükle
  const selectVehicle = useCallback(
    async (vehicleId: string) => {
      setSelectedVehicleId(vehicleId);
      await loadVehicleData(vehicleId);
    },
    [loadVehicleData]
  );

  // Araç oluştur
  const createVehicle = useCallback(
    async (data: {
      plate: string;
      brand?: string;
      model?: string;
      year?: number;
      status: 'aktif' | 'bakımda' | 'pasif';
      km?: number;
      inspection_due_date?: string;
      insurance_due_date?: string;
    }) => {
      setError(null);
      try {
        const newVehicle = await callBackend<Vehicle>('create_vehicle', data);
        setVehicles((prev) => [...prev, newVehicle].sort((a, b) => a.plate.localeCompare(b.plate)));
        return newVehicle;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Araç oluşturulamadı';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Araç güncelle
  const updateVehicle = useCallback(
    async (
      id: string,
      data: {
        plate: string;
        brand?: string;
        model?: string;
        year?: number;
        status: 'aktif' | 'bakımda' | 'pasif';
        km?: number;
        inspection_due_date?: string;
        insurance_due_date?: string;
      }
    ) => {
      setError(null);
      try {
        await callBackend('update_vehicle', { id, ...data });
        setVehicles((prev) =>
          prev
            .map((v) => (v.id === id ? { ...v, ...data } : v))
            .sort((a, b) => a.plate.localeCompare(b.plate))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Araç güncellenemedi';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Araç sil
  const deleteVehicle = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await callBackend('delete_vehicle', { id });
        setVehicles((prev) => prev.filter((v) => v.id !== id));
        if (selectedVehicleId === id) {
          setSelectedVehicleId(null);
          setVehicleExpenses([]);
          setTires([]);
          setVehicleExpenseSummary(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Araç silinemedi';
        setError(message);
        throw err;
      }
    },
    [selectedVehicleId]
  );

  // Masraf oluştur
  const createVehicleExpense = useCallback(
    async (data: {
      vehicle_id: string;
      type: string;
      amount: number;
      date: string;
      note?: string;
    }) => {
      setError(null);
      try {
        const newExpense = await callBackend<VehicleExpense>('create_vehicle_expense', data);
        await loadVehicleData(data.vehicle_id);
        return newExpense;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Masraf oluşturulamadı';
        setError(message);
        throw err;
      }
    },
    [loadVehicleData]
  );

  // Lastik oluştur
  const createTire = useCallback(
    async (data: {
      vehicle_id: string;
      position?: string;
      dot_code?: string;
      tread_depth?: number;
      change_date?: string;
    }) => {
      setError(null);
      try {
        const newTire = await callBackend<Tire>('create_tire', data);
        await loadVehicleData(data.vehicle_id);
        return newTire;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lastik oluşturulamadı';
        setError(message);
        throw err;
      }
    },
    [loadVehicleData]
  );

  // İlk yükleme
  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  return {
    vehicles,
    selectedVehicleId,
    vehicleExpenses,
    vehicleExpenseSummary,
    tires,
    loading,
    error,
    selectVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    createVehicleExpense,
    createTire,
    loadVehicles,
  };
}
