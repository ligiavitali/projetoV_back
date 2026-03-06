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

  async applyAutoDataEntrada(payload) {
    const hasDataEntradaColumn = (this.entity.columns || []).includes("data_entrada");
    if (!hasDataEntradaColumn) {
      return payload;
    }

    if (!payload.id_pessoa_aluno) {
      return payload;
    }

    const dataIngresso = await this.repository.getPessoaDataIngresso(payload.id_pessoa_aluno);
    if (!dataIngresso) {
      return payload;
    }

    return {
      ...payload,
      data_entrada: dataIngresso,
    };
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
    let mapped = this.normalizeEmptyStrings(this.mapPayload(payload));
    mapped = await this.applyAutoDataEntrada(mapped);

    this.validateRequired(mapped, this.entity.requiredCreate || []);
    return this.repository.create(mapped);
  }

  async update(id, payload) {
    let mapped = this.normalizeEmptyStrings(this.mapPayload(payload));
    mapped = await this.applyAutoDataEntrada(mapped);

    this.validateRequired(mapped, this.entity.requiredUpdate || []);
    return this.repository.update(id, mapped);
  }

  async delete(id) {
    return this.repository.delete(id);
  }
}
