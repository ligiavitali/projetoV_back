import { pool } from "../config/database.js";

export default class BaseRepository {
  constructor(entity) {
    this.entity = entity;
    this.table = entity.table;
    this.columns = entity.columns;
    this.idColumn = "id";
  }

  async findAll() {
    const result = await pool.query(`SELECT * FROM ${this.table} ORDER BY ${this.idColumn}`);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(`SELECT * FROM ${this.table} WHERE ${this.idColumn} = $1`, [id]);
    return result.rows[0] || null;
  }

  async getNextId() {
    const result = await pool.query(
      `SELECT COALESCE(MAX(CASE WHEN ${this.idColumn} ~ '^[0-9]+$' THEN ${this.idColumn}::BIGINT END), 0) + 1 AS next_id
       FROM ${this.table}`
    );
    return String(result.rows[0].next_id);
  }

  async create(payload) {
    const fields = this.columns;
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");
    const values = fields.map((field) => payload[field] ?? null);

    const result = await pool.query(
      `INSERT INTO ${this.table} (${fields.join(", ")}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async update(id, payload) {
    const fields = this.columns.filter((field) => field !== this.idColumn);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");
    const values = fields.map((field) => payload[field] ?? null);

    const result = await pool.query(
      `UPDATE ${this.table} SET ${setClause} WHERE ${this.idColumn} = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await pool.query(`DELETE FROM ${this.table} WHERE ${this.idColumn} = $1 RETURNING ${this.idColumn}`, [id]);
    return result.rows[0] || null;
  }
}
