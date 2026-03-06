export default class BaseService {
  constructor(entity, repository) {
    this.entity = entity;
    this.repository = repository;
  }

  mapPayload(payload) {
    if (typeof this.entity.mapPayload === "function") {
      return this.entity.mapPayload(payload || {});
    }
    return payload || {};
  }

  normalizeEmptyStrings(payload) {
    const normalized = { ...payload };

    (this.entity.columns || []).forEach((field) => {
      if (normalized[field] === "") {
        normalized[field] = null;
      }
    });

    return normalized;
  }

  validateRequired(payload, requiredFields) {
    const missing = requiredFields.filter((field) => {
      const value = payload[field];
      return value === undefined || value === null || value === "";
    });

    if (missing.length > 0) {
      throw new Error(`Campos obrigatorios: ${missing.join(", ")}.`);
    }
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id) {
    return this.repository.findById(id);
  }

  async create(payload) {
    const mapped = this.normalizeEmptyStrings(this.mapPayload(payload));

    // Gera ID incremental para tabelas com PK "id" quando o cliente nao envia o campo.
    if ((mapped.id === undefined || mapped.id === null || mapped.id === "") && this.entity.columns.includes("id")) {
      mapped.id = await this.repository.getNextId();
    }

    this.validateRequired(mapped, this.entity.requiredCreate || []);
    return this.repository.create(mapped);
  }

  async update(id, payload) {
    const mapped = this.normalizeEmptyStrings(this.mapPayload(payload));
    this.validateRequired(mapped, this.entity.requiredUpdate || []);
    return this.repository.update(id, mapped);
  }

  async delete(id) {
    return this.repository.delete(id);
  }
}
