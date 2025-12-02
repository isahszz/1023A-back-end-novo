import { Router } from "express";
import usuarioController from "../usuarios/usuario.controller.js";
import produtoController from "../produtos/produto.controller.js";

const rotaAdmin = Router();



rotaAdmin.get("/usuarios",  usuarioController.listarTodos);
// rotaAdmin.delete("/usuarios/:id", verificaAdmin, usuarioController.excluir);
rotaAdmin.get("/produtos", produtoController.listar);

export default rotaAdmin;
