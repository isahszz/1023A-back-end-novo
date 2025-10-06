import produtoController from "./produtos/produto.controller.js";
import usuarioController from "./usuarios/usuario.controller.js";
import carrinhoController from "./carrinho/carrinho.controller.js";

import { Router } from "express";

const rotas = Router();

//Criando rotas para os usuários
rotas.post("/usuarios", usuarioController.adicionar);
rotas.get("/usuarios", usuarioController.listar);


//rotas para produtos
rotas.post("/produtos",produtoController.adicionar);
rotas.get("/produtos",produtoController.listar);

//rotas para carrinho
rotas.post("/carrinho",carrinhoController.adicionar);
rotas.get("/carrinho",carrinhoController.listar);
rotas.delete("/carrinho",carrinhoController.remover);

//Ainda vamos ter que criar as rotas para carrinho e produtos
//Tarefa para casa :)

export default rotas;