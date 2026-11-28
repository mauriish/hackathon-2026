CREATE TABLE report_records (
    report_id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL,
    target_kind TEXT NOT NULL CHECK (target_kind IN ('app', 'link')),
    target_value TEXT NOT NULL CHECK (length(target_value) > 0),
    sanitized_message TEXT NOT NULL CHECK (length(sanitized_message) > 0),
    sanitized_context TEXT NOT NULL,
    status TEXT NOT NULL CHECK (
        status IN ('received', 'processing', 'completed', 'rejected', 'failed')
    ),
    UNIQUE (report_id, created_at)
);

CREATE TABLE report_abuse_identifiers (
    report_id UUID PRIMARY KEY,
    issued_at TIMESTAMPTZ NOT NULL,
    abuse_id TEXT NOT NULL CHECK (length(abuse_id) > 0),
    expires_at TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (report_id, issued_at)
        REFERENCES report_records (report_id, created_at)
        ON DELETE CASCADE,
    CHECK (expires_at > issued_at),
    CHECK (expires_at <= issued_at + INTERVAL '14 days')
);

CREATE INDEX report_abuse_identifiers_expiration_idx
    ON report_abuse_identifiers (expires_at);

CREATE TABLE report_status_audit (
    event_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    report_id UUID NOT NULL
        REFERENCES report_records (report_id)
        ON DELETE CASCADE,
    previous_status TEXT CHECK (
        previous_status IS NULL
        OR previous_status IN (
            'received', 'processing', 'completed', 'rejected', 'failed'
        )
    ),
    new_status TEXT NOT NULL CHECK (
        new_status IN ('received', 'processing', 'completed', 'rejected', 'failed')
    ),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (previous_status IS NULL OR previous_status <> new_status)
);

CREATE INDEX report_status_audit_report_changed_idx
    ON report_status_audit (report_id, changed_at);
