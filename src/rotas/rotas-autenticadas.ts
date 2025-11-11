import { Router } from "express";
import usuarioController from "../usuarios/usuario.controller.js";
import produtoController from "../produtos/produto.controller.js";
import carrinhoController from "../carrinho/carrinho.controller.js";

const rotasAutenticadas = Router();

// Rotas autenticadas para usuários
rotasAutenticadas.post("/usuarios", usuarioController.adicionar);
rotasAutenticadas.get("/usuarios", usuarioController.listarTodos);

// Rotas autenticadas para produtos
rotasAutenticadas.post("/produtos", produtoController.adicionar);
rotasAutenticadas.get("/produtos", produtoController.listar);

// Rotas autenticadas para carrinho
rotasAutenticadas.post("/adicionarItem", carrinhoController.adicionarItem);
rotasAutenticadas.get("/carrinho", carrinhoController.listar);

export default rotasAutenticadas;
