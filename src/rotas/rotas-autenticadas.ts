import usuarioController from "../usuarios/usuario.controller.js";
import produtoController from "../produtos/produto.controller.js";

import { Router} from "express";
import carrinhoController from "../carrinho/carrinho.controller.js";

const rotasAutenticadas = Router();

//Criando rotasAutenticadas para os usuários
rotasAutenticadas.post("/usuarios", usuarioController.adicionar);
rotasAutenticadas.get("/usuarios", usuarioController.listar);


//rotasAutenticadas para produtos
rotasAutenticadas.post("/produtos", produtoController.adicionar);



//Ainda vamos ter que criar as rotasAutenticadas para carrinho e produtos
rotasAutenticadas.post("/adicionarItem", carrinhoController.adicionarItem);
//Tarefa para casa :)

export default rotasAutenticadas;