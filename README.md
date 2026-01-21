 # TaskFlow API

TaskFlow is a robust backend API for a project management system inspired by Jira.  
Built with  **TypeScript**, **NestJS**, and **PostgreSQL**, it provides essential features for **issue tracking**, **agile sprint planning**, and **team collaboration**.

---

## Features

- User registration, login, and profile management
- JWT authentication
- Workspace management
  - Create workspaces
  - Invite members
  - Role-based access (Guest, Member, Admin)
- Project management
  - Create projects within workspaces
  - Assign issues to projects
- Issue tracking
  - Create, update, and delete issues
  - Assign users and set priorities
  - Sprint planning
- Comments
  - Add, update, delete comments on issues
  - Role-based access control for comments

---

## Tech Stack

- **Backend:** Node.js, NestJS, TypeScript  
- **Database:** PostgreSQL with Prisma ORM  
- **Authentication:** JWT via Passport.js  
- **Validation:** class-validator  
- **API Docs:** Swagger

---

## API Structure

- **Auth**
  - `POST /auth/register` – Register a new user
  - `POST /auth/login` – Login
  - `GET /auth/me` – Get current user profile
  - `PATCH /auth/profile` – Update profile
  - `POST /auth/forgot-password` – Request password reset
  - `POST /auth/reset-password` – Reset password

- **Workspaces**
  - `POST /workspaces` – Create workspace
  - `GET /workspaces` – List workspaces
  - `GET /workspaces/:id/members` – List workspace members
  - `POST /workspaces/:id/members/invite` – Invite a member
  - `PATCH /workspaces/:id/members/:userId/role` – Update member role

- **Projects & Issues**
  - `GET /api/projects/:projectId/issues` – List issues
  - `POST /api/issues?projectId=<uuid>` – Create issue
  - `PATCH /api/issues/:issueId` – Update issue
  - `DELETE /api/issues/:issueId` – Delete issue

- **Sprints**
  - `POST /sprints` – Create sprint
  - `PATCH /sprints/:sprintId` – Update sprint (start/complete)

- **Comments**
  - `GET /comments/issue/:issueId` – List comments for issue
  - `POST /comments` – Create comment
  - `PATCH /comments/:commentId` – Update comment
  - `DELETE /comments/:commentId` – Delete comment

---

## Role-Based Access

- **Guest** – Can view issues/comments if added to workspace  
- **Member** – Can create/update issues and comments  
- **Admin** – Full control including inviting members, updating roles, deleting issues/comments

---

## Installation

```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Start the server
npm run start:dev
## API Documentation

Swagger UI is available at:

[http://localhost:3000/api]
