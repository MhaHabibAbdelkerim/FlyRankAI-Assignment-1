# Task API

A simple CRUD API built with Node.js and Express for managing tasks.

This project was created as part of the FlyRank AI Internship Week 2 Assignment.

---

## Technologies Used

- Node.js
- Express.js
- Swagger UI
- OpenAPI

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/FlyRankAI-Assignment-1.git
```

Install dependencies:

```bash
npm install
```

Run the server:

```bash
node server.js
```

The API will be available at:

```
http://localhost:3000
```

Swagger UI:

```
http://localhost:3000/docs
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | API information |
| GET | /health | Health check |
| GET | /tasks | Get all tasks |
| GET | /tasks/:id | Get one task |
| POST | /tasks | Create a task |
| PUT | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |

---

## Example Request

```bash
curl http://localhost:3000/tasks
```

Example Response

```json
[
  {
    "id":1,
    "title":"Learn Express",
    "done":true
  }
]
```

---

## Swagger UI

Open:

```
http://localhost:3000/docs
```

to interact with the API using Swagger UI.

---

## Author

Abdelkerim Mahamat Habib

## Swagger Screenshot

![Swagger UI](swagger.png)