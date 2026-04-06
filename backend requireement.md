# BACKEND SPECIFICATION FILE - LARAVEL ARCHITECTURE & EXECUTION PROMPT (V1)

---

## OBJECTIVE

Define a modern, scalable, production-ready backend for **Teranga Cockpit**.

This backend must power a founder operating system that helps users:

- think clearly
- execute faster
- track progress
- collaborate with co-founders
- manage project data in an encapsulated workspace
- connect time, files, reminders, and business metrics in one system

The backend is not a prototype backend.

It must be designed like a serious product foundation:

- modular
- maintainable
- extensible
- secure
- collaborative
- performant

---

## OFFICIAL VERSION TARGET

Use the latest major Laravel version from the official Laravel documentation:

- **Laravel 12**

Implementation should align with the current Laravel 12 ecosystem and conventions.

---

## BACKEND PRODUCT VISION

This backend is not just CRUD.

It is the engine behind:

- a founder cockpit
- a decision acceleration system
- a time-to-market tracker
- a project execution workspace
- a co-founder collaboration environment

The backend must support both:

- personal solo usage
- collaborative workspace usage with co-founders or trusted teammates

---

## CORE COLLABORATION MODEL

This project should use a **workspace-based architecture**.

It is not "enterprise multi-tenant SaaS" with complex tenant billing and tenant sharding.

It **is** a strong data encapsulation model where:

- one user can own multiple workspaces
- one workspace can contain multiple members
- members can be co-founders, collaborators, or operators
- projects belong to a workspace
- all project data is isolated inside the workspace
- users only access the workspaces they belong to

Think of this as:

> lightweight multi-tenant collaboration with strict workspace isolation

---

## BACKEND PROMPT

Build a production-ready Laravel 12 backend for Teranga Cockpit.

The backend must replace local frontend state with persistent APIs and domain services for:

- authentication
- account creation
- access provisioning
- workspace creation
- co-founder/member invitations
- role-based access
- project creation
- project steering
- guided startup sections
- sprint execution
- reminders and deadlines
- business metrics
- go-to-market tracking
- file management
- calendar synchronization
- dashboard aggregation

The code must be:

- modular
- scalable
- optimized
- queue-ready
- easy to test
- secure by default
- ready for future AI and analytics extensions

The architecture must ensure that all data is encapsulated by workspace and that co-founders can safely collaborate without seeing data from other workspaces.

---

## GLOBAL ARCHITECTURE

Architecture style:

- Laravel monolith with modular domain organization
- API-first backend
- service-oriented internal architecture
- queue-based async processing for integrations and heavy jobs

This backend should be structured so it can later evolve into:

- a larger SaaS application
- a mobile backend
- an AI-enabled product backend

without requiring a rewrite of the core domain model.

---

## CORE STACK

### FRAMEWORK

- **Laravel 12**

### LANGUAGE

- **PHP 8.3+**

### DATABASE

- **PostgreSQL**

### CACHE / QUEUES

- **Redis**

### AUTH

- **Laravel Sanctum** for SPA/API auth

### FILE STORAGE

- **Cloudinary**

### CALENDAR INTEGRATION

- **Google Calendar API**

### BACKGROUND PROCESSING

- Laravel Queues
- Redis queue driver
- Laravel Scheduler

### API DOCUMENTATION

- OpenAPI / Swagger generation for public internal contracts

### TESTING

- Pest or PHPUnit

Testing is mandatory, not optional.

### OBSERVABILITY

- Laravel logs
- structured logging
- exception monitoring ready
- health endpoints

---

## RECOMMENDED LARAVEL PACKAGES

### CORE

- `laravel/sanctum`
- `laravel/tinker`
- `laravel/pulse` if runtime insights are desired later

### AUTH / PERMISSIONS

- `spatie/laravel-permission`

### API / DTO / DATA LAYER

- `spatie/laravel-data`

### LOGGING / MONITORING

- `sentry/sentry-laravel` optional but recommended
- `spatie/laravel-health`

### MEDIA / FILES

- `cloudinary-labs/cloudinary-laravel`

### GOOGLE INTEGRATION

- `google/apiclient`

### DEVELOPMENT QUALITY

