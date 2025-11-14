import { Router } from "express";
import usuarioController from "../usuarios/usuario.controller.js";
import { verificaAdmin } from "../middleware/auth.admin.js";

const rotaAdmin = Router();

rotaAdmin.get("/usuarios", verificaAdmin, usuarioController.listarTodos);
// rotaAdmin.delete("/usuarios/:id", verificaAdmin, usuarioController.excluir); // opcional

export default rotaAdmin;
