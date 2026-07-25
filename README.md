# FlyRank AI Internship Assignment 1

## Overview

This project is a RESTful Task Management API built with **Node.js**, **Express.js**, and **SQLite**.

The API allows users to create, read, update, and delete tasks (CRUD). The project demonstrates how a REST API can use a database for persistent storage while keeping the same API endpoints.

---

## Features

- Create tasks
- View all tasks
- View a single task
- Update tasks
- Delete tasks
- SQLite database for persistent storage
- Swagger API documentation

---

## Technologies Used

- Node.js
- Express.js
- SQLite
- sqlite3
- Swagger UI

---

## Why SQLite?

SQLite was chosen because:

- it is lightweight
- it requires no database server
- it stores all data inside a single file
- it is simple to set up
- it is perfect for learning backend development

Unlike the previous assignment where tasks were stored in memory, SQLite keeps the data even after restarting the server.

---

## Project Structure

```
FlyRankAI-Assignment-1
│
├── server.js
├── package.json
├── package-lock.json
├── openapi.yaml
├── README.md
├── tasks.db
└── node_modules/
```

---

## Database

The application automatically creates:

```
tasks.db
```

inside the project folder.

If the database or the tasks table does not exist, the application creates them automatically when the server starts.

---

## Installation

Clone the repository

```bash
git clone <your-repository-url>
```

Install dependencies

```bash
npm install
```

---

## Running the Project

Start the server

```bash
node server.js
```

The server runs on

```
http://localhost:3000
```

---

## API Documentation

Swagger UI

```
http://localhost:3000/docs
```

---

## Example SQL Queries

List every task

```sql
SELECT * FROM tasks;
```

Show completed tasks

```sql
SELECT * FROM tasks WHERE done = 1;
```

Count tasks

```sql
SELECT COUNT(*) FROM tasks;
```

Update every task

```sql
UPDATE tasks
SET done = 1;
```

Delete completed tasks

```sql
DELETE FROM tasks
WHERE done = 1;
```

---

## Screenshot

Insert a screenshot of DB Browser for SQLite showing the **tasks** table here.

Example:

```
docs/database.png
```

---

## API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /tasks | Get all tasks |
| GET | /tasks/:id | Get one task |
| POST | /tasks | Create a task |
| PUT | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |

---

## Author

Created as part of the **FlyRank AI Backend Engineering Internship**.