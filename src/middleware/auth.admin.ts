import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function verificaAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ mensagem: "Token não fornecido." });

  try {
    const segredo = process.env.JWT_SECRET || "segredo";
    const decoded = jwt.verify(token, segredo) as any;

    if (decoded?.tipo !== "admin") {
      return res.status(403).json({ mensagem: "Acesso negado: apenas administradores." });
    }

    // opcional: anexa infos do usuário na requisição
    (req as any).usuario = { usuarioId: decoded.usuarioId, tipo: decoded.tipo };

    next();
  } catch (err) {
    return res.status(401).json({ mensagem: "Token inválido." });
  }
}
