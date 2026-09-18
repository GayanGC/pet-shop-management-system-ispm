import React, { useState, useEffect } from 'react';
import { X, Printer, FileText, CheckCircle2, AlertCircle, Clock, Calendar, Stethoscope, RefreshCw } from 'lucide-react';
import { fetchBookingReport } from '../../services/bookingService';

const ClinicalAppointmentReportModal = ({ isOpen, onClose }) => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchBookingReport();
      if (res && res.success) {
        setReportData(res);
      } else {
        throw new Error(res?.message || 'Failed to generate appointment report');
      }
    } catch (err) {
      setError(err.message || 'Error generating clinical appointment report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadReport();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const summary = reportData?.summary || { total: 0, confirmed: 0, completed: 0, cancelled: 0, pending: 0 };
  const records = reportData?.data || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-5xl w-full p-6 sm:p-8 space-y-6 my-8 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full">
        
        {/* Controls Bar (Hidden in Print) */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Clinical Appointment Audit Report
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official hospital consultation and slot scheduling summary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadReport}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refresh Report Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="py-2 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Report</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading / Error states */}
        {isLoading && (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600" />
            <p>Aggregating clinical appointment logs from MongoDB Atlas...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Printable Report Canvas */}
        {!isLoading && !error && (
          <div className="space-y-6 print:space-y-4">
            {/* Clinical Report Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b-2 border-teal-700 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-teal-700" />
                  <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    4 PAW ANIMAL CLINIC
                  </h1>
                </div>
                <p className="text-xs font-semibold text-teal-800 dark:text-teal-400 uppercase tracking-wider mt-0.5">
                  Veterinary Hospital Management & Clinical Operations
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  123 Hospital Road, Colombo · Tel: +94 11 234 5678 · info@4pawclinic.lk
                </p>
              </div>
              <div className="text-left sm:text-right text-xs">
                <span className="px-2.5 py-1 bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold rounded-lg border border-teal-300 dark:border-teal-800 text-[11px] inline-block uppercase tracking-wider">
                  Official Audit Record
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-1.5 font-mono text-[11px]">
                  Generated: {new Date().toLocaleString()}
                </p>
                <p className="text-slate-500 text-[10px]">
                  System Ref: SCHED-AUDIT-{Date.now().toString().slice(-6)}
                </p>
              </div>
            </div>

            {/* Metrics KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Total Bookings
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                  {summary.total}
                </p>
              </div>

              <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-200/80 dark:border-teal-800/50">
                <p className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 tracking-wider">
                  Confirmed
                </p>
                <p className="text-xl font-black text-teal-800 dark:text-teal-200 mt-1 font-mono">
                  {summary.confirmed}
                </p>
              </div>

              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-800/50">
                <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                  Completed
                </p>
                <p className="text-xl font-black text-emerald-800 dark:text-emerald-200 mt-1 font-mono">
                  {summary.completed}
                </p>
              </div>

              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/50">
                <p className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">
                  Pending
                </p>
                <p className="text-xl font-black text-amber-800 dark:text-amber-200 mt-1 font-mono">
                  {summary.pending}
                </p>
              </div>

              <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200/80 dark:border-rose-800/50">
                <p className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 tracking-wider">
                  Cancelled
                </p>
                <p className="text-xl font-black text-rose-800 dark:text-rose-200 mt-1 font-mono">
                  {summary.cancelled}
                </p>
              </div>
            </div>

            {/* Audit Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Patient & PIN</th>
                    <th className="py-2.5 px-3">Service Category</th>
                    <th className="py-2.5 px-3">Doctor / Clinician</th>
                    <th className="py-2.5 px-3">Date & Slot</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Notes / Cancellation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {records.length > 0 ? (
                    records.map((item) => {
                      const apptDate = item.appointmentDate ? new Date(item.appointmentDate).toLocaleDateString() : 'N/A';
                      const isCancelled = item.status === 'Cancelled';

                      return (
                        <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {item.patientName}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {item.patientPin} · {item.species}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                            {item.serviceType}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                            {item.assignedStaff}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {apptDate}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {item.timeSlot}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'Confirmed' ? 'bg-teal-100 text-teal-800' :
                              item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                              item.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-[180px] truncate">
                            {isCancelled && item.cancelledAt ? (
                              <span className="text-rose-600 font-mono text-[10px]">
                                Cancelled: {new Date(item.cancelledAt).toLocaleDateString()}
                              </span>
                            ) : (
                              item.notes || 'Routine consultation'
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No appointment audit records available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Report Sign-off Footer */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
              <div>
                <p>4 Paw Animal Clinic Hospital Management System · Confidential Clinical Record</p>
                <p>Verified against MongoDB Atlas pet_shop_db collection `appointments`</p>
              </div>
              <div className="text-right">
                <p className="font-mono">Authorized Medical Officer / Registrar</p>
                <div className="w-32 border-b border-slate-300 dark:border-slate-700 mt-3 ml-auto"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalAppointmentReportModal;
