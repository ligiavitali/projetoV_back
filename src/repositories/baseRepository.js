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

  async getPessoaDataIngresso(idPessoaAluno) {
    const result = await pool.query("SELECT data_ingresso FROM pessoas WHERE id = $1", [idPessoaAluno]);
    return result.rows[0]?.data_ingresso || null;
  }

  async create(payload) {
    const shouldUseIdentity = payload[this.idColumn] === undefined || payload[this.idColumn] === null || payload[this.idColumn] === "";
    const fields = shouldUseIdentity
      ? this.columns.filter((field) => field !== this.idColumn)
      : this.columns;

    const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");
    const values = fields.map((field) => payload[field] ?? null);

    try {
      const result = await pool.query(
        `INSERT INTO ${this.table} (${fields.join(", ")}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return result.rows[0];
    } catch (error) {
      // Compatibilidade: se a tabela antiga ainda exige id sem default, gera incremental e tenta novamente.
      const isMissingIdError =
        shouldUseIdentity &&
        error?.code === "23502" &&
        String(error?.column || "") === this.idColumn;

      if (!isMissingIdError) {
        throw error;
      }

      const nextId = await this.getNextNumericId();
      const retryPayload = { ...payload, [this.idColumn]: nextId };
      const retryFields = this.columns;
      const retryPlaceholders = retryFields.map((_, i) => `$${i + 1}`).join(", ");
      const retryValues = retryFields.map((field) => retryPayload[field] ?? null);

      const retryResult = await pool.query(
        `INSERT INTO ${this.table} (${retryFields.join(", ")}) VALUES (${retryPlaceholders}) RETURNING *`,
        retryValues
      );
      return retryResult.rows[0];
    }
  }

  async getNextNumericId() {
    const result = await pool.query(
      `SELECT COALESCE(
        MAX(CASE WHEN CAST(${this.idColumn} AS TEXT) ~ '^[0-9]+$' THEN CAST(${this.idColumn} AS BIGINT) END),
        0
      ) + 1 AS next_id
      FROM ${this.table}`
    );

    return Number(result.rows[0].next_id);
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
