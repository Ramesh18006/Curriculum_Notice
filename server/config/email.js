let nodemailer;
try {
    nodemailer = require('nodemailer');
} catch (e) {
    console.warn('⚠️ nodemailer module not found. Email notifications will be disabled.');
}

const transporter = nodemailer ? nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
}) : null;

async function sendNotification(email, title, content) {
    if (!transporter) {
        console.warn('✉️ Skipping email (nodemailer not installed)');
        return false;
    }
    try {
        await transporter.sendMail({
            from: `"CircularHub Notification" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `New Circular: ${title}`,
            text: content,
            html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">New Circular Hub Update</h2>
          <h3>${title}</h3>
          <p>${content}</p>
          <hr />
          <p style="font-size: 12px; color: #666;">This is a secondary notification. If you have already read this, please ignore.</p>
        </div>
      `,
        });
        console.log(`✓ Email sent to ${email}`);
        return true;
    } catch (err) {
        console.error(`✗ Failed to send email to ${email}:`, err);
        return false;
    }
}

module.exports = { sendNotification };
