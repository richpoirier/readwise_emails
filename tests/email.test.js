const { sendEmail } = require('../src/email');
const sgMail = require('@sendgrid/mail');

// Mock @sendgrid/mail
jest.mock('@sendgrid/mail');

describe('Email Sending', () => {
  beforeEach(() => {
    process.env.SENDGRID_API_KEY = 'test-key';
    process.env.KINDLE_EMAIL = 'test@kindle.com';
    process.env.FROM_EMAIL = 'from@test.com';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send email with PDF attachment', async () => {
    const pdf = Buffer.from('test pdf content');
    const filename = 'test.pdf';

    sgMail.send.mockResolvedValue(true);

    const result = await sendEmail(pdf, filename);

    expect(sgMail.setApiKey).toHaveBeenCalledWith('test-key');
    expect(sgMail.send).toHaveBeenCalledWith({
      to: 'test@kindle.com',
      from: 'from@test.com',
      subject: 'Readwise Highlights',
      text: 'Readwise Highlights',
      attachments: [{
        content: pdf.toString('base64'),
        filename: filename,
        type: 'application/pdf',
        disposition: 'attachment'
      }]
    });
    expect(result).toBe(true);
  });

  it('should handle SendGrid errors', async () => {
    const pdf = Buffer.from('test pdf content');
    const filename = 'test.pdf';

    sgMail.send.mockRejectedValue(new Error('SendGrid Error'));

    await expect(sendEmail(pdf, filename)).rejects.toThrow('SendGrid Error');
  });
}); 