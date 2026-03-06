import { entities } from "../models/entities.js";
import BaseRepository from "../repositories/baseRepository.js";
import BaseService from "../services/baseService.js";
import BaseController from "./baseController.js";

export const controllerEntries = entities.map((entity) => {
  const repository = new BaseRepository(entity);
  const service = new BaseService(entity, repository);
  const controller = new BaseController(entity, service);

  return {
    entity,
    controller,
  };
});
