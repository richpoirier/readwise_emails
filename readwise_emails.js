require('dotenv').config();

const { getHighlights } = require('./src/readwise');
const { convertToPdf } = require('./src/pdf');
const { sendEmail } = require('./src/email');

// Validate required environment variables
const requiredEnvVars = ['SENDGRID_API_KEY', 'READWISE_AUTH_TOKEN', 'KINDLE_EMAIL', 'FROM_EMAIL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

async function main() {
    try {
        const highlights = await getHighlights();
        console.log('Got highlights:', highlights.length);
        
        const pdf = await convertToPdf(highlights);
        console.log('Generated PDF');

        // Get today's date in the format "YYYY-MM-DD"
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        // Create the PDF filename with today's date
        const pdfFilename = `Readwise Daily Highlights - ${formattedDate}.pdf`;

        await sendEmail(pdf, pdfFilename);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error in main function:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}

module.exports = { main };