// src/swagger.ts
import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import yaml from "js-yaml";
import path from "path";

export function mountSwagger(app: express.Application) {
  const yamlPath = path.join(process.cwd(), "openapi.yaml"); // place your YAML at project root
  const spec = yaml.load(fs.readFileSync(yamlPath, "utf8")) as object;
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
}
