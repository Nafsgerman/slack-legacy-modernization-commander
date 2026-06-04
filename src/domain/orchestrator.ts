import type { AlertInput, ContextBundle, IncidentBrief } from "./types.ts";
import { buildKeyFacts, buildTaskRecommendations, buildTimeline, combineSeverity, scoreAlertSeverity, scoreConfidence } from "./triage.ts";
import { getRunbook, lookupAppInstall, lookupUserRisk, searchAuditEvents } from "../tools/context-tools.ts";

export const gatherContext = (alert: AlertInput): ContextBundle => {
  const userRisk = lookupUserRisk(alert.actorUserId);
  const appInstall = lookupAppInstall(alert.appId);
  const auditEvents = searchAuditEvents(alert.actorUserId, alert.ipAddress);
  const runbook = getRunbook("suspicious_oauth_app");

  return {
    userRisk: userRisk.value,
    appInstall: appInstall.value,
    auditEvents: auditEvents.value,
    runbook: runbook.value,
    toolTrace: [userRisk.trace, appInstall.trace, auditEvents.trace, runbook.trace]
  };
};

export const runIncidentWorkflow = (alert: AlertInput): IncidentBrief => {
  const context = gatherContext(alert);
  const alertSeverity = scoreAlertSeverity(alert, context);
  const severity = combineSeverity(alertSeverity, context.userRisk?.riskLevel ?? null);
  const confidence = scoreConfidence(context);
  const recommendedTasks = buildTaskRecommendations(severity, context);

  return {
    incidentId: alert.id,
    title: alert.title,
    severity,
    confidence,
    status: "triaged",
    summary:
      `Suspicious OAuth activity was detected for ${alert.actorUserId}. ` +
      `The app requested broad access and touched sensitive Slack channels shortly after installation.`,
    keyFacts: buildKeyFacts(alert, context),
    recommendedTasks,
    timeline: buildTimeline(alert, context),
    stakeholderUpdate:
      `We are investigating suspicious Slack OAuth activity involving ${alert.actorUserId} and app ${alert.appId}. ` +
      `Initial severity is ${severity} with ${confidence} confidence. Immediate containment is focused on revoking app access, ` +
      `reviewing the installer account, and preserving relevant audit evidence.`,
    toolTrace: context.toolTrace
  };
};
