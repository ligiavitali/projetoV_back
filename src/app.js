import express from "express";
import cors from "cors";
import { controllerEntries } from "./controllers/entityControllers.js";
import { createCrudRouter } from "./routes/crud/createCrudRouter.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

controllerEntries.forEach(({ entity, controller }) => {
  const router = createCrudRouter(controller);
  app.use(`/api/${entity.path}`, router);

  (entity.aliases || []).forEach((aliasPath) => {
    app.use(`/api/${aliasPath}`, router);
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

export default app;
