const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDocument = YAML.load("./openapi.yaml");

require("dotenv").config();
const pool = require("./db/postgres");

const app = express();
app.use(express.json());

const db = new sqlite3.Database("./tasks.db", (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            done INTEGER NOT NULL
        )
    `);

    db.get("SELECT COUNT(*) AS count FROM tasks", (err, row) => {
    
        if (err) {
            console.error(err.message);
            return;
        }

        if (row.count === 0) {
    
            db.run(
                "INSERT INTO tasks (title, done) VALUES (?, ?)",
                ["Finish Assignment", 0]
            );

            db.run(
                "INSERT INTO tasks (title, done) VALUES (?, ?)",
                ["Study Express", 1]
            );

            db.run(
                "INSERT INTO tasks (title, done) VALUES (?, ?)",
                ["Practice JavaScript", 0]
            );

            console.log("Inserted sample tasks.");
        }

    });

});

const PORT = 3000;


app.get("/", (req, res) => {
    res.json({
        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"]
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.get("/tasks", (req, res) => {

    const sql = "SELECT * FROM tasks";

    db.all(sql, [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        rows.forEach(task => {
            task.done = Boolean(task.done);
        });

        res.json(rows);

    });

});

app.get("/tasks/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const sql = "SELECT * FROM tasks WHERE id = ?";

    db.get(sql, [id], (err, row) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (!row) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
        }

        row.done = Boolean(row.done);

        res.json(row);

    });

});

app.post("/tasks", (req, res) => {

    const { title } = req.body;

    if (!title || title.trim() === "") {

        return res.status(400).json({
            error: "Title is required"
        });

    }

    db.run(

        "INSERT INTO tasks(title, done) VALUES(?, ?)",

        [title, 0],

        function (err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.status(201).json({

                id: this.lastID,
                title,
                done: false

            });

        });

});

app.put("/tasks/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const { title, done } = req.body;

    if (
        (title !== undefined && title.trim() === "") ||
        (done !== undefined && typeof done !== "boolean")
    ) {
        return res.status(400).json({
            error: "Invalid input"
        });
    }

    db.get(
        "SELECT * FROM tasks WHERE id = ?",
        [id],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    error: `Task ${id} not found`
                });
            }

            const updatedTitle =
                title !== undefined ? title : row.title;

            const updatedDone =
                done !== undefined ? done : Boolean(row.done);

            db.run(
                "UPDATE tasks SET title = ?, done = ? WHERE id = ?",
                [
                    updatedTitle,
                    updatedDone ? 1 : 0,
                    id
                ],
                function (err) {

                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.json({
                        id,
                        title: updatedTitle,
                        done: updatedDone
                    });

                });

        });

});

app.delete("/tasks/:id", (req, res) => {

    const id = parseInt(req.params.id);

    db.run(
        "DELETE FROM tasks WHERE id = ?",
        [id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {

                return res.status(404).json({
                    error: `Task ${id} not found`
                });

            }

            res.status(204).send();

        });

});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                done BOOLEAN NOT NULL DEFAULT FALSE
            )
        `);

        const result = await pool.query(
            "SELECT COUNT(*) FROM tasks"
        );

        if (parseInt(result.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO tasks (title, done)
                VALUES
                ('Finish Assignment', false),
                ('Study Express', true),
                ('Practice JavaScript', false)
            `);

            console.log("Sample tasks inserted.");
        }

        console.log("Database ready.");

    } catch (err) {
        console.error(err);
    }
}

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});