import { Router } from "express";
import usuarioController from "../usuarios/usuario.controller.js";
import produtoController from "../produtos/produto.controller.js";
import carrinhoController from "../carrinho/carrinho.controller.js";
import Stripe from "stripe";
import conexao from "../database/conexao.js"; // ajuste se seu arquivo for outro

const rotasAutenticadas = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// =========================
// ROTAS USUÁRIOS
// =========================
rotasAutenticadas.post("/usuarios", usuarioController.adicionar);
rotasAutenticadas.get("/usuarios", usuarioController.listarTodos);
rotasAutenticadas.delete("/carrinho/:usuarioId", carrinhoController.remover);

// =========================
// ROTAS PRODUTOS
// =========================
rotasAutenticadas.post("/produtos", produtoController.adicionar);
rotasAutenticadas.get("/produtos/buscar", produtoController.buscarProduto);

// =========================
// ROTAS CARRINHO
// =========================
rotasAutenticadas.post("/adicionarItem", carrinhoController.adicionarItem);
rotasAutenticadas.get("/carrinho", carrinhoController.listar);
rotasAutenticadas.delete("/carrinho/remover/:produtoId", carrinhoController.removerproduto);

// =========================
// PAGAMENTO COM STRIPE
// =========================
rotasAutenticadas.post("/criar-pagamento-cartao", async (req, res) => {
  try {
    const usuarioId = req.user?.id; // ID do usuário vindo do token

    if (!usuarioId) {
      return res.status(401).json({ mensagem: "Usuário não autenticado!" });
    }

    // =========================
    // 1. BUSCAR CARRINHO DO USUÁRIO
    // =========================
    const [itens] = await conexao.query(
      `
      SELECT c.quantidade, p.preco
      FROM carrinho c
      JOIN produtos p ON p.id = c.produto_id
      WHERE c.usuario_id = ?
      `,
      [usuarioId]
    );

    if (itens.length === 0) {
      return res.status(400).json({ mensagem: "Carrinho vazio!" });
    }

    // =========================
    // 2. CALCULAR TOTAL
    // =========================
    let total = 0;
    itens.forEach((item) => {
      total += Number(item.preco) * item.quantidade;
    });

    // =========================
    // 3. CONVERTER PARA CENTAVOS
    // =========================
    const amount = Math.round(total * 100);

    // =========================
    // 4. CRIAR PAGAMENTO
    // =========================
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // EM CENTAVOS
      currency: "brl",
      automatic_payment_methods: { enabled: true },
      metadata: { usuario_id: usuarioId.toString() }
    });

    return res.json({
      clientSecret: paymentIntent.client_secret
    });

  } catch (err) {
    console.log("ERRO PAYMENT:", err);
    return res.status(500).json({
      mensagem: "Erro ao criar pagamento!",
      erro: err.message
    });
  }
});

export default rotasAutenticadas;
