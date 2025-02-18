# Readwise Emails

A Node.js application for emailing Readwise highlights.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the following required variables in `.env`:
     - `SENDGRID_API_KEY`: Your SendGrid API key
     - `READWISE_AUTH_TOKEN`: Your Readwise authentication token
     - `KINDLE_EMAIL`: Your Kindle email address
     - `FROM_EMAIL`: The email address to send from (must be verified in SendGrid)

3. Run the application:
```bash
./run_readwise.sh
```

## Files

- `readwise_emails.js` - Main application script
- `run_readwise.sh` - Shell script to execute the application
- `package.json` - Project dependencies and configuration
- `.env.example` - Template for environment variables
- `.env` - (Create this) Your actual environment variables (not committed to git) 