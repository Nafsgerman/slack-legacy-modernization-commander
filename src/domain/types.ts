export type Severity = "low" | "medium" | "high" | "critical";

export type Confidence = "low" | "medium" | "high";

export type AlertInput = {
  id: string;
  title: string;
  source: string;
  observedAt: string;
  actorUserId: string;
  appId: string;
  ipAddress: string;
  geo: string;
  requestedScopes: string[];
  touchedChannels: string[];
  rawSignals: string[];
};

export type UserRisk = {
  userId: string;
  displayName: string;
  department: string;
  riskLevel: Severity;
  riskSignals: string[];
  lastSuccessfulLoginAt: string;
  lastMfaChallengeAt: string;
};

export type AppInstall = {
  appId: string;
  appName: string;
  installerUserId: string;
  installedAt: string;
  approved: boolean;
  requestedScopes: string[];
  vendor: string;
};

export type AuditEvent = {
  id: string;
  occurredAt: string;
  actorUserId: string;
  action: string;
  target: string;
  ipAddress: string;
  geo: string;
  summary: string;
};

export type Runbook = {
  id: string;
  title: string;
  containmentSteps: string[];
  evidenceToCollect: string[];
  escalationPath: string[];
};

export type ToolTrace = {
  toolName: string;
  input: Record<string, unknown>;
  status: "ok" | "error";
  observedAt: string;
  resultSummary: string;
};

export type ContextBundle = {
  userRisk: UserRisk | null;
  appInstall: AppInstall | null;
  auditEvents: AuditEvent[];
  runbook: Runbook | null;
  toolTrace: ToolTrace[];
};

export type TaskRecommendation = {
  ownerRole: string;
  action: string;
  priority: "p0" | "p1" | "p2";
  rationale: string;
};

export type TimelineEntry = {
  occurredAt: string;
  event: string;
  source: string;
};

export type IncidentBrief = {
  incidentId: string;
  title: string;
  severity: Severity;
  confidence: Confidence;
  status: "triaged" | "contained" | "monitoring";
  summary: string;
  keyFacts: string[];
  recommendedTasks: TaskRecommendation[];
  timeline: TimelineEntry[];
  stakeholderUpdate: string;
  toolTrace: ToolTrace[];
};
