import express from "express";
import Carrinho from "../models/Carrinho.js"; 
import autenticar from "../middlewares/autenticar.js";

const router = express.Router();

// Rota para remover item do carrinho
router.delete("/removerItem/:produtoId", autenticar, async (req, res) => {
  try {
    const userId = req.usuario.id; 
    const { produtoId } = req.params; 

    const carrinho = await Carrinho.findOne({ usuario: userId });
    if (!carrinho) {
      return res.status(404).json({ mensagem: "Carrinho não encontrado." });
    }

    // Filtra removendo o produto indicado
    carrinho.itens = carrinho.itens.filter(
      (item) => item.produto.toString() !== produtoId
    );

    await carrinho.save();

    res.json({ mensagem: "Item removido do carrinho com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao remover item do carrinho." });
  }
});

export default router;
