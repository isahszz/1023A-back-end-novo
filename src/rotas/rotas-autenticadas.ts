import { Router } from "express";
import usuarioController from "../usuarios/usuario.controller.js";
import produtoController from "../produtos/produto.controller.js";
import carrinhoController from "../carrinho/carrinho.controller.js";
import Stripe from 'stripe';
const rotasAutenticadas = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Rotas autenticadas para usuários
rotasAutenticadas.post("/usuarios", usuarioController.adicionar);
rotasAutenticadas.get("/usuarios", usuarioController.listarTodos);
rotasAutenticadas.delete('/carrinho/:usuarioId',carrinhoController.remover)

// Rotas autenticadas para produtos
rotasAutenticadas.post("/produtos", produtoController.adicionar);



// Rotas autenticadas para carrinho
rotasAutenticadas.post("/adicionarItem", carrinhoController.adicionarItem);
rotasAutenticadas.get("/carrinho", carrinhoController.listar);
rotasAutenticadas.delete("/carrinho/remover/:produtoId", carrinhoController.removerproduto);

rotasAutenticadas.post("/criar-pagamento-cartao", async (req, res) => {
  //Buscar o carrinho do usuário que está no token para pegar o amount
  //O amount aqui é em centavos, tem que fazer a conversão
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 5000,
      currency: "brl",
      payment_method_types: ["card"],
      metadata: {
        pedido_id: "123",
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    if (err instanceof Error)
      return res.status(400).json({ mensagem: err.message });
    res.status(400).json({ mensagem: "Erro de pagamento desconhecido!" });
  }
});


export default rotasAutenticadas;
