import { appInstalls, auditEvents, runbooks, userRisks } from "../demo/fixtures.ts";
import type { AppInstall, AuditEvent, Runbook, ToolTrace, UserRisk } from "../domain/types.ts";

const nowUtc = (): string => new Date().toISOString();

const trace = (
  toolName: string,
  input: Record<string, unknown>,
  resultSummary: string,
  status: ToolTrace["status"] = "ok"
): ToolTrace => ({
  toolName,
  input,
  status,
  observedAt: nowUtc(),
  resultSummary
});

export type ToolResult<T> = {
  value: T;
  trace: ToolTrace;
};

export const lookupUserRisk = (userId: string): ToolResult<UserRisk | null> => {
  const value = userRisks[userId] ?? null;
  return {
    value,
    trace: trace(
      "lookup_user_risk",
      { userId },
      value ? `Found ${value.riskLevel} risk profile for ${value.displayName}.` : "No user risk profile found."
    )
  };
};

export const lookupAppInstall = (appId: string): ToolResult<AppInstall | null> => {
  const value = appInstalls[appId] ?? null;
  return {
    value,
    trace: trace(
      "lookup_app_install",
      { appId },
      value ? `Found app install for ${value.appName}; approved=${value.approved}.` : "No app install found."
    )
  };
};

export const searchAuditEvents = (actorUserId: string, ipAddress: string): ToolResult<AuditEvent[]> => {
  const value = auditEvents.filter((event) => event.actorUserId === actorUserId || event.ipAddress === ipAddress);
  return {
    value,
    trace: trace(
      "search_audit_events",
      { actorUserId, ipAddress },
      `Found ${value.length} related audit event${value.length === 1 ? "" : "s"}.`
    )
  };
};

export const getRunbook = (runbookId: string): ToolResult<Runbook | null> => {
  const value = runbooks[runbookId] ?? null;
  return {
    value,
    trace: trace(
      "get_runbook",
      { runbookId },
      value ? `Loaded runbook: ${value.title}.` : "No runbook found."
    )
  };
};
