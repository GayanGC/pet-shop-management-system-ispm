/**
 * ============================================================================
 * CLINICAL EMAIL UTILITY SERVICE (emailService.js)
 * ============================================================================
 * Enterprise-grade Nodemailer transporter with dynamic configuration,
 * fallback logger for non-production environments, and high-trust clinical
 * responsive HTML templates for staff onboarding credentials.
 */

const nodemailer = require('nodemailer');

const ROLE_TITLES = {
  veterinarian: 'Veterinary Surgeon',
  inventory: 'Inventory & Pharmacy Officer',
  cashier: 'POS Billing Cashier',
  admin: 'Clinic Administrator',
  staff: 'Clinical Operations Staff',
  customer: 'Pet Parent / Client'
};

const getRoleTitle = (roleKey) => {
  if (!roleKey) return 'Clinical Staff Member';
  const cleanKey = String(roleKey).toLowerCase().trim();
  return ROLE_TITLES[cleanKey] || roleKey;
};

/**
 * Configure reusable Nodemailer transporter with graceful fallback
 */
const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;
  const emailService = process.env.SMTP_SERVICE || process.env.EMAIL_SERVICE;

  if (emailUser && emailPass) {
    if (emailService) {
      return nodemailer.createTransport({
        service: emailService,
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    }

    return nodemailer.createTransport({
      host: emailHost || 'smtp.gmail.com',
      port: Number(emailPort) || 587,
      secure: Number(emailPort) === 465,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }

  return null;
};

/**
 * Generate High-Trust Clinical HTML Welcome Email Template
 */
const generateStaffWelcomeHTML = (staffMember, rawPassword, portalUrl) => {
  const roleTitle = getRoleTitle(staffMember.role);
  const staffName = staffMember.name || 'Valued Team Member';
  const staffEmail = staffMember.email;
  const loginUrl = portalUrl || process.env.CLIENT_URL || 'http://localhost:3000';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to 4 Paw Animal Clinic</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
    }
    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
    }
    .email-header {
      background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
      padding: 36px 30px;
      text-align: center;
      color: #ffffff;
    }
    .email-header h1 {
      margin: 0 0 8px 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .email-header p {
      margin: 0;
      font-size: 13px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .email-body {
      padding: 32px 30px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .appointment-badge {
      display: inline-block;
      background-color: #f0fdfa;
      color: #0f766e;
      border: 1px solid #ccfbf1;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .credential-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 5px solid #0f766e;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    .credential-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    .credential-row:last-child {
      border-bottom: none;
    }
    .credential-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }
    .credential-value {
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      background: #ffffff;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    .security-notice {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 14px 18px;
      border-radius: 8px;
      font-size: 12px;
      color: #92400e;
      margin: 20px 0;
      line-height: 1.5;
    }
    .button-container {
      text-align: center;
      margin: 30px 0 10px 0;
    }
    .btn-login {
      display: inline-block;
      background-color: #0f766e;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      font-size: 14px;
      font-weight: 700;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25);
      transition: background-color 0.2s;
    }
    .email-footer {
      background-color: #f8fafc;
      padding: 24px 30px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <p>🏥 4 Paw Animal Clinic & Hospital</p>
      <h1>Official Staff Appointment</h1>
    </div>

    <div class="email-body">
      <div class="greeting">Congratulations, ${staffName}!</div>
      
      <div class="appointment-badge">
        Appointed as: ${roleTitle}
      </div>

      <p style="font-size: 14px; color: #334155; margin-bottom: 20px;">
        You have been officially registered and provisioned on the <strong>4 Paw Animal Clinic Clinical Hospital Management System (HMS)</strong>. Your authenticated account is now active and ready for duty.
      </p>

      <div class="credential-card">
        <div style="font-size: 11px; color: #0f766e; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
          🔒 Your Official Access Credentials
        </div>
        <div class="credential-row">
          <span class="credential-label">Portal Login ID (Email):</span>
          <span class="credential-value">${staffEmail}</span>
        </div>
        <div class="credential-row">
          <span class="credential-label">Initial Password:</span>
          <span class="credential-value">${rawPassword}</span>
        </div>
        <div class="credential-row">
          <span class="credential-label">Assigned Role:</span>
          <span class="credential-value" style="font-family: inherit; color: #0f766e;">${roleTitle}</span>
        </div>
      </div>

      <div class="security-notice">
        <strong>⚠️ Strictly Confidential:</strong> Please do not share these credentials with anyone. Maintain strict clinical confidentiality and adhere to the veterinary code of conduct.
      </div>

      <div class="button-container">
        <a href="${loginUrl}" target="_blank" class="btn-login">
          🚀 Sign In to Clinic Dashboard
        </a>
      </div>
      <p style="text-align: center; font-size: 11px; color: #64748b; margin-top: 8px;">
        Direct link: <a href="${loginUrl}" style="color: #0f766e;">${loginUrl}</a>
      </p>
    </div>

    <div class="email-footer">
      <p style="margin: 0 0 6px 0;"><strong>4 Paw Animal Clinic & Referral Hospital</strong></p>
      <p style="margin: 0 0 6px 0;">No. 120, Kandy Road, Malabe, Sri Lanka | Hotline: +94 11 234 5678</p>
      <p style="margin: 0;">This is an automated system dispatch. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Send Staff Welcome Email with Credentials
 * @param {Object} staffMember - Created user document
 * @param {string} rawPassword - Unhashed initial password
 * @returns {Promise<Object>} - Execution receipt
 */
const sendStaffWelcomeEmail = async (staffMember, rawPassword) => {
  try {
    const roleTitle = getRoleTitle(staffMember.role);
    const subject = '🎉 Welcome to 4 Paw Animal Clinic — Your Official Staff Credentials';
    const htmlContent = generateStaffWelcomeHTML(staffMember, rawPassword);
    const transporter = getTransporter();

    if (transporter) {
      const fromSender = process.env.EMAIL_FROM || `"4 Paw Animal Clinic Administration" <${process.env.EMAIL_USER}>`;
      const mailOptions = {
        from: fromSender,
        to: staffMember.email,
        subject,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] ✅ Email dispatched to ${staffMember.email} (MessageId: ${info.messageId})`);
      return {
        success: true,
        messageId: info.messageId,
        recipient: staffMember.email
      };
    }

    // Graceful Console Fallback if SMTP is not configured in .env
    console.log('='.repeat(75));
    console.log('📧 [EmailService] SIMULATED EMAIL DISPATCH (SMTP credentials not set in .env)');
    console.log('='.repeat(75));
    console.log(`To: ${staffMember.name} <${staffMember.email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Role: ${roleTitle} (${staffMember.role})`);
    console.log(`Login ID: ${staffMember.email}`);
    console.log(`Initial Password: ${rawPassword}`);
    console.log('Login URL: http://localhost:3000');
    console.log('='.repeat(75));

    return {
      success: true,
      simulated: true,
      recipient: staffMember.email,
      message: 'Email dispatched via development logger'
    };
  } catch (error) {
    console.warn(`[EmailService Warning]: SMTP delivery failed (${error.message}). Falling back to resilient development logger.`);
    console.log('='.repeat(75));
    console.log('📧 [EmailService] SIMULATED EMAIL DISPATCH (Fallback Logger)');
    console.log('='.repeat(75));
    console.log(`To: ${staffMember?.name} <${staffMember?.email}>`);
    console.log(`Role: ${getRoleTitle(staffMember?.role)} (${staffMember?.role})`);
    console.log(`Login ID: ${staffMember?.email}`);
    console.log(`Initial Password: ${rawPassword}`);
    console.log('Login URL: http://localhost:3000');
    console.log('='.repeat(75));

    return {
      success: true,
      simulated: true,
      fallback: true,
      warning: error.message,
      recipient: staffMember?.email
    };
  }
};

/**
 * Generate Branded HTML Template for Appointment Confirmation Email
 */
const generateAppointmentConfirmationHTML = ({ booking, recipientName, petName, doctorName }) => {
  const pin = booking.patientPin || booking.petPin || booking.petId?.uniquePin || 'N/A';
  const room = booking.roomNumber || 'Room 02 (OPD)';
  const queue = booking.queueNumber ? `Queue #${String(booking.queueNumber).padStart(2, '0')}` : 'Queue #01';
  const appointmentDate = booking.date || (booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Scheduled Date');
  const timeSlot = booking.timeSlot || 'Scheduled Time';
  const service = booking.serviceType || 'Veterinary Consultation';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmed - 4 Paw Animal Clinic</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f5f3ff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e1b4b;
    }
    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(91, 33, 182, 0.12);
      border: 1px solid #ddd6fe;
    }
    .email-header {
      background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 60%, #7c3aed 100%);
      padding: 36px 30px;
      text-align: center;
      color: #ffffff;
    }
    .email-header .badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      backdrop-filter: blur(4px);
    }
    .email-header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .email-header p {
      margin: 8px 0 0 0;
      font-size: 13px;
      color: #ede9fe;
    }
    .email-body {
      padding: 32px 30px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 700;
      color: #4c1d95;
      margin-bottom: 12px;
    }
    .intro-text {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .details-table-card {
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .details-table-header {
      background: #f3e8ff;
      padding: 12px 18px;
      font-size: 12px;
      font-weight: 800;
      color: #5b21b6;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e9d5ff;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
    }
    .details-table tr:not(:last-child) {
      border-bottom: 1px solid #f3e8ff;
    }
    .details-table td {
      padding: 12px 18px;
      font-size: 13px;
      vertical-align: middle;
    }
    .details-label {
      color: #64748b;
      font-weight: 600;
      width: 38%;
    }
    .details-value {
      color: #0f172a;
      font-weight: 700;
    }
    .advisory-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-left: 5px solid #f59e0b;
      padding: 16px 20px;
      border-radius: 12px;
      margin: 24px 0;
    }
    .advisory-title {
      font-size: 13px;
      font-weight: 800;
      color: #92400e;
      margin-bottom: 6px;
    }
    .advisory-body {
      font-size: 12px;
      color: #78350f;
      line-height: 1.6;
      margin: 0;
    }
    .email-footer {
      background-color: #f8fafc;
      padding: 24px 30px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      line-height: 1.6;
    }
    .footer-hotline {
      font-weight: 800;
      color: #4c1d95;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="badge">🐾 Official Appointment Confirmation</div>
      <h1>4 Paw Animal Clinic & Specialist Hospital</h1>
      <p>Certified Outpatient Veterinary Care & Diagnostics</p>
    </div>

    <div class="email-body">
      <div class="greeting">Dear ${recipientName || 'Valued Pet Parent'},</div>
      <p class="intro-text">
        Your veterinary consultation appointment for <strong>${petName}</strong> has been successfully confirmed and scheduled on our clinical booking registry.
      </p>

      <div class="details-table-card">
        <div class="details-table-header">
          📋 Consultation Schedule Details
        </div>
        <table class="details-table">
          <tr>
            <td class="details-label">Patient:</td>
            <td class="details-value">
              ${petName} <span style="font-family: monospace; font-size: 11px; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">(Microchip PIN: ${pin})</span>
            </td>
          </tr>
          <tr>
            <td class="details-label">Attending Specialist:</td>
            <td class="details-value" style="color: #4c1d95;">${doctorName}</td>
          </tr>
          <tr>
            <td class="details-label">Clinical Service:</td>
            <td class="details-value">${service}</td>
          </tr>
          <tr>
            <td class="details-label">Date:</td>
            <td class="details-value">${appointmentDate}</td>
          </tr>
          <tr>
            <td class="details-label">Scheduled Time Slot:</td>
            <td class="details-value" style="font-family: monospace; color: #047857; font-size: 14px;">${timeSlot}</td>
          </tr>
          <tr>
            <td class="details-label">Consultation Room:</td>
            <td class="details-value">${room}</td>
          </tr>
          <tr>
            <td class="details-label">Queue Position:</td>
            <td class="details-value">
              <span style="display: inline-block; background: #6d28d9; color: #ffffff; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 800;">${queue}</span>
            </td>
          </tr>
        </table>
      </div>

      <div class="advisory-box">
        <div class="advisory-title">
          ⏰ CLINICAL ARRIVAL ADVISORY
        </div>
        <p class="advisory-body">
          Please arrive at the clinic <strong>15 minutes prior</strong> to your scheduled time slot for initial triage, temperature/weight logging, and vital checks.
        </p>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 20px;">
        Please bring your pet on a leash or in a secure carrier, along with any previous vaccination or medical records.
      </p>
    </div>

    <div class="email-footer">
      <p style="margin: 0 0 6px 0;"><strong>4 Paw Animal Clinic & Specialist Hospital</strong></p>
      <p style="margin: 0 0 6px 0;">No. 45, Baseline Road, Colombo 09 | 24/7 Clinical Hotline: <span class="footer-hotline">+94 11 234 5678</span></p>
      <p style="margin: 0; font-size: 10px; color: #94a3b8;">This is an automated system confirmation. Replies to this address are unmonitored.</p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Send Appointment Confirmation Email to Patient / Client
 * @param {Object} options
 * @param {Object} options.booking - Populated booking record
 * @param {string} options.recipientEmail - Client email
 * @param {string} options.recipientName - Client name
 * @param {string} options.petName - Pet name
 * @param {string} options.doctorName - Doctor name
 * @returns {Promise<Object>}
 */
const sendAppointmentConfirmationEmail = async ({ booking = {}, recipientEmail, recipientName, petName, doctorName }) => {
  try {
    const targetEmail = recipientEmail || booking.customerId?.email;
    const clientName = recipientName || booking.customerId?.name || 'Valued Pet Parent';
    const patientName = petName || booking.petId?.petName || booking.petId?.name || 'Pet Patient';
    const attendingDoctor = doctorName || booking.assignedStaff || booking.doctor || 'Dr. Perera (Senior Vet)';

    const subject = `🐾 Appointment Confirmed: ${patientName} with ${attendingDoctor} - 4 Paw Animal Clinic`;
    const htmlContent = generateAppointmentConfirmationHTML({
      booking,
      recipientName: clientName,
      petName: patientName,
      doctorName: attendingDoctor
    });

    const transporter = getTransporter();

    if (transporter && targetEmail) {
      const fromSender = process.env.EMAIL_FROM || `"4 Paw Animal Clinic" <${process.env.EMAIL_USER}>`;
      const mailOptions = {
        from: fromSender,
        to: targetEmail,
        subject,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] ✅ Appointment confirmation email sent to ${targetEmail} (MessageId: ${info.messageId})`);
      return {
        success: true,
        messageId: info.messageId,
        recipient: targetEmail
      };
    }

    // Graceful Console Fallback if SMTP is not configured or in dev
    console.log('='.repeat(75));
    console.log('📧 [EmailService] SIMULATED APPOINTMENT CONFIRMATION EMAIL DISPATCH');
    console.log('='.repeat(75));
    console.log(`To: ${clientName} <${targetEmail || 'client@4pawclinic.lk'}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Patient: ${patientName} (PIN: ${booking.patientPin || booking.petPin || booking.petId?.uniquePin || 'N/A'})`);
    console.log(`Attending Specialist: ${attendingDoctor}`);
    console.log(`Date: ${booking.date || booking.appointmentDate}`);
    console.log(`Time Slot: ${booking.timeSlot}`);
    console.log(`Room: ${booking.roomNumber || 'Room 02 (OPD)'}`);
    console.log(`Queue: #${booking.queueNumber || '01'}`);
    console.log(`Advisory: Please arrive 15 minutes prior to ${booking.timeSlot} for clinical triage.`);
    console.log('='.repeat(75));

    return {
      success: true,
      simulated: true,
      recipient: targetEmail,
      message: 'Appointment email dispatched via clinical development logger'
    };
  } catch (error) {
    console.warn(`[EmailService Warning]: SMTP delivery failed (${error.message}). Falling back to resilient development logger.`);
    console.log('='.repeat(75));
    console.log('📧 [EmailService] SIMULATED APPOINTMENT CONFIRMATION (Fallback Logger)');
    console.log('='.repeat(75));
    console.log(`To: ${recipientName || 'Valued Pet Parent'} <${recipientEmail || 'client@4pawclinic.lk'}>`);
    console.log(`Subject: 🐾 Appointment Confirmed: ${petName || 'Pet Patient'} with ${doctorName || 'Senior Vet'}`);
    console.log(`Time Slot: ${booking.timeSlot || 'Scheduled Time'}`);
    console.log('='.repeat(75));

    return {
      success: true,
      simulated: true,
      fallback: true,
      warning: error.message,
      recipient: recipientEmail
    };
  }
};

module.exports = {
  sendStaffWelcomeEmail,
  sendAppointmentConfirmationEmail,
  getRoleTitle
};
