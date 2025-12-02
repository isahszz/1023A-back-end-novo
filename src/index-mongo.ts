import 'dotenv/config'
import express from 'express';
import rotasAutenticadas from './rotas/rotas-autenticadas.js';
import rotasNaoAutenticadas from './rotas/rotas-nao-autenticadas.js';
import Auth from './middleware/auth.js';    
import cors from 'cors';    
import  verificaAdmin  from "./middleware/auth.admin.js";
import rotasAdmin from './rotas/rotas.admin.js';

const app = express();
app.use(cors())
app.use(express.json());

app.use(rotasNaoAutenticadas)
app.use(Auth)
app.use(rotasAutenticadas);
app.use(verificaAdmin)
app.use(rotasAdmin)

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});