- `laravel/pint`
- `nunomaduro/larastan`
- `barryvdh/laravel-ide-helper` optional

### TESTING

- `pestphp/pest`
- `pestphp/pest-plugin-laravel`

Recommended complementary tools:

- factories for clean fixture generation
- database transactions or refresh database strategy in tests
- HTTP test helpers for API coverage
- queue fakes, event fakes, notification fakes, mail fakes

---

## DOMAIN MODULES

Organize the backend by domain, not by technical layer only.

Suggested domains:

- `Auth`
- `Users`
- `Workspaces`
- `WorkspaceInvitations`
- `Projects`
- `ProjectSteps`
- `ProjectCanvases`
- `Planner`
- `Sprints`
- `Records`
- `BusinessMetrics`
- `Files`
- `Integrations`
- `Dashboard`
- `Shared`

Each domain should contain clear responsibility boundaries such as:

- actions
- services
- policies
- requests
- resources
- models
- enums
- jobs

---

## DATA OWNERSHIP MODEL

Everything important must be traceable to:

- a user
- a workspace
- optionally a project

Every major business record should include:

- `id`
- `workspace_id`
- `project_id` when relevant
- `created_by`
- `updated_by` when useful
- `created_at`
- `updated_at`

This rule is critical for isolation, auditability, and future analytics.

---

## COLLABORATION & ACCESS MODEL

### WORKSPACE RULES

- A user can create multiple workspaces
- A workspace has one owner at minimum
- A workspace can have many members
- A workspace can contain many projects
- A project belongs to only one workspace

### MEMBER ROLES

Recommended roles:

- `owner`
- `admin`
- `editor`
- `viewer`

### ROLE CAPABILITIES

`owner`

- manage workspace
- invite/remove members
- manage integrations
- create/edit/delete all projects
- manage permissions

`admin`

- manage projects
- manage most workspace settings
- invite members if allowed
- manage planner, sprint, records, metrics

`editor`

- create and edit projects
- create and edit tasks, reminders, sprints, files, metrics

`viewer`

- read-only access

### INVITATION FLOW

- owner or admin invites a member by email
- system generates secure invitation token
- token is time-limited
- invited user accepts invitation after authentication or onboarding
- membership record is created
- audit log records invitation lifecycle

### ACCESS CREATION FLOW

The system must support two access entry points:

1. founder creates the first access
2. collaborator joins through invitation

Founder bootstrap flow:

- user registers with name, email, password
- backend creates user
- backend creates first workspace
- backend creates owner membership
- backend returns authenticated session and active workspace context

Collaborator join flow:

- invite token is validated
- if user does not exist, onboarding can create account inline
- if user exists, invitation attaches to existing account
- membership is activated with the invited role
- backend returns authenticated session and active workspace context

### ACCESS ENFORCEMENT

All workspace and project endpoints must enforce:

- authenticated user check
- workspace membership check
- role/permission check
- project ownership-through-workspace check

Never trust project ID alone.

Always verify:

1. the project belongs to a workspace
2. the user belongs to that workspace
3. the user role allows the action

---

## DATABASE DESIGN

Use PostgreSQL with a normalized relational model, but model the system around business aggregates instead of random feature tables.

The database must behave like the operational memory of a **small founder project-lead kit**:

- clear enough for daily execution
- structured enough for reporting
- safe enough for collaboration
- extensible enough for future analytics and AI

The right mental model is:

1. `workspace` = collaboration boundary
2. `project` = strategic execution container
3. `project module records` = notes, steps, sprints, reminders, files, conversations, metrics
4. `activity + integration tables` = operational support and auditability

---

## DATABASE MODELING PRINCIPLES

Think like a senior database engineer:

- separate identity tables from collaboration tables
- separate operational records from derived/summary records
- keep mutable workflow state explicit
- design for integrity first, convenience second
- make workspace isolation impossible to forget
- model time as first-class data
- keep analytical extensions possible without schema rewrite

Key principle:

> the schema must make the correct query easy and the incorrect cross-workspace query hard

---

## PRIMARY AGGREGATES

### 1. Identity & Access

- users
- workspaces
- workspace_members
- workspace_invitations

