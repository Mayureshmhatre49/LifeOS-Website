-- Phase Security: Audit Logs, Login Attempts, Security Events
-- Run in Supabase SQL editor after 010_enterprise.sql

-- ── Audit logs ─────────────────────────────────────────────────────────────────
-- Tamper-evident log of all security-relevant actions. Written via service role only.

CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   TEXT,
  ip_address    TEXT,
  user_agent    TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}',
  severity      TEXT NOT NULL DEFAULT 'info'
                  CHECK (severity IN ('info', 'warning', 'critical')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id    ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity   ON audit_logs(severity, created_at DESC)
  WHERE severity IN ('warning', 'critical');

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role writes; no user reads via RLS (admin tooling uses service role)
CREATE POLICY "Service role manages audit logs" ON audit_logs
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── Login attempts ─────────────────────────────────────────────────────────────
-- Per-email brute-force tracking; service role only.

CREATE TABLE IF NOT EXISTS login_attempts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL,
  ip_address     TEXT NOT NULL,
  success        BOOLEAN NOT NULL,
  failure_reason TEXT,
  user_agent     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email    ON login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip       ON login_attempts(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_failures ON login_attempts(email, success, created_at DESC)
  WHERE NOT success;

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages login attempts" ON login_attempts
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── Security events ────────────────────────────────────────────────────────────
-- Structured threat/anomaly events for monitoring and alerting.

CREATE TABLE IF NOT EXISTS security_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,   -- brute_force | prompt_injection | api_abuse | unusual_activity
  severity    TEXT NOT NULL DEFAULT 'warning'
                CHECK (severity IN ('info', 'warning', 'critical')),
  details     JSONB NOT NULL DEFAULT '{}',
  ip_address  TEXT,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_type      ON security_events(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_unresolved ON security_events(resolved, severity, created_at DESC)
  WHERE NOT resolved;
CREATE INDEX IF NOT EXISTS idx_security_events_user      ON security_events(user_id, created_at DESC);

ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages security events" ON security_events
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── Failed-login RPC (atomic counter helper) ───────────────────────────────────
-- Returns recent failure count for an email within the last 15 minutes.

CREATE OR REPLACE FUNCTION get_recent_failure_count(p_email TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM login_attempts
  WHERE email = p_email
    AND success = FALSE
    AND created_at > NOW() - INTERVAL '15 minutes';
$$ LANGUAGE sql SECURITY DEFINER;
