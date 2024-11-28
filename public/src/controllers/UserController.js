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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
class UserController {
    createUser(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, password } = request.body;
                if (!name || !password) {
                    response.status(500).json({ erro: "insira todos os dados" }); //verifica se tem todos os dados
                }
                const user = yield prisma.user.findUnique({
                    where: {
                        name
                    },
                });
                if (user) {
                    response.status(500).json({ erro: "user já cadastrado" }); //retorna erro se ja existir
                    return;
                }
                const passCrypt = yield bcrypt_1.default.hash(password, 10); // criptografa senha
                const newUser = yield prisma.user.create({
                    data: {
                        name,
                        password: passCrypt,
                    },
                });
                const token = jsonwebtoken_1.default.sign({ id: newUser.id, name: name }, "190526", {
                    //cria token com id e name
                    expiresIn: "24h",
                });
                response.status(201).json({
                    message: 'usuário criado com sucesso!',
                    token
                });
            }
            catch (error) {
                response.status(500).send(error);
            }
        });
    }
    validUser(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, password } = request.body;
                if (!name || !password) {
                    response.status(500).json({ erro: "insira todos os dados" }); //verifica se tem todos os dados
                }
                const user = yield prisma.user.findUnique({ where: { name } }); //busca email
                if (!user) {
                    response.status(404).json({ erro: "Usuário não encontrado" });
                    return;
                }
                const hash = yield prisma.user.findUnique({
                    where: { name: name },
                    select: { password: true },
                });
                if (hash == null) {
                    response.status(404).send({
                        message: "usuário ou senha incorretos", //se nao existir
                    });
                }
                const validPassword = yield bcrypt_1.default.compare(password, hash === null || hash === void 0 ? void 0 : hash.password); //verifica se a senha eh igual
                if (!validPassword) {
                    response.status(401).json({ erro: "Senha inválida" });
                }
                const token = jsonwebtoken_1.default.sign({ id: user === null || user === void 0 ? void 0 : user.id, name: user === null || user === void 0 ? void 0 : user.name }, "190526", {
                    expiresIn: "24h",
                });
                response.json({
                    message: 'validação concluída!',
                    token
                });
            }
            catch (error) {
                response.status(500).send(error);
            }
        });
    }
}
exports.default = new UserController();