### 2. Project Core

- projects
- project_steps
- project_canvases
- project_focus_items
- project_decisions

### 3. Execution & Planning

- project_sprints
- project_sprint_tasks
- project_reminders
- project_calendar_items
- project_board_cards
- project_tasks

### 4. Evidence & Knowledge

- project_conversations
- project_conversation_signals
- project_files
- project_notes
- activity_logs

### 5. Business & Go-To-Market

- project_business_metrics
- project_metric_snapshots
- project_acquisition_events
- project_market_assumptions

### 6. Integrations

- integration_accounts
- google_calendar_connections
- calendar_sync_events

---

## TABLE-BY-TABLE MODEL

### `users`

Purpose:

- canonical user identity

Recommended attributes:

- `id`
- `email` unique
- `password`
- `full_name`
- `avatar_url` nullable
- `timezone`
- `locale`
- `last_seen_at` nullable
- `email_verified_at` nullable
- `created_at`
- `updated_at`

Notes:

- keep this table focused on identity
- do not overload it with workspace-specific preferences

### `workspaces`

Purpose:

- top-level collaboration and isolation boundary

Recommended attributes:

- `id`
- `name`
- `slug` unique
- `owner_user_id`
- `status` default active
- `default_timezone`
- `default_currency` nullable
- `settings_json` nullable
- `created_at`
- `updated_at`
- `deleted_at` nullable

Relations:

- belongs to one owner user
- has many members
- has many projects

### `workspace_members`

Purpose:

- membership join table between users and workspaces

Recommended attributes:

- `id`
- `workspace_id`
- `user_id`
- `role`
- `membership_status` invited | active | suspended | removed
- `joined_at` nullable
- `invited_by_user_id` nullable
- `last_accessed_at` nullable
- `created_at`
- `updated_at`

Constraints:

- unique (`workspace_id`, `user_id`)

Indexes:

- (`workspace_id`, `role`)
- (`user_id`, `membership_status`)

### `workspace_invitations`

Purpose:

- invitation lifecycle before membership exists

Recommended attributes:

- `id`
- `workspace_id`
- `email`
- `role`
- `token_hash`
- `invited_by_user_id`
- `expires_at`
- `accepted_at` nullable
- `revoked_at` nullable
- `created_at`
- `updated_at`

Constraints:

- partial uniqueness on active invitation by (`workspace_id`, `email`) where not accepted and not revoked

### `projects`

Purpose:

- central project container for founder execution

Recommended attributes:

- `id`
- `workspace_id`
- `created_by`
- `name`
- `slug`
- `description` nullable
- `stage_label`
- `status` draft | active | paused | archived
- `current_step_key` nullable
- `start_date` nullable
- `target_launch_date` nullable
- `founder_note` nullable
- `warning_state` nullable
- `priority` nullable
- `created_at`
- `updated_at`
- `deleted_at` nullable

Constraints:

- unique (`workspace_id`, `slug`)

Indexes:

- (`workspace_id`, `status`, `updated_at desc`)
- (`workspace_id`, `target_launch_date`)

### `project_steps`

Purpose:

- guided startup flow progression

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `step_key`
- `title`
- `position`
- `status` todo | active | done
- `content` text nullable
- `completed_at` nullable
- `created_by`
- `updated_by` nullable
- `created_at`
- `updated_at`

Constraints:

- unique (`project_id`, `step_key`)
- unique (`project_id`, `position`)

### `project_canvases`

Purpose:

- long-form strategic thinking blocks such as ICP, TAM, BMC, GTM

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `canvas_key`
- `title`
- `position`
- `content`
- `last_reviewed_at` nullable
- `created_by`
- `updated_by` nullable
- `created_at`
- `updated_at`

Constraints:

- unique (`project_id`, `canvas_key`)

### `project_focus_items`

Purpose:

- small actionable focus cards shown in the cockpit

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `title`
- `content`
- `position`
- `is_pinned`
- `created_by`
- `updated_by` nullable
- `created_at`
- `updated_at`

### `project_decisions`

Purpose:

- durable project decisions, not ephemeral notes

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `decision_text`
- `decision_type` optional
- `decided_at`
- `decided_by`
- `context_json` nullable
- `created_at`
- `updated_at`

