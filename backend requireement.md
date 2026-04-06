# Backend Requireement

## Prompt backend

Build a production-ready backend for Teranga Cockpit that replaces local demo storage with a scalable API and async processing layer. The backend must support project steering, KPI tracking, deadlines, reminders, sprint management, go-to-market metrics, viability metrics, Google Calendar synchronization, Cloudinary file storage, and secure authentication. The codebase must be modular, observable, optimized, and easy to extend into a multi-tenant SaaS product.

## Recommended techno stack

- Runtime: Node.js 22 LTS
- Language: TypeScript
- Framework: NestJS
- API style: REST first, with clean service boundaries and DTO validation
- Database: PostgreSQL
- ORM: Prisma
- Cache and queue: Redis + BullMQ
- Auth: JWT access/refresh tokens with Passport
- File storage: Cloudinary
- Calendar integration: Google Calendar API
- Background jobs: BullMQ workers for sync, reminders, file post-processing, and notification delivery
- Docs: Swagger / OpenAPI
- Validation: `class-validator` and `class-transformer`
- Testing: Vitest or Jest + Supertest
- Observability: Pino logging, health checks, metrics hooks, and error tracking
- Deployment target: Docker containers behind a reverse proxy, ready for horizontal scaling

## Core backend modules

- `auth`: signup, login, refresh, logout, password reset, session management
- `users`: profile, preferences, timezone, integration settings
- `projects`: project CRUD, stage, founder note, active step, warning state
- `steps`: guided product steps and progress tracking
- `strategy`: canvases such as ICP, TAM, BMC, go-to-market
- `planner`: reminders, deadlines, calendar slots, time capacity
- `sprints`: sprint setup, tasks, board transitions, retrospectives
- `records`: conversations, notifications, attachments, activity history
- `business-metrics`: market size, production cost, pricing, runway, acquisition cadence, time-to-first-client
- `integrations/google-calendar`: OAuth, push/pull sync, event mapping
- `integrations/cloudinary`: uploads, signed URLs, metadata persistence
- `jobs`: async queue workers
- `health`: readiness and liveness endpoints

## Main packages

### App and API

- `@nestjs/common`
- `@nestjs/core`
- `@nestjs/config`
- `@nestjs/platform-express`
- `@nestjs/swagger`
- `reflect-metadata`
- `rxjs`

### Database

- `prisma`
- `@prisma/client`

### Auth and security

- `@nestjs/jwt`
- `@nestjs/passport`
- `passport`
- `passport-jwt`
- `passport-google-oauth20`
- `bcrypt` or `argon2`
- `helmet`
- `cookie-parser`

### Validation and transformation

- `class-validator`
- `class-transformer`
- `zod` if schema contracts are also needed outside DTOs

### Queue, cache, and jobs

- `bullmq`
- `ioredis`

### Integrations

- `googleapis`
- `cloudinary`
- `multer`

### Logging and observability

- `nestjs-pino`
- `pino`
- `@nestjs/terminus`
- `prom-client`

### Testing

- `vitest` or `jest`
- `supertest`

## Database design guidance

Use PostgreSQL with normalized domain tables and clear ownership:

- `users`
- `projects`
- `project_steps`
- `project_canvases`
- `project_focus_items`
- `project_tasks`
- `project_reminders`
- `project_calendar_items`
- `project_board_cards`
- `project_notifications`
- `project_conversations`
- `project_files`
- `project_sprints`
- `project_sprint_tasks`
- `project_business_metrics`
- `integration_accounts`
- `calendar_sync_events`
- `activity_logs`

Every business record should include:

- `id`
- `project_id`
- `created_at`
- `updated_at`
- `created_by`
- `version` for optimistic concurrency where useful

## Scalability rules

- Keep controllers thin and move logic into services
- Separate synchronous request flow from async jobs
- Use Redis-backed queues for calendar sync, reminders, file processing, and notifications
- Add pagination, filtering, and cursor strategies from the start
- Store integration tokens encrypted at rest
- Design project-level authorization guards so multi-user collaboration can be added safely
- Make Cloudinary and Google Calendar adapters isolated behind provider interfaces
- Keep DTOs and domain models separate from persistence models
- Add idempotency for webhook and sync handlers

## Performance and optimization rules

- Use selective Prisma queries, not broad `include` trees everywhere
- Add indexes on `project_id`, `user_id`, `status`, `due_date`, `updated_at`
- Cache low-volatility computed dashboard summaries in Redis
- Precompute heavy KPI aggregates in background jobs when needed
- Avoid blocking uploads in request threads; hand off transformations to jobs
- Use signed Cloudinary uploads when possible for client-side direct upload flows
- Debounce calendar sync and only fetch incremental changes

## Google Calendar integration requirements

- OAuth connect/disconnect flow
- Sync selected calendars per user or project
- Pull upcoming events into project planner capacity
- Push internal reminders or milestones as optional calendar events
- Support timezone-safe scheduling
- Persist sync cursor or token for incremental updates
- Queue sync jobs instead of syncing inline in the request lifecycle

## Cloudinary integration requirements

- Upload project documents and images
- Store public ID, URL, type, and relation to project records
- Signed upload endpoints for frontend
- Deletion and replacement lifecycle support
- Optional transformations for previews and thumbnails

## API endpoints to expose first

- `POST /auth/login`
- `POST /auth/refresh`
- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `PATCH /projects/:id/steps/:stepId`
- `PATCH /projects/:id/canvases/:canvasId`
- `POST /projects/:id/reminders`
- `POST /projects/:id/calendar-items`
- `POST /projects/:id/sprint-tasks`
- `PATCH /projects/:id/sprint-tasks/:taskId`
- `GET /projects/:id/dashboard`
- `PATCH /projects/:id/business-metrics`
- `POST /integrations/google-calendar/connect`
- `POST /integrations/google-calendar/sync`
- `POST /integrations/cloudinary/sign-upload`

## Definition of done

- Backend starts with Docker Compose locally
- Swagger docs available
- Prisma migrations committed
- Auth, projects, planner, sprint, metrics, Google Calendar, and Cloudinary modules scaffolded
- Unit tests and integration smoke tests added
- Structured logs enabled
- Health endpoints exposed
- Ready for frontend integration with stable DTO contracts
