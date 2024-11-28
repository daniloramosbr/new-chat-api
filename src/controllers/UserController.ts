import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken"
const prisma = new PrismaClient();

class UserController {

    async createUser (request: Request, response: Response)  {
 
     try {
         const { name, password } = request.body;
   
         if (!name || !password) {
            response.status(500).json({ erro: "insira todos os dados" });          //verifica se tem todos os dados
         }

         const normalizedName = name.toLowerCase(); // Converte o nome para minúscul
    
         const user = await prisma.user.findUnique({  //busca no banco o name
           where: {
            name: normalizedName
           },
         })
          
         if (user) {
            response.status(500).json({ erro: "user já cadastrado" });         //retorna erro se ja existir
            return
         }
   
         const passCrypt = await bcrypt.hash(password, 10);   // criptografa senha
            
         const newUser = await prisma.user.create({
           data: {
             name,
             password: passCrypt,
           },
         });
         
         const token = Jwt.sign({ id: newUser.id, name:name }, "190526", {
           //cria token com id e name
           expiresIn: "24h",
         });
   
         response.status(201).json({
             message: 'usuário criado com sucesso!',
             token
         })
       } catch (error) {
         response.status(500).send(error)
       }
     }
 
     async validUser (request: Request, response: Response) {
 
         try {
             const { name, password } = request.body;

             if (!name || !password) {
              response.status(500).json({ erro: "insira todos os dados" });          //verifica se tem todos os dados
           }
       
           const normalizedName = name.toLowerCase(); // Converte o nome para minúscul
           
             const user = await prisma.user.findUnique({ where: { name: normalizedName } });          //busca email
       
             if (!user) {
                response.status(404).json({ erro: "Usuário não encontrado" });
                return
             }
       
             const hash = await prisma.user.findUnique({         //busca password
               where: { name: name },
               select: { password: true },
             });
       
             if (hash == null) {
                response.status(404).send({
                 message: "usuário ou senha incorretos",         //se nao existir
               });
             }
       
             const validPassword = await bcrypt.compare(password, hash?.password!);  //verifica se a senha eh igual
       
             if (!validPassword) {
                response.status(401).json({ erro: "Senha inválida" });
             }
       
             const token = Jwt.sign({ id: user?.id, name: user?.name }, "190526", {
               expiresIn: "24h",
             });
       
             response.json({
                 message: 'validação concluída!',
                 token
             });
           } catch (error) {
             response.status(500).send(error);
           }
     }
 
 }
 export default new UserController();