Indexes:

- (`project_id`, `decided_at desc`)

### `project_sprints`

Purpose:

- bounded execution cycles

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `name`
- `goal`
- `status` planned | active | closed
- `starts_at` nullable
- `ends_at` nullable
- `review_notes` nullable
- `retrospective_notes` nullable
- `created_by`
- `updated_by` nullable
- `created_at`
- `updated_at`

Indexes:

- (`project_id`, `status`)
- (`project_id`, `starts_at desc`)

### `project_sprint_tasks`

Purpose:

- granular sprint execution items

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `sprint_id`
- `title`
- `description` nullable
- `status` todo | in_progress | done
- `position`
- `section_key` nullable
- `assigned_to_user_id` nullable
- `due_at` nullable
- `completed_at` nullable
- `created_by`
- `updated_by` nullable
- `created_at`
- `updated_at`

Indexes:

- (`sprint_id`, `status`, `position`)
- (`project_id`, `due_at`)
- (`assigned_to_user_id`, `status`)

### `project_tasks`

Purpose:

- lightweight quick tasks outside sprint scope

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `title`
- `status` open | done
- `position`
- `created_by`
- `updated_by` nullable
- `created_at`
- `updated_at`

### `project_reminders`

Purpose:

- actionable reminders with explicit due semantics

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `title`
- `status` open | done | cancelled
- `due_at`
- `remind_at` nullable
- `source_type` manual | system | calendar_sync
- `created_by`
- `completed_by` nullable
- `completed_at` nullable
- `created_at`
- `updated_at`

Indexes:

- (`project_id`, `status`, `due_at`)
- (`workspace_id`, `remind_at`)

### `project_calendar_items`

Purpose:

- internal planner calendar separate from Google raw events

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `source` manual | google
- `title`
- `item_type` focus | call | review | milestone
- `starts_at`
- `ends_at` nullable
- `external_event_id` nullable
- `created_by`
- `updated_by` nullable
- `created_at`
- `updated_at`

Indexes:

- (`project_id`, `starts_at`)
- (`external_event_id`)

### `project_board_cards`

Purpose:

- lightweight execution pipeline cards

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `title`
- `detail` nullable
- `lane` now | next | later
- `position`
- `accent`
- `created_by`
- `updated_by` nullable
- `created_at`
- `updated_at`

Constraints:

- unique (`project_id`, `lane`, `position`)

### `project_conversations`

Purpose:

- durable log of user interviews, founder calls, customer conversations

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `person_name`
- `person_role` nullable
- `company_name` nullable
- `context`
- `conversation_date` nullable
- `trust_level`
- `pain_points_text` nullable
- `signals_text` nullable
- `learned_text` nullable
- `source_channel` nullable
- `created_by`
- `updated_by` nullable
- `created_at`
- `updated_at`

Indexes:

- (`project_id`, `created_at desc`)
- (`workspace_id`, `conversation_date`)

### `project_conversation_signals`

Purpose:

- normalized extraction of recurring market signals from conversations

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `conversation_id`
- `signal_type`
- `label`
- `confidence_score` nullable
- `notes` nullable
- `created_at`
- `updated_at`

This table is optional in V1 but strongly recommended if future AI summarization is planned.

### `project_files`

Purpose:

- metadata for attachments and evidence files

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `section_key` nullable
- `conversation_id` nullable
- `uploaded_by`
- `storage_provider`
- `provider_public_id`
- `file_name`
- `mime_type`
- `resource_type`
- `file_size_bytes` nullable
- `secure_url`
- `thumbnail_url` nullable
- `created_at`
- `updated_at`
- `deleted_at` nullable

Indexes:

- (`project_id`, `section_key`)
- (`conversation_id`)
- (`provider_public_id`)

### `project_notes`

Purpose:

- free-form durable note store when content should not be collapsed into one canvas field

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `note_type`
- `title` nullable
- `content`
- `section_key` nullable
- `created_by`
- `updated_by` nullable
- `created_at`
- `updated_at`

### `project_business_metrics`

Purpose:

