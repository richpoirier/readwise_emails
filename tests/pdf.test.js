const { convertToPdf } = require('../src/pdf');
const PDFDocument = require('pdfkit');

// Mock PDFDocument
jest.mock('pdfkit');

describe('PDF Generation', () => {
  let mockDoc;
    
  beforeEach(() => {
    // Create a mock PDFDocument instance
    mockDoc = {
      on: jest.fn(),
      info: {},
      fontSize: jest.fn().mockReturnThis(),
      font: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      moveDown: jest.fn().mockReturnThis(),
      fillColor: jest.fn().mockReturnThis(),
      link: jest.fn().mockReturnThis(),
      end: jest.fn()
    };
        
    // Make PDFDocument constructor return our mock
    PDFDocument.mockImplementation(() => mockDoc);

    // Set default proxy URL for tests
    process.env.DELETE_PROXY_URL = 'https://test-proxy.com';
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.DELETE_PROXY_URL;
  });

  it('should create a PDF with correct structure', async () => {
    const highlights = [{
      id: '12345',
      title: 'Test Book',
      author: 'Test Author',
      text: 'Test highlight',
      note: 'Test note'
    }];

    // Set up the data event handler
    mockDoc.on.mockImplementation((event, callback) => {
      if (event === 'data') {
        callback(Buffer.from('test'));
      } else if (event === 'end') {
        callback();
      }
    });

    const pdf = await convertToPdf(highlights);

    // Verify PDF was created
    expect(PDFDocument).toHaveBeenCalled();
        
    // Verify title was set
    expect(mockDoc.info['Title']).toBe('Readwise Highlights');
        
    // Verify content formatting
    expect(mockDoc.fontSize).toHaveBeenCalledWith(16);
    expect(mockDoc.font).toHaveBeenCalledWith('Helvetica-Bold');
    expect(mockDoc.text).toHaveBeenCalledWith('Test Book', { underline: true });
        
    expect(mockDoc.fontSize).toHaveBeenCalledWith(12);
    expect(mockDoc.font).toHaveBeenCalledWith('Helvetica-Oblique');
    expect(mockDoc.text).toHaveBeenCalledWith('Test Author', { paragraphGap: 10 });
        
    expect(mockDoc.fontSize).toHaveBeenCalledWith(12);
    expect(mockDoc.font).toHaveBeenCalledWith('Helvetica');
    expect(mockDoc.text).toHaveBeenCalledWith('Test highlight', { paragraphGap: 10 });

    // Verify note formatting
    expect(mockDoc.fontSize).toHaveBeenCalledWith(11);
    expect(mockDoc.font).toHaveBeenCalledWith('Helvetica-Oblique');
    expect(mockDoc.text).toHaveBeenCalledWith('Note: Test note', { paragraphGap: 10 });

    // Verify delete link
    expect(mockDoc.fontSize).toHaveBeenCalledWith(10);
    expect(mockDoc.fillColor).toHaveBeenCalledWith('#0000EE');
    expect(mockDoc.text).toHaveBeenCalledWith('Delete highlight', {
      link: 'https://test-proxy.com/delete-highlight/12345/',
      paragraphGap: 20,
      underline: true
    });
        
    // Verify PDF was finalized
    expect(mockDoc.end).toHaveBeenCalled();
        
    // Verify we got a Buffer back
    expect(Buffer.isBuffer(pdf)).toBe(true);
  });

  it('should use default proxy URL if not set in environment', async () => {
    delete process.env.DELETE_PROXY_URL;
    
    const highlights = [{
      id: '12345',
      text: 'Test highlight'
    }];

    mockDoc.on.mockImplementation((event, callback) => {
      if (event === 'data') {
        callback(Buffer.from('test'));
      } else if (event === 'end') {
        callback();
      }
    });

    await convertToPdf(highlights);

    // Verify default proxy URL is used
    expect(mockDoc.text).toHaveBeenCalledWith('Delete highlight', {
      link: 'http://localhost:3000/delete-highlight/12345/',
      paragraphGap: 20,
      underline: true
    });
  });

  it('should handle multiple highlights', async () => {
    const highlights = [
      {
        id: '12345',
        title: 'Book 1',
        author: 'Author 1',
        text: 'Highlight 1',
        note: 'Note 1'
      },
      {
        id: '67890',
        title: 'Book 2',
        author: 'Author 2',
        text: 'Highlight 2',
        note: 'Note 2'
      }
    ];

    mockDoc.on.mockImplementation((event, callback) => {
      if (event === 'data') {
        callback(Buffer.from('test'));
      } else if (event === 'end') {
        callback();
      }
    });

    await convertToPdf(highlights);

    // Verify both highlights were added
    expect(mockDoc.text).toHaveBeenCalledWith('Book 1', { underline: true });
    expect(mockDoc.text).toHaveBeenCalledWith('Author 1', { paragraphGap: 10 });
    expect(mockDoc.text).toHaveBeenCalledWith('Highlight 1', { paragraphGap: 10 });
    expect(mockDoc.text).toHaveBeenCalledWith('Note: Note 1', { paragraphGap: 10 });
    expect(mockDoc.text).toHaveBeenCalledWith('Delete highlight', {
      link: 'https://test-proxy.com/delete-highlight/12345/',
      paragraphGap: 20,
      underline: true
    });
        
    expect(mockDoc.text).toHaveBeenCalledWith('Book 2', { underline: true });
    expect(mockDoc.text).toHaveBeenCalledWith('Author 2', { paragraphGap: 10 });
    expect(mockDoc.text).toHaveBeenCalledWith('Highlight 2', { paragraphGap: 10 });
    expect(mockDoc.text).toHaveBeenCalledWith('Note: Note 2', { paragraphGap: 10 });
    expect(mockDoc.text).toHaveBeenCalledWith('Delete highlight', {
      link: 'https://test-proxy.com/delete-highlight/67890/',
      paragraphGap: 20,
      underline: true
    });
        
    // Verify spacing between highlights
    expect(mockDoc.moveDown).toHaveBeenCalledTimes(2);
  });

  it('should handle highlights without notes', async () => {
    const highlights = [{
      id: '12345',
      title: 'Test Book',
      author: 'Test Author',
      text: 'Test highlight'
    }];

    mockDoc.on.mockImplementation((event, callback) => {
      if (event === 'data') {
        callback(Buffer.from('test'));
      } else if (event === 'end') {
        callback();
      }
    });

    await convertToPdf(highlights);

    // Verify highlight without note
    expect(mockDoc.text).toHaveBeenCalledWith('Test Book', { underline: true });
    expect(mockDoc.text).toHaveBeenCalledWith('Test Author', { paragraphGap: 10 });
    expect(mockDoc.text).toHaveBeenCalledWith('Test highlight', { paragraphGap: 10 });
    
    // Verify delete link
    expect(mockDoc.text).toHaveBeenCalledWith('Delete highlight', {
      link: 'https://test-proxy.com/delete-highlight/12345/',
      paragraphGap: 20,
      underline: true
    });
  });

  it('should handle PDF generation errors', async () => {
    const highlights = [{
      id: '12345',
      title: 'Test Book',
      author: 'Test Author',
      text: 'Test highlight'
    }];

    // Simulate an error during PDF generation
    mockDoc.on.mockImplementation((event, callback) => {
      if (event === 'error') {
        callback(new Error('PDF generation failed'));
      }
    });

    await expect(convertToPdf(highlights)).rejects.toThrow('PDF generation failed');
  });
}); 