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

app.get("/tasks", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM tasks ORDER BY id"
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

app.get("/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const result = await pool.query(
            "SELECT * FROM tasks WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

app.post("/tasks", async (req, res) => {

    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    try {

        const result = await pool.query(
            `INSERT INTO tasks(title, done)
             VALUES($1,$2)
             RETURNING *`,
            [title,false]
        );

        res.status(201).json(result.rows[0]);

    } catch(err){

        console.error(err);

        res.status(500).json({
            error:"Database error"
        });

    }

});

app.put("/tasks/:id", async (req,res)=>{

    const id=parseInt(req.params.id);

    const {title,done}=req.body;

    if(
        (title!==undefined && title.trim()==="")||
        (done!==undefined && typeof done!=="boolean")
    ){
        return res.status(400).json({
            error:"Invalid input"
        });
    }

    try{

        const check=await pool.query(
            "SELECT * FROM tasks WHERE id=$1",
            [id]
        );

        if(check.rows.length===0){

            return res.status(404).json({
                error:`Task ${id} not found`
            });

        }

        const updated=await pool.query(

            `UPDATE tasks
             SET title=$1,
                 done=$2
             WHERE id=$3
             RETURNING *`,

            [
                title ?? check.rows[0].title,
                done ?? check.rows[0].done,
                id
            ]

        );

        res.json(updated.rows[0]);

    }catch(err){

        console.error(err);

        res.status(500).json({
            error:"Database error"
        });

    }

});

app.delete("/tasks/:id", async(req,res)=>{

    const id=parseInt(req.params.id);

    try{

        const result=await pool.query(

            "DELETE FROM tasks WHERE id=$1 RETURNING *",

            [id]

        );

        if(result.rows.length===0){

            return res.status(404).json({
                error:`Task ${id} not found`
            });

        }

        res.status(204).send();

    }catch(err){

        console.error(err);

        res.status(500).json({
            error:"Database error"
        });

    }

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