- current working business assumptions and KPI state

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `tam`
- `sam`
- `som`
- `market_notes` nullable
- `production_cost`
- `monthly_price`
- `runway_months` nullable
- `weekly_hours_available` nullable
- `hours_spent` nullable
- `mvp_hours_target` nullable
- `first_client_target_days` nullable
- `clients_acquired`
- `acquisition_frequency_per_month` nullable
- `primary_channel` nullable
- `calendar_connection_label` nullable
- `created_by`
- `updated_by` nullable
- `created_at`
- `updated_at`

Constraints:

- unique (`project_id`)

### `project_metric_snapshots`

Purpose:

- time-series history of key metrics

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `snapshot_date`
- `metric_key`
- `metric_value_numeric` nullable
- `metric_value_text` nullable
- `captured_by` nullable
- `created_at`

Indexes:

- (`project_id`, `metric_key`, `snapshot_date desc`)

### `project_acquisition_events`

Purpose:

- concrete GTM progress events

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `event_type` lead | intro_call | proposal | trial | won | lost
- `channel`
- `contact_name` nullable
- `occurred_at`
- `value_amount` nullable
- `notes` nullable
- `created_by`
- `created_at`
- `updated_at`

Indexes:

- (`project_id`, `event_type`, `occurred_at desc`)

### `project_market_assumptions`

Purpose:

- durable assumptions behind TAM/SAM/SOM and GTM

Recommended attributes:

- `id`
- `workspace_id`
- `project_id`
- `assumption_type`
- `label`
- `value_text`
- `source_reference` nullable
- `confidence_level` nullable
- `created_by`
- `updated_by` nullable
- `created_at`
- `updated_at`

### `integration_accounts`

Purpose:

- generic external integration registry

Recommended attributes:

- `id`
- `workspace_id`
- `user_id` nullable
- `provider`
- `connection_name` nullable
- `status`
- `access_token_encrypted` nullable
- `refresh_token_encrypted` nullable
- `token_expires_at` nullable
- `scopes_json` nullable
- `metadata_json` nullable
- `created_at`
- `updated_at`

Indexes:

- (`workspace_id`, `provider`, `status`)
- (`user_id`, `provider`)

### `google_calendar_connections`

Purpose:

- provider-specific settings for Google Calendar behavior

Recommended attributes:

- `id`
- `workspace_id`
- `integration_account_id`
- `user_id`
- `google_calendar_id`
- `sync_direction`
- `sync_token` nullable
- `last_synced_at` nullable
- `is_primary`
- `created_at`
- `updated_at`

### `calendar_sync_events`

Purpose:

- operational log for sync and troubleshooting

Recommended attributes:

- `id`
- `workspace_id`
- `project_id` nullable
- `google_calendar_connection_id`
- `sync_type`
- `sync_status`
- `started_at`
- `finished_at` nullable
- `records_processed` default 0
- `error_message` nullable
- `created_at`
- `updated_at`

### `activity_logs`

Purpose:

- audit and operational timeline

Recommended attributes:

- `id`
- `workspace_id`
- `project_id` nullable
- `actor_user_id` nullable
- `entity_type`
- `entity_id`
- `action`
- `summary`
- `metadata_json` nullable
- `occurred_at`
- `created_at`

Indexes:

- (`workspace_id`, `occurred_at desc`)
- (`project_id`, `occurred_at desc`)
- (`entity_type`, `entity_id`)

---

## RELATIONSHIP RULES

Non-negotiable integrity rules:

- `workspaces` 1---N `workspace_members`
- `workspaces` 1---N `projects`
- `projects` 1---N `project_steps`
- `projects` 1---N `project_canvases`
- `projects` 1---N `project_sprints`
- `project_sprints` 1---N `project_sprint_tasks`
- `projects` 1---N `project_reminders`
- `projects` 1---N `project_calendar_items`
- `projects` 1---N `project_conversations`
- `project_conversations` 1---N `project_conversation_signals`
- `projects` 1---N `project_files`
- `projects` 1---1 `project_business_metrics`
- `projects` 1---N `project_metric_snapshots`
- `projects` 1---N `project_acquisition_events`

Design choice:

- repeat `workspace_id` on child tables even when `project_id` already exists
- this is intentional
- it improves authorization scoping, query performance, partitioning options, and auditing

