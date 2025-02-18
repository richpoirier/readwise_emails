const axios = require('axios');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['SENDGRID_API_KEY', 'READWISE_AUTH_TOKEN', 'KINDLE_EMAIL', 'FROM_EMAIL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const readwiseApiUrl = 'https://readwise.io/api/v2/review';
const authToken = process.env.READWISE_AUTH_TOKEN;

async function getHighlights() {
  const response = await axios.get(readwiseApiUrl, {
    headers: {
      Authorization: `Token ${authToken}`
    }
  });

  return response.data.highlights;
}

async function convertToPdf(highlights) {
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1024, height: 768 });
        
        // Create HTML content with a 40px margin around the text
        let htmlContent = `<html><body style="margin:50px; padding: 25px">`;
        for (let highlight of highlights) {
            htmlContent += `<h2>${highlight.title || 'Untitled'}</h2>`;
            htmlContent += `<h3>${highlight.author || 'Unknown Author'}</h3>`;
            htmlContent += `<p>${highlight.text}</p>`;
        }
        htmlContent += `</body></html>`;

        await page.setContent(htmlContent);
        const pdf = await page.pdf({ 
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });
        return pdf;
    } finally {
        await browser.close();
    }
}

async function sendEmailViaSendgrid(pdf, pdfFilename) {
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
    console.log('Email sent successfully via SendGrid');
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error; // Re-throw to be caught by the main function
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

        await sendEmailViaSendgrid(pdf, pdfFilename);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error in main function:', error);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});