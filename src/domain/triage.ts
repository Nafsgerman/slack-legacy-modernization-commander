import type { AlertInput, Confidence, ContextBundle, Severity, TaskRecommendation, TimelineEntry } from "./types.ts";

const severityRank: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

const riskyScopes = new Set(["channels:history", "groups:history", "files:read", "admin", "users:read.email"]);

const maxSeverity = (...values: Severity[]): Severity =>
  values.reduce((highest, current) => (severityRank[current] > severityRank[highest] ? current : highest), "low");

export const scoreAlertSeverity = (alert: AlertInput, context: ContextBundle): Severity => {
  let score = 0;

  const riskyScopeCount = alert.requestedScopes.filter((scope) => riskyScopes.has(scope)).length;
  score += riskyScopeCount * 2;

  if (context.appInstall && !context.appInstall.approved) score += 3;
  if (context.userRisk) score += severityRank[context.userRisk.riskLevel];
  if (alert.touchedChannels.some((channel) => channel.includes("finance") || channel.includes("leadership"))) score += 3;
  if (context.auditEvents.some((event) => event.action === "channel_history_accessed")) score += 2;

  if (score >= 12) return "critical";
  if (score >= 8) return "high";
  if (score >= 4) return "medium";
  return "low";
};

export const scoreConfidence = (context: ContextBundle): Confidence => {
  let evidenceCount = 0;
  if (context.userRisk) evidenceCount += 1;
  if (context.appInstall) evidenceCount += 1;
  if (context.auditEvents.length >= 3) evidenceCount += 1;
  if (context.runbook) evidenceCount += 1;

  if (evidenceCount >= 3) return "high";
  if (evidenceCount === 2) return "medium";
  return "low";
};

export const buildKeyFacts = (alert: AlertInput, context: ContextBundle): string[] => {
  const facts = [
    `Alert observed at ${alert.observedAt} from ${alert.source}.`,
    `Actor ${alert.actorUserId} installed or used app ${alert.appId} from ${alert.ipAddress} (${alert.geo}).`,
    `Requested scopes: ${alert.requestedScopes.join(", ")}.`,
    `Touched channels: ${alert.touchedChannels.join(", ")}.`
  ];

  if (context.userRisk) {
    facts.push(`User risk is ${context.userRisk.riskLevel}; signals: ${context.userRisk.riskSignals.join("; ")}.`);
  }

  if (context.appInstall) {
    facts.push(
      `App "${context.appInstall.appName}" vendor=${context.appInstall.vendor}; approved=${context.appInstall.approved}; installed at ${context.appInstall.installedAt}.`
    );
  }

  if (context.auditEvents.length > 0) {
    facts.push(`Related audit events found: ${context.auditEvents.length}.`);
  }

  return facts;
};

export const buildTimeline = (alert: AlertInput, context: ContextBundle): TimelineEntry[] => {
  const fromAuditEvents = context.auditEvents.map((event) => ({
    occurredAt: event.occurredAt,
    event: event.summary,
    source: `audit:${event.id}`
  }));

  return [
    ...fromAuditEvents,
    {
      occurredAt: alert.observedAt,
      event: `Detector raised alert "${alert.title}".`,
      source: alert.source
    }
  ].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
};

export const buildTaskRecommendations = (severity: Severity, context: ContextBundle): TaskRecommendation[] => {
  const tasks: TaskRecommendation[] = [
    {
      ownerRole: "Slack workspace administrator",
      action: "Revoke the suspicious OAuth app token and block the app pending review.",
      priority: severity === "critical" ? "p0" : "p1",
      rationale: "The app is unapproved and requested broad read scopes."
    },
    {
      ownerRole: "Identity administrator",
      action: "Review the installer account, recent MFA activity, and active sessions.",
      priority: "p1",
      rationale: "The install followed risky login and MFA signals."
    },
    {
      ownerRole: "Incident commander",
      action: "Preserve audit events and publish a stakeholder update within 30 minutes.",
      priority: "p1",
      rationale: "The incident touches sensitive collaboration data and needs coordinated communications."
    }
  ];

  if (context.runbook) {
    tasks.push({
      ownerRole: "Security analyst",
      action: `Follow runbook evidence collection: ${context.runbook.evidenceToCollect[0]}`,
      priority: "p2",
      rationale: `Runbook "${context.runbook.title}" was matched for this incident type.`
    });
  }

  return tasks;
};

export const combineSeverity = (alertSeverity: Severity, userSeverity: Severity | null): Severity =>
  userSeverity ? maxSeverity(alertSeverity, userSeverity) : alertSeverity;
