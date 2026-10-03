import React from 'react';
import {
  X,
  Printer,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Award,
  AlertCircle,
  FileText,
  Hash
} from 'lucide-react';

const AppointmentSlipModal = ({ isOpen = true, booking, onClose }) => {
  if (isOpen === false || !booking) return null;

  const handlePrint = () => {
    const printableElement = document.querySelector('.printable-clinical-record');
    if (!printableElement) {
      window.print();
      return;
    }

    try {
      const existingFrame = document.getElementById('slip-print-frame');
      if (existingFrame) existingFrame.remove();

      const printFrame = document.createElement('iframe');
      printFrame.id = 'slip-print-frame';
      printFrame.style.position = 'fixed';
      printFrame.style.top = '-9999px';
      printFrame.style.left = '-9999px';
      printFrame.style.width = '0px';
      printFrame.style.height = '0px';
      printFrame.style.border = 'none';
      document.body.appendChild(printFrame);

      const doc = printFrame.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Appointment Slip - ${booking._id ? `APT-${booking._id.slice(-6).toUpperCase()}` : 'APT-LIVE'}</title>
            <style>
              @page { size: A4 portrait; margin: 15mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; color: #0f172a; background: #ffffff; }
              * { box-sizing: border-box; }
            </style>
            ${Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
              .map(node => node.outerHTML)
              .join('\n')}
          </head>
          <body style="background: white !important; padding: 10px;">
            ${printableElement.outerHTML}
          </body>
        </html>
      `);
      doc.close();

      printFrame.contentWindow.focus();
      setTimeout(() => {
        printFrame.contentWindow.print();
      }, 400);
    } catch (e) {
      console.warn('Iframe print error, falling back to window.print():', e);
      window.print();
    }
  };

  const pet = booking.petId || {};
  const customer = booking.customerId || {};

  const petName = pet.petName || pet.name || 'Patient Pet';
  const petPin = pet.uniquePin || booking.patientPin || booking.petPin || 'PET-XXXX';
  const species = pet.species || 'Canine / Feline';
  const breed = pet.breed || 'Standard';

  const appointmentDate = booking.appointmentDate
    ? new Date(booking.appointmentDate).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : (booking.date || 'Scheduled Date');

  const bookingDate = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString()
    : new Date().toLocaleDateString();

  const doctor = booking.doctor || booking.assignedStaff || 'Dr. Perera (Senior Vet)';

  let roomNumber = booking.roomNumber;
  if (!roomNumber || roomNumber === 'Consultation Room 1') {
    if (doctor.includes('Silva')) roomNumber = 'Consultation Room 2';
    else if (doctor.includes('Fernando')) roomNumber = 'Consultation Room 3';
    else roomNumber = 'Consultation Room 1';
  }

  const queueNumber = booking.queueNumber || 1;
  const formattedQueue = String(queueNumber).padStart(2, '0');
  const referenceId = booking._id ? `APT-${booking._id.slice(-6).toUpperCase()}` : 'APT-LIVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto transition-all duration-300">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-6 max-h-[94vh] overflow-y-auto relative animate-in fade-in zoom-in-95">
        
        {/* Top Controls Bar (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Official Clinical Appointment Slip
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                  Confirmed
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Print or present this certified clinical channeling voucher on arrival
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-4 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Slip (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-transform hover:rotate-90 cursor-pointer modal-close-btn"
              title="Close Slip"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Slip Container */}
        <div className="printable-clinical-record bg-white text-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6 shadow-xs">
          
          {/* 1. Header & Branding */}
          <div className="border-b-2 border-teal-800 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center text-2xl font-black shadow-md">
                🐾
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  4 PAW ANIMAL CLINIC & SPECIALIST HOSPITAL
                </h1>
                <p className="text-[11px] font-bold text-teal-800 tracking-wider uppercase">
                  Official Outpatient Channeling & Consultation Voucher
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 mt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-teal-700" /> No. 45, Baseline Road, Colombo 09
                  </span>
                  <span className="flex items-center gap-1 font-bold text-teal-800">
                    <Phone className="w-3 h-3" /> +94 11 234 5678 (24/7 Hotline)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right bg-teal-50/80 p-3 sm:p-2.5 rounded-xl border border-teal-200/80 w-full sm:w-auto">
              <span className="font-mono text-xs font-black text-teal-900 block tracking-wider">
                REF: {referenceId}
              </span>
              <div className="my-1 py-0.5 px-2 bg-white rounded border border-teal-200 inline-block font-mono text-[11px] tracking-[0.2em] text-slate-800 select-none">
                |||| | ||||| || ||||
              </div>
              <span className="text-[10px] text-slate-500 block">
                Issued: {bookingDate}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 block uppercase">
                Status: {booking.status || 'Confirmed'}
              </span>
            </div>
          </div>

          {/* 2. Patient & Consultation Highlight Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Patient Snapshot */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Patient Snapshot
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {petName}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {species} • {breed}
                  </p>
                </div>
                <span className="bg-teal-800 text-white font-mono text-xs font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                  {petPin}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex justify-between">
                <span>Owner: <strong>{customer.name || pet.ownerName || 'Verified Pet Parent'}</strong></span>
                <span>{customer.phone || pet.ownerPhone || ''}</span>
              </div>
            </div>

            {/* Scheduled Queue & Room Card */}
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                  Room & Queue Order
                </span>
                <div className="text-lg font-black text-teal-950 mt-0.5">
                  {roomNumber}
                </div>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  {doctor}
                </p>
              </div>

              <div className="text-center px-4 py-2 bg-teal-800 text-white rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-mono block opacity-80">Queue</span>
                <span className="text-2xl font-black font-mono leading-none">#{formattedQueue}</span>
              </div>
            </div>
          </div>

          {/* 3. Appointment Slot Specifications */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Consultation Schedule & Category
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-teal-700 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Date</span>
                  <span className="font-bold text-slate-800">{appointmentDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Time Slot</span>
                  <span className="font-bold font-mono text-slate-800">{booking.timeSlot}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Clinical Service</span>
                  <span className="font-bold text-slate-800">{booking.serviceType || 'Consultation'}</span>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700">Clinical Notes:</span> {booking.notes}
              </div>
            )}
          </div>

          {/* 4. Client Advisory & Clinical Instructions */}
          <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200/90 space-y-2 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Clinical Arrival Advisory & Instructions:</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-100/90 border border-amber-300/80 font-bold text-amber-950 text-xs flex items-center gap-2">
              <span>⏰</span>
              <span>Arrive 15 minutes before {booking.timeSlot} for clinical triage.</span>
            </div>
            <ul className="list-disc list-inside text-[11px] space-y-1 pl-1 text-amber-900/90">
              <li>Please complete baseline vitals triage, weight logging, and temperature checks on arrival.</li>
              <li>Bring your pet on a leash or in a secure carrier for clinic and patient safety.</li>
              <li>Have your Pet’s Health Passport or previous prescription records accessible for the attending veterinarian.</li>
              <li>For cancellations or emergency inquiries, call our clinical desk at <strong>+94 11 234 5678</strong>.</li>
            </ul>
          </div>

          {/* 5. Authorization Footer & Stamp */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[11px] text-slate-500">
            <div>
              <p className="font-medium">
                Verified Outpatient Channeling System • 4 Paw Animal Clinic
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Digital Verification Hash: {referenceId}-{Date.now().toString(36).toUpperCase()}
              </p>
            </div>

            <div className="flex items-center gap-2 border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                Certified Booking
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSlipModal;
