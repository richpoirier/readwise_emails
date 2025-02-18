const sgMail = require('@sendgrid/mail');

async function sendEmailViaSendgrid(pdf, pdfFilename) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const attachments = [
    {
      content: pdf.toString('base64'),
      filename: pdfFilename,
      type: 'application/pdf',
      disposition: 'attachment',
    }
  ];

  const msg = {
    to: process.env.KINDLE_EMAIL,
    from: process.env.FROM_EMAIL,
    subject: 'Readwise Highlights',
    text: 'Readwise Highlights',
    attachments: attachments
  };
  
  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error;
  }
}

module.exports = {
  sendEmailViaSendgrid
}; 