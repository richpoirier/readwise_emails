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
      end: jest.fn()
    };
        
    // Make PDFDocument constructor return our mock
    PDFDocument.mockImplementation(() => mockDoc);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a PDF with correct structure', async () => {
    const highlights = [{
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
    expect(mockDoc.text).toHaveBeenCalledWith('Note: Test note', { paragraphGap: 20 });
        
    // Verify PDF was finalized
    expect(mockDoc.end).toHaveBeenCalled();
        
    // Verify we got a Buffer back
    expect(Buffer.isBuffer(pdf)).toBe(true);
  });

  it('should handle missing title and author', async () => {
    const highlights = [{
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

    // Verify default values were used
    expect(mockDoc.text).toHaveBeenCalledWith('Untitled', { underline: true });
    expect(mockDoc.text).toHaveBeenCalledWith('Unknown Author', { paragraphGap: 10 });
  });

  it('should handle multiple highlights', async () => {
    const highlights = [
      {
        title: 'Book 1',
        author: 'Author 1',
        text: 'Highlight 1',
        note: 'Note 1'
      },
      {
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
    expect(mockDoc.text).toHaveBeenCalledWith('Note: Note 1', { paragraphGap: 20 });
        
    expect(mockDoc.text).toHaveBeenCalledWith('Book 2', { underline: true });
    expect(mockDoc.text).toHaveBeenCalledWith('Author 2', { paragraphGap: 10 });
    expect(mockDoc.text).toHaveBeenCalledWith('Highlight 2', { paragraphGap: 10 });
    expect(mockDoc.text).toHaveBeenCalledWith('Note: Note 2', { paragraphGap: 20 });
        
    // Verify spacing between highlights
    expect(mockDoc.moveDown).toHaveBeenCalledTimes(2);
  });

  it('should handle highlights without notes', async () => {
    const highlights = [{
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
    expect(mockDoc.text).toHaveBeenCalledWith('Test highlight', { paragraphGap: 20 });
    
    // Verify note was not added
    expect(mockDoc.text).not.toHaveBeenCalledWith(expect.stringMatching(/^Note:/), expect.any(Object));
  });

  it('should handle PDF generation errors', async () => {
    const highlights = [{
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