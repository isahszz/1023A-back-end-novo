import { Router } from "express";
import usuarioController from "../usuarios/usuario.controller.js";
import produtoController from "../produtos/produto.controller.js";
import carrinhoController from "../carrinho/carrinho.controller.js";
import Stripe from 'stripe';
import { db } from "../database/banco-mongo.js";
const rotasAutenticadas = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
interface ItemCarrinho {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  nome: string;
}

interface Carrinho {
  usuarioId: string;
  itens: ItemCarrinho[];
  dataAtualizacao: Date;
  total: number;
}
interface RequestAuth extends Request {
  usuarioId?: string
}


// Rotas autenticadas para usuários
rotasAutenticadas.post("/usuarios", usuarioController.adicionar);
rotasAutenticadas.get("/usuarios", usuarioController.listarTodos);
rotasAutenticadas.delete('/carrinho/:usuarioId', carrinhoController.remover)

// Rotas autenticadas para produtos
rotasAutenticadas.post("/produtos", produtoController.adicionar);
rotasAutenticadas.get("/buscar", produtoController.buscarProduto)

// Rotas autenticadas para carrinho
rotasAutenticadas.post("/adicionarItem", carrinhoController.adicionarItem);
rotasAutenticadas.get("/carrinho", carrinhoController.listar);
rotasAutenticadas.delete("/carrinho/remover/:produtoId", carrinhoController.removerproduto);

rotasAutenticadas.post("/criar-pagamento-cartao", async (req:any, res) => {
  //Buscar o carrinho do usuário que está no token para pegar o amount
  //O amount aqui é em centavos, tem que fazer a conversão
  try {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      return res.status(400).json({ mensagem: 'ID do usuário é obrigatório' });
    }

    // Verificar se um carrinho com o usuário já existe
    const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId: usuarioId });
    if (!carrinho) {
      return res.status(404).json({ mensagem: 'Carrinho não encontrado para o usuário' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: carrinho.total *100
      ,
      currency: "brl",
      payment_method_types: ["card"],
      metadata: {
        pedido_id: "123",
      },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    if (err instanceof Error)
      return res.status(400).json({ mensagem: err.message });
    res.status(400).json({ mensagem: "Erro de pagamento desconhecido!" });
  }
});


export default rotasAutenticadas;