# ⚙️ TECHNICAL SPECIFICATION FILE — STACK & ARCHITECTURE (V1)

---

## 🎯 OBJECTIVE

Define a **modern, scalable, high-performance architecture** for a personal web application:

👉 Fast
👉 Modular
👉 Evolutive
👉 Developer-friendly

This system must support future expansion (AI, analytics, mobile) without refactoring the core.

---

## 🧱 GLOBAL ARCHITECTURE

Architecture style:

* Frontend + Backend-as-a-Service (BaaS)
* Component-driven UI
* Modular domain structure

---

## ⚙️ CORE STACK

### FRONTEND

* Framework: **Next.js (App Router)**
* Language: **TypeScript**
* Styling: **Tailwind CSS**
* State Management: **Zustand**
* Animations: **Framer Motion (optional, lightweight)**

---

### BACKEND

* **Supabase**

  * PostgreSQL database
  * Authentication (email-based)
  * Row Level Security (RLS)
  * Realtime (optional later)

---

### STORAGE

* **Cloudinary**

  * File uploads (images, PDFs, docs)
  * Store only URLs in database
  * Use optimized delivery (auto format, compression)

---

### DATA FETCHING

* Use **React Server Components (RSC)** when possible
* Use **Server Actions** for mutations
* Avoid unnecessary client-side fetching

---

## 📁 FOLDER STRUCTURE (STRICT)

```
/app
  /(auth)
  /(dashboard)
    /projects
      /[projectId]
        /sections
        /sprints

/components
  /ui
  /layout
  /features
    /projects
    /sections
    /sprints
    /conversations

/lib
  /supabase
  /cloudinary
  /utils

/store
  (zustand stores)

/types
  (global types)

/hooks
  (custom hooks)
```

---

## 🧠 DOMAIN-DRIVEN STRUCTURE

Organize by **feature/domain**, NOT by type.

Example:

* sections/
* sprints/
* conversations/
* insights/
* files/

Each domain contains:

* components
* hooks
* services
* types

---

## 🗄 DATABASE DESIGN (SUPABASE)

Use PostgreSQL.

Core tables:

* projects
* sections
* sprints
* tasks
* conversations
* insights
* files
* metrics

---

### KEY RULES

* Use UUIDs as primary keys
* Add `created_at` and `updated_at` everywhere
* Use foreign keys for relationships
* Normalize but avoid over-complex joins

---

### SECURITY

* Enable **Row Level Security (RLS)**
* User can only access their own data

---

## 🔐 AUTHENTICATION

* Supabase Auth
* Email + password (V1)
* Session handled via Supabase client

---

## ☁️ CLOUDINARY INTEGRATION

* Upload via signed upload or direct upload widget

* Store:

  * URL
  * public_id
  * type (image, pdf, doc)

* Do NOT store files in Supabase

---

## ⚡ STATE MANAGEMENT (ZUSTAND)

Use Zustand ONLY for:

* UI state (modals, selections)
* Temporary states

DO NOT use it for server data.

---

## 🔄 DATA FLOW

### READ:

* Server Components → fetch directly from Supabase

### WRITE:

* Server Actions

### UI Updates:

* Optimistic updates when possible

---

## ⚡ PERFORMANCE STRATEGY

* Use Server Components by default
* Minimize client components
* Lazy load heavy components
* Avoid unnecessary re-renders

---

## 🎨 UI SYSTEM

### Tailwind Rules:

* Use design tokens (spacing, colors)
* Avoid inline styles
* Keep consistency

---

### COMPONENT RULES

Each component must be:

* Small
* Reusable
* Focused

---

## 🧩 REUSABLE COMPONENTS

Create base components:

* Button
* Card
* Modal
* Input
* Textarea
* Dropdown

---

## 🧠 CUSTOM HOOKS

Examples:

* useProject()
* useSections()
* useSprints()
* useConversations()

---

## ⚡ ERROR HANDLING

* Centralized error handling
* Show user-friendly messages
* Log errors in console (V1)

---

## 🧪 TESTING (OPTIONAL V1)

Prepare structure for:

* Unit tests (Vitest)
* Component tests

---

## 🚀 DEPLOYMENT

* Platform: **Vercel**
* Env variables:

  * Supabase URL
  * Supabase anon key
  * Cloudinary keys

---

## 📈 SCALABILITY PREPARATION

The system must be ready for:

* AI integration (OpenAI, etc.)
* Analytics dashboards
* Mobile app (React Native or Expo)

---

## ❌ ANTI-PATTERNS TO AVOID

* Large monolithic components
* Excessive global state
* Client-side heavy logic
* Tight coupling between modules

---

## 🧠 ENGINEERING MINDSET

You are NOT building:

* A quick prototype

You ARE building:

👉 A **clean, extensible system**

Every decision must favor:

* Simplicity
* Scalability
* Maintainability

---

## 🔥 FINAL GOAL

The codebase should feel like:

👉 A **production-ready SaaS architecture**, even if used by one person.
