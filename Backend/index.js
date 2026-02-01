import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
const PORT = 3000;

//CORS
app.use(cors());
app.use(express.json());

// postgreSQL
const pool = new Pool({
  user: "carlos",
  host: "localhost",
  database: "likeme",
  password: "",
  port: 5432,
});

//GET /posts
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /posts
app.post("/posts", async (req, res) => {
  try {

    const { titulo, url, descripcion } = req.body;

    const consulta = `
      INSERT INTO posts (titulo, img, descripcion, likes)
      VALUES ($1, $2, $3, 0)
      RETURNING *
    `;

    const values = [titulo, url, descripcion];
    const result = await pool.query(consulta, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});

// parte II
app.put("/posts/like/:id", async (req, res) => {
    try {
      
      const { id } = req.params;
  
      const consulta = `
        UPDATE posts
        SET likes = likes + 1
        WHERE id = $1
        RETURNING *
      `;
  
      const result = await pool.query(consulta, [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Post no encontrado" });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /posts/:id
app.delete("/posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const consulta = `
        DELETE FROM posts
        WHERE id = $1
        RETURNING *
      `;
  
      const result = await pool.query(consulta, [id]);
  
      res.json({ message: "Post eliminado correctamente", post: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  