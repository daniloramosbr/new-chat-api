"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class MessageController {
    createMessage(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sender, receiver, data } = request.body;
                if (!sender || !receiver || !data) {
                    response.status(500).json({ erro: "insira todos os dados" }); //verifica se tem todos os dados
                }
                yield prisma.message.create({
                    data: {
                        sender,
                        receiver,
                        data: data
                    },
                });
                response.status(201).json({ message: 'criado com sucesso!' });
            }
            catch (error) {
                response.status(500).send(error);
            }
        });
    }
    users(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = request.params.id;
                const user = yield prisma.user.findUnique({
                    where: { id: id
                    },
                });
                if (!user) {
                    response.status(404).json({ erro: "Usuário não encontrado" });
                    return;
                }
                const users = yield prisma.user.findMany({
                    where: { id: { not: id, },
                    },
                    select: { id: true, name: true,
                    }
                });
                response.status(200).send(users);
            }
            catch (error) {
                response.status(500).send(error);
            }
        });
    }
    getUsersAndLastMessages(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = request.params;
                const user = yield prisma.user.findUnique({
                    where: { id: id
                    },
                });
                if (!user) {
                    response.status(404).json({ erro: "Usuário não encontrado" });
                    return;
                }
                // Busca todas as mensagens envolvendo o usuário logado
                const messages = yield prisma.message.findMany({
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
                const userIds = new Set();
                messages.forEach(msg => {
                    if (msg.sender !== id)
                        userIds.add(msg.sender);
                    if (msg.receiver !== id)
                        userIds.add(msg.receiver);
                });
                // Busca os detalhes dos usuários filtrados
                const users = yield prisma.user.findMany({
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
                    const lastMessage = messages.find(msg => (msg.sender === user.id && msg.receiver === id) ||
                        (msg.receiver === user.id && msg.sender === id));
                    return {
                        id: user.id,
                        name: user.name,
                        lastMessage: lastMessage ? lastMessage.data : null,
                        lastMessageTime: lastMessage ? lastMessage.createdAt : null
                    };
                });
                // Ordena os resultados pela data da última mensagem
                result.sort((a, b) => { var _a, _b; return (((_a = b.lastMessageTime) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) - (((_b = a.lastMessageTime) === null || _b === void 0 ? void 0 : _b.getTime()) || 0); });
                // Remove a propriedade lastMessageTime da resposta final
                const finalResult = result.map((_a) => {
                    var { lastMessageTime } = _a, rest = __rest(_a, ["lastMessageTime"]);
                    return rest;
                });
                response.status(200).json(finalResult);
            }
            catch (error) {
                response.status(500).send(error);
            }
        });
    }
    getChat(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { from, to } = request.body;
                // Verifica se os IDs são válidos
                const isFromValid = yield prisma.user.findUnique({ where: { id: from } });
                const isReceiveValid = yield prisma.user.findUnique({ where: { id: to } });
                if (!isFromValid || !isReceiveValid) {
                    response.status(400).json({ error: "IDs inválidos fornecidos." });
                    return;
                }
                // Mensagens enviadas pelo usuário
                const messagesFromMe = yield prisma.message.findMany({
                    where: {
                        sender: from,
                        receiver: to
                    }
                });
                // Mensagens recebidas pelo usuário
                const messagesToMe = yield prisma.message.findMany({
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
            }
            catch (error) {
                response.status(500).send(error);
            }
        });
    }
}
exports.default = new MessageController();