---

## NULLABILITY & DELETION STRATEGY

Use nullability intentionally:

- nullable only when the lifecycle truly requires optionality
- do not make foreign keys nullable without a business reason

Deletion strategy:

- soft delete `workspaces`, `projects`, and `project_files`
- hard delete short-lived technical artifacts only when safe
- avoid cascading hard deletes across strategic business data
- prefer archived states for business continuity

---

## CONSTRAINTS & INTEGRITY RULES

- foreign keys on every ownership relation
- check constraints for enum-like states when useful
- uniqueness on workspace-scoped slugs and keys
- prevent duplicate active memberships
- prevent duplicate active invitations
- only one current business metrics row per project
- enforce one logical step/canvas per project key

Example design rule:

> if a project has two rows for the same `step_key`, the schema is wrong

---

## INDEX STRATEGY

Indexes should match the real query paths of a founder cockpit.

Most common query paths:

- list my workspaces
- list active projects in a workspace
- open one project dashboard
- fetch sprint board for one project
- fetch reminders due soon for one workspace
- fetch recent conversations for one project
- fetch files by project/section
- fetch metric history for one project

Required index families:

- ownership indexes: `workspace_id`, `project_id`, `user_id`
- workflow indexes: `status`, `lane`, `position`, `due_at`, `starts_at`
- timeline indexes: `created_at`, `updated_at`, `occurred_at`
- uniqueness indexes for business keys

Prefer composite indexes such as:

- (`workspace_id`, `status`, `updated_at desc`)
- (`project_id`, `status`, `position`)
- (`project_id`, `due_at`, `status`)
- (`project_id`, `created_at desc`)

---

## SUMMARY TABLES VS SOURCE TABLES

Do not overload transactional tables with expensive aggregate responsibilities.

Use:

- source tables for operational truth
- optional summary/materialized layers for dashboard speed

Good examples:

- `project_business_metrics` = current authoritative business state
- `project_metric_snapshots` = historical time-series
- Redis cache or derived summary service = dashboard read acceleration

This keeps the model clean and analytically extensible.

### KEY DATABASE RULES

- use UUIDs or ULIDs for public-facing IDs
- add explicit foreign keys
- add workspace scoping everywhere
- avoid hidden cross-workspace joins
- design queries so workspace scoping is always explicit
- choose names that reflect business meaning, not UI widgets only
- keep source-of-truth tables separate from derived read models

---

## API DESIGN

Use Laravel API Resources and Form Requests.

The API should be:

- RESTful
- versionable
- predictable
- easy for the Next.js frontend to consume

