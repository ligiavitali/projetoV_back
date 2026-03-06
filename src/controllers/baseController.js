export default class BaseController {
  constructor(entity, service) {
    this.entity = entity;
    this.service = service;
  }

  list = async (_req, res) => {
    try {
      const data = await this.service.findAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: `Erro ao listar ${this.entity.path}.`, details: error.message });
    }
  };

  getById = async (req, res) => {
    try {
      const data = await this.service.findById(req.params.id);
      if (!data) {
        return res.status(404).json({ error: "Registro nao encontrado." });
      }
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: `Erro ao buscar ${this.entity.path}.`, details: error.message });
    }
  };

  create = async (req, res) => {
    try {
      const created = await this.service.create(req.body);
      return res.status(201).json(created);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  update = async (req, res) => {
    try {
      const updated = await this.service.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Registro nao encontrado." });
      }
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      const deleted = await this.service.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Registro nao encontrado." });
      }
      return res.json({ message: "Registro removido com sucesso.", id: deleted.id });
    } catch (error) {
      return res.status(500).json({ error: `Erro ao remover ${this.entity.path}.`, details: error.message });
    }
  };
}
