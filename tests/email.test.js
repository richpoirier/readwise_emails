const sgMail = require('@sendgrid/mail');
const { sendEmailViaSendgrid } = require('../src/email');

// Mock @sendgrid/mail
jest.mock('@sendgrid/mail');

describe('Email Functionality', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('sendEmailViaSendgrid', () => {
    const mockPdf = Buffer.from('test pdf content');
    const mockFilename = 'test.pdf';

    it('should send email with correct parameters', async () => {
      sgMail.send.mockResolvedValueOnce([{ statusCode: 202 }]);

      await sendEmailViaSendgrid(mockPdf, mockFilename);

      expect(sgMail.setApiKey).toHaveBeenCalledWith('test_sendgrid_key');
      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'test@kindle.com',
        from: 'test@example.com',
        subject: 'Readwise Highlights',
        text: 'Readwise Highlights',
        attachments: [{
          content: mockPdf.toString('base64'),
          filename: mockFilename,
          type: 'application/pdf',
          disposition: 'attachment',
        }]
      });
    });

    it('should handle SendGrid errors', async () => {
      const errorMessage = 'SendGrid Error';
      sgMail.send.mockRejectedValueOnce(new Error(errorMessage));

      await expect(sendEmailViaSendgrid(mockPdf, mockFilename))
        .rejects.toThrow(errorMessage);
    });
  });
}); 