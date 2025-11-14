import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class UsuarioController {
  async adicionar(req: Request, res: Response) {
    const { nome, idade, email, senha, tipo } = req.body;
    if (!nome || !email || !senha || !idade) {
      return res.status(400).json({ mensagem: "Dados incompletos (nome,email,senha,idade)" });
    }

    const existente = await db.collection("usuarios").findOne({ email });
    if (existente) return res.status(400).json({ mensagem: "E-mail já cadastrado!" });

    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const novo = { nome, idade, email, senha: senhaCriptografada, tipo: tipo || "cliente" };
    const resultado = await db.collection("usuarios").insertOne(novo);

    // não devolver senha
    const usuarioResposta = { ...novo, _id: resultado.insertedId };
    delete (usuarioResposta as any).senha;
    res.status(201).json({ mensagem: "Usuário criado!", usuario: usuarioResposta });
  }

  // rota usada pela área admin
  async listarTodos(req: Request, res: Response) {
    const usuarios = await db.collection("usuarios").find({}, { projection: { senha: 0 } }).toArray();
    res.status(200).json(usuarios);
  }

  async excluir(req: Request, res: Response) {
    const { id } = req.params;
    const { ObjectId } = await import("bson");
    const resultado = await db.collection("usuarios").deleteOne({ _id: new ObjectId(id) });
    if (resultado.deletedCount === 0) return res.status(404).json({ mensagem: "Usuário não encontrado" });
    res.status(200).json({ mensagem: "Usuário excluído" });
  }

  async login(req: Request, res: Response) {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ mensagem: "Email e senha são obrigatórios!" });

    const usuario = await db.collection("usuarios").findOne({ email });
    if (!usuario) return res.status(400).json({ mensagem: "Usuário incorreto!" });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(400).json({ mensagem: "Senha incorreta!" });

    const token = jwt.sign(
      { usuarioId: usuario._id, tipo: usuario.tipo, nome: usuario.nome },
      process.env.JWT_SECRET || "segredo",
      { expiresIn: "1h" }
    );

    res.status(200).json({ mensagem: "Login ok", token, tipo: usuario.tipo, nome: usuario.nome });
  }
}

export default new UsuarioController();
