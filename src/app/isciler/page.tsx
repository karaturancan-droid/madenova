'use client';

import { useState, useCallback } from 'react';
import { useIsciler, type Worker, type Payroll } from '@/hooks/use-isciler';
import { WorkerList } from '@/components/isciler/worker-list';
import { WorkerForm } from '@/components/isciler/worker-form';
import { WorkerDetails } from '@/components/isciler/worker-details';
import { LeaveForm } from '@/components/isciler/leave-form';
import { OvertimeForm } from '@/components/isciler/overtime-form';
import { PayrollForm } from '@/components/isciler/payroll-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function IscilerPage() {
  const isciler = useIsciler();
  const [workerFormOpen, setWorkerFormOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [leaveFormOpen, setLeaveFormOpen] = useState(false);
  const [overtimeFormOpen, setOvertimeFormOpen] = useState(false);
  const [payrollFormOpen, setPayrollFormOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);

  const selectedWorker = isciler.workers.find(
    (w) => w.id === isciler.selectedWorkerId
  );

  // İşçi Formu İşlemleri
  const handleAddWorker = useCallback(() => {
    setEditingWorker(null);
    setWorkerFormOpen(true);
  }, []);

  const handleEditWorker = useCallback((worker: Worker) => {
    setEditingWorker(worker);
    setWorkerFormOpen(true);
  }, []);

  const handleDeleteWorker = useCallback(
    async (id: string) => {
      try {
        await isciler.deleteWorker(id);
      } catch (error) {
        // Hata zaten hook tarafından işleniyor
      }
    },
    [isciler]
  );

  const handleSubmitWorkerForm = useCallback(
    async (data: {
      full_name: string;
      tc_no?: string;
      birth_date?: string;
      hire_date?: string;
      exit_date?: string;
      position?: string;
      sgk_no?: string;
      iban?: string;
      salary: number;
      contract_end_date?: string;
    }) => {
      if (editingWorker) {
        await isciler.updateWorker(editingWorker.id, data);
      } else {
        await isciler.createWorker(data);
      }
    },
    [editingWorker, isciler]
  );

  // İzin Formu İşlemleri
  const handleAddLeave = useCallback(() => {
    setLeaveFormOpen(true);
  }, []);

  const handleSubmitLeaveForm = useCallback(
    async (data: {
      start_date: string;
      end_date: string;
      type?: string;
      days?: number;
    }) => {
      if (!isciler.selectedWorkerId) return;
      await isciler.createLeave({
        worker_id: isciler.selectedWorkerId,
        ...data,
      });
      setLeaveFormOpen(false);
    },
    [isciler]
  );

  const handleDeleteLeave = useCallback(
    async (id: string) => {
      const confirmed = window.confirm('Bu izni silmek istediğiniz emin misiniz?');
      if (confirmed) {
        try {
          await isciler.deleteLeave(id);
        } catch (error) {
          // Hata zaten hook tarafından işleniyor
        }
      }
    },
    [isciler]
  );

  // Mesai Formu İşlemleri
  const handleAddOvertime = useCallback(() => {
    setOvertimeFormOpen(true);
  }, []);

  const handleSubmitOvertimeForm = useCallback(
    async (data: {
      date: string;
      hours: number;
      rate: number;
    }) => {
      if (!isciler.selectedWorkerId) return;
      await isciler.createOvertime({
        worker_id: isciler.selectedWorkerId,
        ...data,
      });
      setOvertimeFormOpen(false);
    },
    [isciler]
  );

  const handleDeleteOvertime = useCallback(
    async (id: string) => {
      const confirmed = window.confirm('Bu mesaiyi silmek istediğiniz emin misiniz?');
      if (confirmed) {
        try {
          await isciler.deleteOvertime(id);
        } catch (error) {
          // Hata zaten hook tarafından işleniyor
        }
      }
    },
    [isciler]
  );

  // Maaş Formu İşlemleri
  const handleAddPayroll = useCallback(() => {
    setEditingPayroll(null);
    setPayrollFormOpen(true);
  }, []);

  const handleEditPayroll = useCallback((payroll: Payroll) => {
    setEditingPayroll(payroll);
    setPayrollFormOpen(true);
  }, []);

  const handleSubmitPayrollForm = useCallback(
    async (data: {
      period: string;
      gross?: number;
      net?: number;
      deductions?: number;
      status: 'taslak' | 'ödendi';
      receipt_path?: string;
    }) => {
      if (!isciler.selectedWorkerId) return;

      if (editingPayroll) {
        await isciler.updatePayroll(editingPayroll.id, data);
      } else {
        await isciler.createPayroll({
          worker_id: isciler.selectedWorkerId,
          ...data,
        });
      }
      setPayrollFormOpen(false);
    },
    [editingPayroll, isciler]
  );

  const handleDeletePayroll = useCallback(
    async (id: string) => {
      const confirmed = window.confirm('Bu maaş kaydını silmek istediğiniz emin misiniz?');
      if (confirmed) {
        try {
          await isciler.deletePayroll(id);
        } catch (error) {
          // Hata zaten hook tarafından işleniyor
        }
      }
    },
    [isciler]
  );

  const handleCalculateSeverance = useCallback(
    async () => {
      if (!isciler.selectedWorkerId) return;
      try {
        await isciler.calculateSeverance(isciler.selectedWorkerId);
      } catch (error) {
        // Hata zaten hook tarafından işleniyor
      }
    },
    [isciler]
  );

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Başlık */}
      <div>
        <h1 className="text-3xl font-bold">İşçiler</h1>
        <p className="text-muted-foreground">İşçi bilgilerini ve maaş yönetimini yapın</p>
      </div>

      {/* Ana İçerik */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sol Panel - İşçi Listesi */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>İşçiler</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <WorkerList
                workers={isciler.workers}
                selectedWorkerId={isciler.selectedWorkerId}
                onSelectWorker={isciler.selectWorker}
                onAddWorker={handleAddWorker}
                loading={isciler.loading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sağ Panel - İşçi Detayları */}
        <div className="lg:col-span-3">
          <WorkerDetails
            worker={selectedWorker || null}
            leaves={isciler.leaves}
            overtimes={isciler.overtimes}
            payrolls={isciler.payrolls}
            onEdit={handleEditWorker}
            onDelete={handleDeleteWorker}
            onAddLeave={handleAddLeave}
            onDeleteLeave={handleDeleteLeave}
            onAddOvertime={handleAddOvertime}
            onDeleteOvertime={handleDeleteOvertime}
            onAddPayroll={handleAddPayroll}
            onEditPayroll={handleEditPayroll}
            onDeletePayroll={handleDeletePayroll}
            onCalculateSeverance={handleCalculateSeverance}
            loading={isciler.loading}
          />
        </div>
      </div>

      {/* İşçi Formu Dialog */}
      <WorkerForm
        open={workerFormOpen}
        onOpenChange={setWorkerFormOpen}
        onSubmit={handleSubmitWorkerForm}
        initialData={editingWorker || undefined}
        isLoading={isciler.loading}
      />

      {/* İzin Formu Dialog */}
      <LeaveForm
        open={leaveFormOpen}
        onOpenChange={setLeaveFormOpen}
        onSubmit={handleSubmitLeaveForm}
        workerId={isciler.selectedWorkerId || ''}
        isLoading={isciler.loading}
      />

      {/* Mesai Formu Dialog */}
      <OvertimeForm
        open={overtimeFormOpen}
        onOpenChange={setOvertimeFormOpen}
        onSubmit={handleSubmitOvertimeForm}
        workerId={isciler.selectedWorkerId || ''}
        isLoading={isciler.loading}
      />

      {/* Maaş Formu Dialog */}
      <PayrollForm
        open={payrollFormOpen}
        onOpenChange={setPayrollFormOpen}
        onSubmit={handleSubmitPayrollForm}
        workerId={isciler.selectedWorkerId || ''}
        initialData={editingPayroll || undefined}
        isLoading={isciler.loading}
      />
    </div>
  );
}
