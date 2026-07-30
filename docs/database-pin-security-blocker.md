# Database PIN security blocker

The web client no longer requests PIN fields, but direct PostgREST access to
`public.restroom.pin`, `pin_male`, and `pin_female` remains possible for roles
that currently have those grants.

This is not fixed by the web commits and remains a production release blocker.
Changing the grants or RLS may break the legacy iOS application, which directly
reads `restroom.pin`. Any remediation therefore requires a separately approved,
coordinated database/iOS decision.

No migration, grant change, RLS change, or production-data change is included
with this documentation.
