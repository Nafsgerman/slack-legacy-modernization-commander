# Slack Setup

## Model Level

Use High for Slack setup and debugging.

## Local App Strategy

The MVP uses Slack Socket Mode.

Why:

- no ngrok required,
- works from the MacBook Air,
- works when invoked from Slack mobile,
- fastest path for hackathon testing.

Important: Socket Mode is excellent for the hackathon demo and sandbox testing. Before marketplace submission, review Slack's latest Marketplace requirements because public marketplace distribution may require a hosted HTTPS endpoint instead of Socket Mode.

## Create Slack App

1. Open `https://api.slack.com/apps`.
2. Click `Create New App`.
3. Choose `From an app manifest`.
4. Choose the hackathon/developer workspace.
5. Paste the contents of `slack/manifest.yaml`.
6. Create the app.

## Create App-Level Token

1. Go to `Basic Information`.
2. Under `App-Level Tokens`, click `Generate Token and Scopes`.
3. Token name: `socket-mode`.
4. Add scope: `connections:write`.
5. Generate token.
6. Copy the token that starts with `xapp-`.

## Install App

1. Go to `OAuth & Permissions`.
2. Click `Install to Workspace`.
3. Copy the bot token that starts with `xoxb-`.

## Create Local Env

**.env**

```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-level-token
PORT=3000
NODE_ENV=development
```

Get `SLACK_SIGNING_SECRET` from `Basic Information` > `App Credentials`.

## Run Locally

**Terminal**

```bash
cd "/Users/nafees/Desktop/nafees/hackathon/slack incident commander"
npm run slack:dev
```

Expected output:

```text
Slack Incident Commander is running in Socket Mode.
```

## Test In Slack

In Slack desktop/browser or Slack mobile:

```text
/incident triage suspicious-oauth
```

Shortcut:

```text
/incident demo
```

Expected behavior:

- Slack returns an ephemeral incident brief.
- Severity is `CRITICAL`.
- Confidence is `HIGH`.
- The response includes summary, incident metadata, and recommended actions.

## Debug Checklist

- `invalid_auth`: check `SLACK_BOT_TOKEN`.
- `not_authed`: app is not installed or token is missing.
- `not_in_channel`: invite the app to the channel or test in a channel where the command is available.
- command timeout: confirm `npm run slack:dev` is still running.
- Socket Mode connection failure: check `SLACK_APP_TOKEN` starts with `xapp-` and has `connections:write`.
