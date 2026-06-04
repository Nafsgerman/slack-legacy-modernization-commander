import type { AlertInput, AppInstall, AuditEvent, Runbook, UserRisk } from "../domain/types.ts";

export const demoAlert: AlertInput = {
  id: "INC-SLACK-OAUTH-2026-0001",
  title: "Suspicious Slack OAuth app activity",
  source: "synthetic-demo-detector",
  observedAt: "2026-05-27T18:42:11Z",
  actorUserId: "U042FINANCE7",
  appId: "A09RISKYBOT",
  ipAddress: "203.0.113.77",
  geo: "Frankfurt, DE",
  requestedScopes: ["channels:history", "groups:history", "files:read", "users:read", "chat:write"],
  touchedChannels: ["#finance-leadership", "#sec-incident-response"],
  rawSignals: [
    "New OAuth app requested broad read scopes",
    "Installer logged in from new geography",
    "Sensitive channel access observed within 10 minutes of install",
    "No prior approval record for app"
  ]
};

export const userRisks: Record<string, UserRisk> = {
  U042FINANCE7: {
    userId: "U042FINANCE7",
    displayName: "Maya Chen",
    department: "Finance",
    riskLevel: "high",
    riskSignals: [
      "First login from Germany for this user",
      "MFA challenge occurred 4 minutes before app install",
      "User belongs to finance leadership channel"
    ],
    lastSuccessfulLoginAt: "2026-05-27T18:31:02Z",
    lastMfaChallengeAt: "2026-05-27T18:34:55Z"
  }
};

export const appInstalls: Record<string, AppInstall> = {
  A09RISKYBOT: {
    appId: "A09RISKYBOT",
    appName: "Quarterly Export Helper",
    installerUserId: "U042FINANCE7",
    installedAt: "2026-05-27T18:38:40Z",
    approved: false,
    requestedScopes: ["channels:history", "groups:history", "files:read", "users:read", "chat:write"],
    vendor: "Unknown"
  }
};

export const auditEvents: AuditEvent[] = [
  {
    id: "AE-1001",
    occurredAt: "2026-05-27T18:31:02Z",
    actorUserId: "U042FINANCE7",
    action: "user_login",
    target: "slack_workspace",
    ipAddress: "203.0.113.77",
    geo: "Frankfurt, DE",
    summary: "Successful login from a geography not previously associated with the user."
  },
  {
    id: "AE-1002",
    occurredAt: "2026-05-27T18:34:55Z",
    actorUserId: "U042FINANCE7",
    action: "mfa_challenge",
    target: "slack_workspace",
    ipAddress: "203.0.113.77",
    geo: "Frankfurt, DE",
    summary: "MFA challenge completed shortly before OAuth installation."
  },
  {
    id: "AE-1003",
    occurredAt: "2026-05-27T18:38:40Z",
    actorUserId: "U042FINANCE7",
    action: "oauth_app_installed",
    target: "A09RISKYBOT",
    ipAddress: "203.0.113.77",
    geo: "Frankfurt, DE",
    summary: "Unapproved OAuth app installed with broad read scopes."
  },
  {
    id: "AE-1004",
    occurredAt: "2026-05-27T18:41:08Z",
    actorUserId: "U042FINANCE7",
    action: "channel_history_accessed",
    target: "#finance-leadership",
    ipAddress: "203.0.113.77",
    geo: "Frankfurt, DE",
    summary: "App accessed sensitive channel history shortly after installation."
  }
];

export const runbooks: Record<string, Runbook> = {
  suspicious_oauth_app: {
    id: "suspicious_oauth_app",
    title: "Suspicious Slack OAuth App",
    containmentSteps: [
      "Revoke the OAuth app token and disable the app pending review.",
      "Temporarily suspend the installer account if compromise is suspected.",
      "Preserve audit logs covering login, OAuth install, and channel access events.",
      "Notify finance leadership that access to sensitive channel history is under review."
    ],
    evidenceToCollect: [
      "OAuth app scopes, installer, install timestamp, and vendor metadata.",
      "Recent login and MFA events for the installer.",
      "Channels and files accessed by the app after installation.",
      "Approval records for the app, if any."
    ],
    escalationPath: [
      "Security incident commander",
      "Slack workspace administrator",
      "Identity administrator",
      "Finance business owner"
    ]
  }
};
