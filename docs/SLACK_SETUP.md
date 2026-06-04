# Slack Setup

## Local Development

Install dependencies:

    npm install

Create a local `.env` file:

    SLACK_BOT_TOKEN=xoxb-...
    SLACK_SIGNING_SECRET=...
    SLACK_APP_TOKEN=xapp-...
    PORT=3000
    NODE_ENV=development

Do not commit `.env`.

## Slack App Configuration

Enable Socket Mode.

Create a slash command:

    /legacy

Usage hint:

    assess claims-batch

Description:

    Run a legacy modernization assessment

## Run Locally

    npm run slack:dev

Expected output:

    Legacy Modernization Commander is running in Socket Mode.

## Test in Slack

    /legacy assess claims-batch

The command should return a modernization assessment for CLAIMS-BATCH.
