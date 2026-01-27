# TaskFlow – Full Stack Project Management System

TaskFlow is a **full‑stack project management application** inspired by Jira.
It includes a powerful **backend API** and a modern **frontend web application** for managing workspaces, projects, sprints, issues, and team collaboration.

Built with **NestJS**, **TypeScript**, **PostgreSQL**, and a **modern React-based frontend**, TaskFlow supports agile workflows, role‑based access, and real‑time‑ready architecture.

---

## ✨ Features

### 🔐 Authentication & Users

* User registration and login
* JWT-based authentication
* Profile management
* Secure password reset flow

### 🏢 Workspace Management

* Create multiple workspaces
* Invite team members
* Role-based access control

  * Guest
  * Member
  * Admin

### 📁 Project & Issue Management

* Create projects within workspaces
* Create, update, and delete issues
* Assign issues to users
* Set priorities and statuses
* Agile sprint planning

### 🏃 Sprint Management

* Create sprints
* Start and complete sprints
* Assign issues to sprints

### 💬 Comments & Collaboration

* Add comments to issues
* Update and delete comments
* Permission-based access for comments

### 🌐 Frontend (Integrated)

* Modern responsive UI
* Workspace and project dashboards
* Issue boards (Kanban-style)
* Sprint views
* Secure authentication flow
* API-driven state management

---

## 🛠 Tech Stack

### Backend

* **Node.js**
* **NestJS**
* **TypeScript**
* **PostgreSQL**
* **Prisma ORM**
* **JWT + Passport.js**
* **Swagger API Docs**

### Frontend

* **Next JS**  
* **TypeScript**
* **API integration with Axios **
* **Responsive UI design**

---

## 📦 Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   ├── prisma/
│   └── package.json
│
├── taskify-frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints Overview

### Auth

* `POST /auth/register` – Register user
* `POST /auth/login` – Login
* `GET /auth/me` – Current user
* `PATCH /auth/profile` – Update profile
* `POST /auth/forgot-password` – Request reset
* `POST /auth/reset-password` – Reset password

### Workspaces

* `POST /workspaces` – Create workspace
* `GET /workspaces` – List workspaces
* `GET /workspaces/:id/members` – Members
* `POST /workspaces/:id/members/invite` – Invite member
* `PATCH /workspaces/:id/members/:userId/role` – Update role

### Projects & Issues

* `GET /projects/:projectId/issues` – List issues
* `POST /issues?projectId=<uuid>` – Create issue
* `PATCH /issues/:issueId` – Update issue
* `DELETE /issues/:issueId` – Delete issue

### Sprints

* `POST /sprints` – Create sprint
* `PATCH /sprints/:sprintId` – Start / complete sprint

### Comments

* `GET /comments/issue/:issueId` – List comments
* `POST /comments` – Add comment
* `PATCH /comments/:commentId` – Update comment
* `DELETE /comments/:commentId` – Delete comment

---

## 🧑‍🤝‍🧑 Role-Based Access Control

* **Guest** – View issues and comments
* **Member** – Create/update issues and comments
* **Admin** – Full control (roles, invites, deletion)

---

## 🚀 Installation & Setup

### Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on its own development server and communicate with the backend API.

---

## 📘 API Documentation

Swagger UI is available at:

```
http://localhost:3000/api
```

---

 d
 
