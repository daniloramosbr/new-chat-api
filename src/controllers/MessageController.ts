import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class MessageController {

    async createMessage (request: Request, response: Response): Promise<void> {

        try {

            const { sender, receiver, data } = request.body;

            if (!sender || !receiver || !data) {
                response.status(500).json({ erro: "insira todos os dados" });          //verifica se tem todos os dados
             }

            await prisma.message.create({
                data: {
                    sender,
                    receiver,
                    data: data
                },
              });

              response.status(201).json({message: 'criado com sucesso!'});
            
        } catch (error) {
            response.status(500).send(error)
        }
    }

    async users (request: Request, response: Response): Promise<void> {

        try {

            const id = request.params.id;

            const user = await prisma.user.findUnique({ 
                where: 
                { id: id
                 }, 
                });

                if (!user) {
                response.status(404).json({ erro: "Usuário não encontrado" });
                return
             }

            const users = await prisma.user.findMany({
                 where: { id: { not: id, },
                 }, 
                 select: { id: true, name: true, 

                 }})

            response.status(200).send(users)
            
        } catch (error) {
            response.status(500).send(error)
        }
    }

    async getUsersAndLastMessages(request: Request, response: Response): Promise<void> {
        try {
          const { id } = request.params;

          const user = await prisma.user.findUnique({ 
            where: 
            { id: id
             }, 
            });

            if (!user) {
            response.status(404).json({ erro: "Usuário não encontrado" });
            return
         }
    
          // Busca todas as mensagens envolvendo o usuário logado
          const messages = await prisma.message.findMany({
            where: {
              OR: [
                { sender: id },
                { receiver: id }
              ]
            },
            orderBy: {
              createdAt: 'desc'
            },
            select: {
              sender: true,
              receiver: true,
              data: true,
              createdAt: true
            }
          });
    
          // Filtra os IDs dos usuários envolvidos nas mensagens
          const userIds = new Set<string>();
          messages.forEach(msg => {
            if (msg.sender !== id) userIds.add(msg.sender);
            if (msg.receiver !== id) userIds.add(msg.receiver);
          });
    
          // Busca os detalhes dos usuários filtrados
          const users = await prisma.user.findMany({
            where: {
              id: {
                in: Array.from(userIds)
              }
            },
            select: {
              id: true,
              name: true
            }
          });
    
          // Mapeia os resultados para incluir a última mensagem
          const result = users.map(user => {
            const lastMessage = messages.find(msg =>
              (msg.sender === user.id && msg.receiver === id) ||
              (msg.receiver === user.id && msg.sender === id)
            );
    
            return {
              id: user.id,
              name: user.name,
              lastMessage: lastMessage ? lastMessage.data : null,
              lastMessageTime: lastMessage ? lastMessage.createdAt : null
            };
          });
    
          // Ordena os resultados pela data da última mensagem
          result.sort((a, b) => (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0));
    
          // Remove a propriedade lastMessageTime da resposta final
          const finalResult = result.map(({ lastMessageTime, ...rest }) => rest);
    
          response.status(200).json(finalResult);
        } catch (error) {
          response.status(500).send(error);
        }
      }

      
      async getChat(request: Request, response: Response): Promise<void> {
        try {
          const { from, to } = request.body;
    
          // Verifica se os IDs são válidos
          const isFromValid = await prisma.user.findUnique({ where: { id: from } });
          const isReceiveValid = await prisma.user.findUnique({ where: { id: to } });
    
          if (!isFromValid || !isReceiveValid) {
            response.status(400).json({ error: "IDs inválidos fornecidos." });
            return;
          }
    
          // Mensagens enviadas pelo usuário
          const messagesFromMe = await prisma.message.findMany({
            where: {
              sender: from,
              receiver: to
            }
          });
    
          // Mensagens recebidas pelo usuário
          const messagesToMe = await prisma.message.findMany({
            where: {
              sender: to,
              receiver: from
            }
          });
    
          // Combina todas as mensagens e ordena por data de criação
          const allMessages = [...messagesFromMe, ...messagesToMe].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
          if (allMessages.length === 0) {
            response.status(404).json({ error: "Mensagens não encontradas." });
            return;
          }
    
          response.status(200).json(allMessages);
        } catch (error) {
          response.status(500).send(error);
        }
      }

}

export default new MessageController();

