# TeamFlow Product Blueprint v1.0

## Purpose

TeamFlow is **not** a startup project. It is a professional engineering
project built to master frontend engineering through a real SaaS
product.

Primary Goal: - Become an independent Frontend Engineer. - Learn how
software is planned, designed, architected, implemented, reviewed, and
deployed. - Learn React/Next.js through solving product problems rather
than isolated tutorials.

------------------------------------------------------------------------

# Product Vision

TeamFlow is a modern Project Management SaaS for small software teams
(2--20 members).

It helps teams: - Organize projects - Manage tasks - Collaborate - Track
progress

------------------------------------------------------------------------

# Target Users

-   Small software teams
-   Startups
-   Digital agencies

------------------------------------------------------------------------

# Product Scope (Version 1)

## Authentication

-   Login
-   Register
-   Forgot Password
-   Logout

## Workspace

-   One workspace per user
-   Create workspace
-   Manage workspace

## Projects

-   Create/Edit/Delete Project
-   Project cards
-   Search projects
-   Status filter
-   Empty state

## Tasks

-   Create/Edit/Delete Task
-   Assign task
-   Task status (Todo, In Progress, Done)
-   Due date
-   Priority

## Collaboration

-   Task comments
-   Activity history

## Dashboard

-   My Tasks (highest priority)
-   Overdue Tasks
-   Recent Activity
-   Active Projects
-   Upcoming Deadlines

## Profile

-   Update profile
-   Change password

## Settings

-   Workspace settings
-   Member management

------------------------------------------------------------------------

# Out of Scope (Later Versions)

-   Multiple workspaces
-   Notifications
-   @Mentions
-   Calendar
-   Chat
-   AI assistant
-   Billing
-   Time tracking
-   File attachments
-   Delete account

------------------------------------------------------------------------

# Navigation

Public - Login - Register - Forgot Password

Protected - Dashboard - Projects - My Tasks - Team - Profile - Settings

Project Details - Overview (default) - Board - Members - Activity

Task Details - Modal

Create Task - Modal

------------------------------------------------------------------------

# UX Principles

-   Clean
-   Minimal
-   Professional
-   Fast
-   Calm

Reference products: - ClickUp - Linear - Notion - GitHub

The UX should feel closest to ClickUp/Linear while remaining simple.

Dashboard answers one question:

> What should I work on today?

Projects page: - Create Project button - Search - Filter - Project
cards - Empty state

Project Overview: - Progress - Members - Recent Activity - Upcoming
Tasks - Quick actions

Board: - Kanban style

------------------------------------------------------------------------

# Design System

Font: - Inter

Colors: - Primary: Blue - Success: Green - Warning: Orange - Error:
Red - Background: Light Gray - Surface: White - Text: Dark Gray

Spacing: - 8px system

Support: - Light Mode - Dark Mode

Components: - Buttons - Inputs - Cards - Badges - Modals - Tables (only
where needed)

------------------------------------------------------------------------

# Non-Functional Requirements

-   Responsive (Desktop, Tablet, Mobile)
-   Accessible
-   Fast
-   Secure
-   Maintainable
-   Scalable
-   Readable code
-   Consistent UI

------------------------------------------------------------------------

# Domain Model

Workspace - has many Projects - has many Members

Project - has many Tasks - has many Members

Task - belongs to Project - belongs to User - has many Comments

Comment - belongs to Task - belongs to User

Activity - records important actions

------------------------------------------------------------------------

# Tech Stack

Frontend - Next.js (App Router) - React - TypeScript - Tailwind CSS -
shadcn/ui

Backend - Supabase

Deployment - Vercel

Version Control - Git - GitHub

------------------------------------------------------------------------

# Folder Architecture

``` text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── projects/
│   ├── tasks/
│   ├── team/
│   └── settings/
├── lib/
├── types/
└── constants/
```

------------------------------------------------------------------------

# Development Order

1.  Product Discovery
2.  PRD
3.  User Stories
4.  Information Architecture
5.  UX Flow
6.  Design System
7.  Technical Architecture
8.  Next.js Setup
9.  App Skeleton
10. Authentication UI
11. Dashboard UI
12. Projects
13. Tasks
14. Integration
15. Testing
16. Deployment

------------------------------------------------------------------------

# Engineering Rules

-   One project only.
-   No tutorial copying.
-   No unnecessary libraries.
-   Build features with purpose.
-   Prefer readability over clever code.
-   Every feature must answer:
    1.  Who is it for?
    2.  What problem does it solve?
    3.  Why does it belong here?

------------------------------------------------------------------------

# Success Criteria

By project completion you should be able to:

-   Explain architecture.
-   Explain routing.
-   Explain state decisions.
-   Explain component boundaries.
-   Build features independently.
-   Review your own code.
-   Think like a Product Manager, UX Designer, Tech Lead, and Frontend
    Engineer.