import { Request, Response } from "express";
import { ObjectId } from "bson";
import { db } from "../database/banco-mongo.js";

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

interface Produto {
  _id: ObjectId;
  nome: string,
  preco: number,
  descricao: string,
  urlfoto: string
}
interface RequestAuth extends Request {
  usuarioId?: string
}

class CarrinhoController {
  //adicionarItem
  async adicionarItem(req: RequestAuth, res: Response) {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      return res.status(400).json({ mensagem: 'ID do usuário é obrigatório' });
    }
    const { produtoId, quantidade } = req.body as { produtoId: string, quantidade: number };
    console.log(usuarioId, produtoId, quantidade)

    //Buscar o produto no banco de dados
    const produto = await db.collection<Produto>('produtos')
      .findOne({ _id: ObjectId.createFromHexString(produtoId) });
    if (!produto)
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    //Pegar o preço do produto
    //Pegar o nome do produto
    const nomeProduto = produto.nome;
    const precoProduto = produto.preco;

    // Verificar se um carrinho com o usuário já existe
    const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId: usuarioId });

    if (!carrinho) {
      const novoCarrinho: Carrinho = {
        usuarioId: usuarioId,
        itens: [{
          produtoId: produtoId,
          quantidade: quantidade,
          precoUnitario: precoProduto,
          nome: nomeProduto
        }],
        dataAtualizacao: new Date(),
        total: precoProduto * quantidade
      }
      const resposta = await db.collection<Carrinho>("carrinhos").insertOne(novoCarrinho);
      const carrinhoResposta = {
        usuarioId: novoCarrinho.usuarioId,
        itens: novoCarrinho.itens,
        dataAtualizacao: novoCarrinho.dataAtualizacao,
        total: novoCarrinho.total,
        _id: resposta.insertedId

      }
      //return res.status(201).json({...novoCarrinho, _id: resposta.insertedId});

      //Early Return
      return res.status(201).json(carrinhoResposta);

    }
    //ELSE
    // Se existir, deve adicionar o item ao carrinho existente
    const itemExistente = carrinho.itens.find(item => item.produtoId === produtoId);
    if (itemExistente) {
      itemExistente.quantidade += quantidade;
      carrinho.total += precoProduto * quantidade;
      carrinho.dataAtualizacao = new Date();
    }
    else {
      carrinho.itens.push({
        produtoId: produtoId,
        quantidade: quantidade,
        precoUnitario: precoProduto,
        nome: nomeProduto
      });
      carrinho.total += precoProduto * quantidade;
      carrinho.dataAtualizacao = new Date();
    }
    // Atualizar o carrinho no banco de dados
    await db.collection<Carrinho>("carrinhos").updateOne({ usuarioId: usuarioId },
      {
        $set: {
          itens: carrinho.itens,
          total: carrinho.total,
          dataAtualizacao: carrinho.dataAtualizacao
        }
      }
    )
    res.status(200).json(carrinho);
  }
  removerItem(req: Request, res: Response) {
    const { usuarioId, produtoId } = req.body;
  }
  atualizarQuantidade(req: Request, res: Response) {
    const { usuarioId, produtoId, quantidade } = req.body;
  }
  //listar carrinhos
  async listar(req: RequestAuth, res: Response) {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      return res.status(400).json({ mensagem: 'ID do usuário é obrigatório' });
    }
    const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId: usuarioId });
    if (!carrinho) {
      return res.status(404).json({ mensagem: 'Carrinho não encontrado' });
    }
    return res.status(200).json(carrinho);
  }
  remover(req: Request, res: Response) {
    const { usuarioId } = req.params;
  }
  //remover                -> Remover o carrinho todo
  async delete(req: Request, res: Response) {
    const { usuarioId } = req.params;
    const resultado = await db.collection("carrinhos").deleteOne({ usuarioId: usuarioId });
    if (resultado.deletedCount === 0) {
      return res.status(404).json({ mensagem: "Carrinho não encontrado" });
    }
    return res.status(200).json({ mensagem: "Carrinho removido com sucesso" });

  }

  //removerItem
  async removerproduto(req: RequestAuth, res: Response) {
    console.log("Removendo produto do carrinho");
    const usuarioId = req.usuarioId;
    const produtoId = req.params.produtoId;

    if (!usuarioId) {
      return res.status(401).json({ mensagem: "Usuário não autenticado" });
    }

    const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId });
    if (!carrinho) return res.status(404).json({ mensagem: "Carrinho não encontrado" });

    const itensAtualizados = carrinho.itens.filter((i) => i.produtoId !== produtoId);

    const total = itensAtualizados.reduce(
      (acc, item) => acc + item.precoUnitario * item.quantidade,
      0
    );

    await db.collection("carrinhos").updateOne(
      { usuarioId },
      { $set: { itens: itensAtualizados, total, dataAtualizacao: new Date() } }
    );
    carrinho.itens = itensAtualizados;
    carrinho.total = total;
    carrinho.dataAtualizacao = new Date();
    return res.status(200).json(carrinho);
  }

  // buscar produto
  async buscarProduto(req: Request, res: Response) {
    console.log("Buscando produtos");

    try {
      const termo = req.query.termo as string;

      if (!termo || termo.trim() === "") {
        return res.status(400).json({ mensagem: "Termo de busca é obrigatório" });
      }

      // Busca por nome ou categoria
      const produtos = await db.collection<Produto>("produtos").find({
        $or: [
          { nome: { $regex: termo, $options: "i" } },
          { categoria: { $regex: termo, $options: "i" } }
        ]
      }).toArray();

      return res.status(200).json(produtos);

    } catch (erro) {
      console.error("Erro ao buscar produtos:", erro);
      return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
  }


}

export default new CarrinhoController();    