### FIRST API ENDPOINTS

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/user`
- `POST /api/auth/password/forgot`
- `POST /api/auth/password/reset`
- `POST /api/auth/email/verify`

- `GET /api/workspaces`
- `POST /api/workspaces`
- `GET /api/workspaces/{workspace}`
- `PATCH /api/workspaces/{workspace}`
- `GET /api/workspaces/{workspace}/members`
- `POST /api/workspaces/{workspace}/members`
- `PATCH /api/workspaces/{workspace}/members/{member}`
- `DELETE /api/workspaces/{workspace}/members/{member}`
- `POST /api/workspaces/{workspace}/invitations`
- `POST /api/workspaces/invitations/accept`

- `GET /api/workspaces/{workspace}/projects`
- `POST /api/workspaces/{workspace}/projects`
- `GET /api/workspaces/{workspace}/projects/{project}`
- `PATCH /api/workspaces/{workspace}/projects/{project}`

- `PATCH /api/workspaces/{workspace}/projects/{project}/steps/{step}`
- `PATCH /api/workspaces/{workspace}/projects/{project}/canvases/{canvas}`

- `GET /api/workspaces/{workspace}/projects/{project}/dashboard`
- `PATCH /api/workspaces/{workspace}/projects/{project}/business-metrics`

- `POST /api/workspaces/{workspace}/projects/{project}/reminders`
- `POST /api/workspaces/{workspace}/projects/{project}/calendar-items`
- `POST /api/workspaces/{workspace}/projects/{project}/sprint-tasks`
- `PATCH /api/workspaces/{workspace}/projects/{project}/sprint-tasks/{task}`

- `POST /api/integrations/google-calendar/connect`
- `POST /api/integrations/google-calendar/sync`
- `POST /api/files/cloudinary/signature`

---

## AUTHENTICATION STRATEGY

Use Laravel Sanctum.

Requirements:

- SPA authentication support
- secure session or token-based auth depending on frontend deployment mode
- registration flow for the first workspace owner
- password reset support
- email verification support if collaboration becomes broader
- invitation acceptance tied safely to authenticated identity
- support onboarding from invitation token
- support returning the active workspace context after login

For collaborative workspaces:

- authentication identifies the user
- workspace membership authorizes the scope

The frontend access system must support:

- sign in
- create access
- accept invitation

The backend must explicitly support these three frontend entry points.

---

## AUTHORIZATION STRATEGY

Use:

- Laravel Policies
- Gates when helpful
- role/permission mapping via `spatie/laravel-permission`

Policies should protect:

- workspace actions
- membership actions
- invitation actions
- project actions
- reminder actions
- sprint actions
- file actions
- integration actions

Do not place authorization logic only in controllers.

Keep it centralized and testable.

---

## SERVICE LAYER RULES

Controllers must stay thin.

Business logic should live in:

- actions
- services
- domain handlers

Examples:

- `CreateWorkspaceAction`
- `InviteWorkspaceMemberAction`
- `CreateProjectAction`
- `SyncGoogleCalendarAction`
- `UpdateProjectMetricsAction`

This makes the code easier to:

- test
- reuse
- optimize
- queue

Scalability rule:

- no business-critical logic should live only in controllers, form requests, or UI-specific transformers
- core business rules must be callable from HTTP, jobs, console commands, and tests

---

## FILE STORAGE STRATEGY

Use Cloudinary for assets and documents.

Rules:

- store files in Cloudinary, not in the database
- store only metadata in PostgreSQL
- persist:
  - `workspace_id`
  - `project_id`
  - `public_id`
  - `secure_url`
  - `resource_type`
  - `mime_type`
  - `uploaded_by`

Capabilities:

- signed uploads
- project file attachment
- preview and transformation support
- deletion lifecycle
- future support for attachment ownership and audit history

---

## GOOGLE CALENDAR INTEGRATION

The planner must be connectable to Google Calendar.

Requirements:

- OAuth connection flow
- store encrypted tokens
- per-user calendar connection
- optional workspace-aware syncing rules
- import upcoming events into planner context
- push reminders or milestones when desired
- background sync jobs
- incremental sync using stored sync tokens if supported
- timezone-safe event mapping

This integration must not block normal request execution.

Use queues for sync jobs.

---

## QUEUES, JOBS, AND SCHEDULING

Use Redis-backed Laravel queues.

Queue candidates:

- invitation emails
- Google Calendar sync
- reminder processing
- dashboard aggregate refresh
- file post-processing
- notification fan-out

Use the Laravel scheduler for:

- periodic calendar sync
- stale invitation cleanup
- delayed reminder jobs
- health checks

---

## DASHBOARD & KPI AGGREGATION

The frontend cockpit needs fast dashboard reads.

Backend responsibilities:

- compute workspace-aware dashboard summaries
- compute project KPI summaries
- aggregate sprint state, reminders, and business metrics
- expose compact read-optimized endpoints

Possible optimization:

- precompute heavy aggregates
- cache summaries in Redis
- invalidate cache on write events

---

## PERFORMANCE STRATEGY

- avoid fat controllers
- avoid N+1 queries
- eager load carefully
- index foreign keys and sort fields
- cache high-read dashboard summaries
- use queues for heavy external integrations
- keep API payloads compact
- paginate list endpoints
- never scan across workspaces without explicit need

## SCALABILITY LOGIC RULES

The backend logic must scale in both code organization and runtime behavior.

Code scalability:

- use domain actions/services for business logic
- keep each module independently testable
- isolate external providers behind contracts or adapters
- avoid tightly coupling business flows to Google Calendar, Cloudinary, or a specific controller shape
- keep write logic and read logic separable when complexity grows
- prefer explicit DTO/data objects over loose arrays for business flows

Runtime scalability:

- queue all slow external operations
- keep request-time database work bounded and indexed
- use idempotent jobs for sync and retry safety
- design endpoints so they can support pagination from day one
- allow summary endpoints to evolve toward cached/materialized responses

Future-proofing rule:

- the code should be easy to split later into modules, packages, or services without changing the core relational model

---

## SECURITY RULES

- validate every request with Form Requests
- authorize every sensitive action with Policies
- encrypt integration tokens
- hash passwords with Laravel defaults
- use signed invitation tokens
- rate limit auth and invitation endpoints
- never expose data across workspaces
- log critical security-sensitive actions

Critical audit events:

- workspace created
- member invited
- invitation accepted
- member removed
- integration connected/disconnected
- project created/deleted

---

## FOLDER STRUCTURE GUIDANCE

The backend structure should feel deliberate and scalable.

Example direction:

```txt
app/
  Actions/
  Domain/
    Auth/
    Users/
    Workspaces/
    Projects/
    Planner/
    Sprints/
    Records/
    BusinessMetrics/
    Integrations/
    Files/
  Http/
    Controllers/
    Requests/
    Resources/
  Jobs/
  Policies/
  Providers/

