const PDFDocument = require('pdfkit');

async function convertToPdf(highlights) {
  return new Promise((resolve, reject) => {
    try {
      console.log('Creating PDF document...');
      const doc = new PDFDocument();
      const chunks = [];

      // Collect the PDF data chunks
      doc.on('data', chunk => chunks.push(chunk));
            
      // When the PDF is done being generated, resolve with the complete Buffer
      doc.on('end', () => {
        console.log('PDF generated successfully');
        resolve(Buffer.concat(chunks));
      });

      // Handle any errors
      doc.on('error', err => {
        console.error('Error generating PDF:', err);
        reject(err);
      });

      // Set some basic PDF properties
      doc.info['Title'] = 'Readwise Highlights';
            
      // Add content for each highlight
      for (const highlight of highlights) {
        // Add title
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text(highlight.title || 'Untitled', {
            underline: true
          });

        // Add author
        doc.fontSize(12)
          .font('Helvetica-Oblique')
          .text(highlight.author || 'Unknown Author', {
            paragraphGap: 10
          });

        // Add highlight text
        doc.fontSize(12)
          .font('Helvetica')
          .text(highlight.text, {
            paragraphGap: 20
          });

        // Add some space between highlights
        doc.moveDown(2);
      }

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error('Error in PDF conversion:', error);
      reject(error);
    }
  });
}

module.exports = {
  convertToPdf
}; 