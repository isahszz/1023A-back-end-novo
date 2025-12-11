import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
import { ObjectId } from "bson";

interface Produto {
  _id: ObjectId;
  nome: string,
  preco: number,
  descricao: string,
  urlfoto: string
}
class ProdutoController {
    async adicionar(req: Request, res: Response) {
        const { nome, preco, descricao, urlfoto } = req.body
        const produto = { nome, preco, descricao, urlfoto };
        const resposta = await db.collection('produtos').insertOne(produto)
        res.status(201).json({ ...produto, _id: resposta.insertedId })
    }
    async listar(req: Request, res: Response) {
        const produtos = await db.collection('produtos').find().toArray();
        res.status(200).json(produtos);
    }
    async remover(req: Request, res: Response) {
        const { nome, preco, descricao, urlfoto } = req.body
        const produto = { nome, preco, descricao, urlfoto };
        const resposta = await db.collection('produtos').insertOne(produto)
        res.status(201).json({ ...produto, _id: resposta.insertedId })
    }
    async buscarProduto(req: Request, res: Response) {
        console.log("Buscando produtos");

        try {
            const termo = req.query.termo as string;

            if (!termo || termo.trim() === "") {
                return res.status(400).json({ mensagem: "Termo de busca é obrigatório" });
            }

            const produtos = await db.collection<Produto>("produtos").find({
                $or: [
                    { nome: { $regex: termo, $options: "i" } },
                ]
            }).toArray();

            return res.status(200).json(produtos);

        } catch (erro) {
            console.error("Erro ao buscar produtos:", erro);
            return res.status(500).json({ mensagem: "Erro interno do servidor" });
        }
    }

}
export default new ProdutoController();