database/
  migrations/
  factories/
  seeders/

routes/
  api.php
```

Important:

- organize by domain where possible
- keep shared infrastructure reusable
- avoid one giant "Service" folder with no boundaries

---

## TESTING REQUIREMENTS

Test the backend as if collaboration bugs are expensive.

Must test:

- unit tests for actions and services
- feature tests for API endpoints
- auth flows
- workspace creation
- invitation acceptance
- role-based permissions
- workspace isolation
- project creation inside workspace
- forbidden cross-workspace access
- dashboard aggregation endpoints
- Google Calendar integration boundaries
- Cloudinary upload metadata lifecycle

Priority test rule:

> if a user from workspace A can access workspace B data, the backend is failing its core mission

### UNIT TEST SYSTEM

The project must include a serious unit testing strategy.

Unit tests should target:

- workspace creation logic
- invitation lifecycle logic
- membership role transitions
- project creation logic
- project metrics update logic
- dashboard aggregation services
- Google Calendar sync mappers
- Cloudinary metadata handlers
- authorization-related domain decisions where possible

Use unit tests for:

- pure business rules
- transformation logic
- aggregate update logic
- invariant enforcement

Use feature tests for:

- HTTP contracts
- auth/session behavior
- policy enforcement
- end-to-end workspace isolation

Testing structure expectation:

- `tests/Unit` for actions, services, value objects, policies where appropriate
- `tests/Feature` for API, auth, workspace flows, invitations, project flows

Minimum quality expectation:

- every critical business action should have at least one happy-path unit test
- every permission-sensitive endpoint should have both authorized and forbidden feature tests
- every workspace-scoped resource should have at least one cross-workspace denial test

---

## ENGINEERING MINDSET

You are not building:

- a quick CRUD admin
- a toy API
- a backend that only works for one solo user forever

You are building:

- a collaborative founder operating backend
- a scalable Laravel architecture
- a secure workspace-encapsulated system

Every design decision must favor:

- clarity
- maintainability
- isolation
- extensibility
- performance

---

## DEFINITION OF DONE

The backend is considered well-started when:

- Laravel 12 project is initialized cleanly
- PostgreSQL is connected
- Redis queue is configured
- Sanctum auth works
- workspace system is implemented
- invitations and membership roles work
- project CRUD is scoped by workspace
- dashboard summary endpoint exists
- Google Calendar integration scaffold exists
- Cloudinary integration scaffold exists
- Policies enforce workspace isolation
- unit tests cover core business actions
- feature tests cover access, auth, workspace, and project isolation
- tests prove cross-workspace isolation
- code quality tools are configured
- the structure is ready for Next.js frontend integration

---

## FINAL GOAL

The backend should feel like:

> a production-ready Laravel foundation for a founder cockpit with clean collaboration boundaries

The system must be ready for:

- solo founder mode
- co-founder collaboration mode
- future analytics
- future AI features
- future SaaS expansion
