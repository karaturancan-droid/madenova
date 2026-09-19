'use client';

import { useState, useMemo } from 'react';
import { Vehicle } from '@/hooks/use-araclar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VehicleListProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  onAddVehicle: () => void;
  loading: boolean;
}

const statusColors: Record<string, string> = {
  aktif: 'bg-green-600',
  bakımda: 'bg-yellow-500',
  pasif: 'bg-gray-500',
};

const statusLabels: Record<string, string> = {
  aktif: 'Aktif',
  bakımda: 'Bakımda',
  pasif: 'Pasif',
};

export function VehicleList({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onAddVehicle,
  loading,
}: VehicleListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(
      (v) =>
        v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="space-y-2">
        <Input
          placeholder="Plaka, marka veya model ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
        />
        <Button onClick={onAddVehicle} className="w-full" disabled={loading}>
          Araç Ekle
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {vehicles.length === 0 ? 'Henüz araç eklenmemiş' : 'Arama sonucu bulunamadı'}
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className={`p-3 cursor-pointer transition-colors ${
                selectedVehicleId === vehicle.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
              onClick={() => onSelectVehicle(vehicle.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{vehicle.plate}</h3>
                  {(vehicle.brand || vehicle.model) && (
                    <p className="text-xs opacity-75">
                      {vehicle.brand} {vehicle.model}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      className={`text-xs text-white ${statusColors[vehicle.status]}`}
                      variant="secondary"
                    >
                      {statusLabels[vehicle.status]}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
