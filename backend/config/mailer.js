const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendLowStockAlert = async (bloodGroup, currentUnits, donors) => {
  if (!donors || donors.length === 0) return;

  const recipientEmails = donors.map(d => d.email).join(',');

  const mailOptions = {
    from: `"Blood Bank Alert" <${process.env.EMAIL_USER}>`,
    to: recipientEmails,
    subject: `🚨 URGENT: ${bloodGroup} Blood Group Critically Low`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #c0392b; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">🩸 Urgent Blood Donation Alert</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333;">Dear Donor,</p>
          <p style="font-size: 16px; color: #333;">
            Our blood bank is critically low on <strong style="color: #c0392b; font-size: 20px;">${bloodGroup}</strong> blood group.
          </p>
          <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <strong>Current Stock:</strong> Only <span style="color: #c0392b; font-size: 18px; font-weight: bold;">${currentUnits} units</span> remaining
          </div>
          <p style="font-size: 15px; color: #555;">
            Lives are at stake. If you are eligible to donate (last donation ≥ 90 days ago), please visit us as soon as possible.
          </p>
          <a href="${process.env.FRONTEND_URL}/donor/book" 
             style="display: inline-block; background: #c0392b; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">
            Book Donation Appointment
          </a>
          <p style="font-size: 13px; color: #999; margin-top: 30px;">
            You are receiving this email because you are a registered donor with ${bloodGroup} blood group.<br>
            Blood Bank Management System
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Low stock alert sent for ${bloodGroup} to ${donors.length} donors`);
  } catch (error) {
    console.error('Email send error:', error.message);
  }
};

const sendRequestStatusEmail = async (hospitalEmail, hospitalName, bloodGroup, units, status) => {
  const statusColors = { approved: '#27ae60', rejected: '#e74c3c', pending: '#f39c12' };
  const color = statusColors[status] || '#333';

  const mailOptions = {
    from: `"Blood Bank" <${process.env.EMAIL_USER}>`,
    to: hospitalEmail,
    subject: `Blood Request ${status.toUpperCase()} - ${bloodGroup} (${units} units)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin:0;">Blood Request ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Dear <strong>${hospitalName}</strong>,</p>
          <p>Your blood request has been <strong style="color:${color}">${status}</strong>.</p>
          <table style="width:100%; border-collapse:collapse; margin:15px 0;">
            <tr style="background:#eee"><td style="padding:8px; border:1px solid #ddd"><strong>Blood Group</strong></td><td style="padding:8px; border:1px solid #ddd">${bloodGroup}</td></tr>
            <tr><td style="padding:8px; border:1px solid #ddd"><strong>Units Requested</strong></td><td style="padding:8px; border:1px solid #ddd">${units}</td></tr>
            <tr style="background:#eee"><td style="padding:8px; border:1px solid #ddd"><strong>Status</strong></td><td style="padding:8px; border:1px solid #ddd; color:${color}; font-weight:bold;">${status.toUpperCase()}</td></tr>
          </table>
          <p style="font-size:13px; color:#999;">Blood Bank Management System</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

module.exports = { sendLowStockAlert, sendRequestStatusEmail };
