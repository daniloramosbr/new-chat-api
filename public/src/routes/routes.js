"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = __importDefault(require("../controllers/UserController"));
const MessageController_1 = __importDefault(require("../controllers/MessageController"));
const routes = (0, express_1.Router)();
routes.get('/', (req, res) => {
    res.status(200).json({ message: 'API is running!' });
});
routes.post("/signup", UserController_1.default.createUser);
routes.post("/signin", UserController_1.default.validUser);
routes.post("/message", MessageController_1.default.createMessage);
routes.get("/users/:id", MessageController_1.default.users);
routes.get("/lastmessages/:id", MessageController_1.default.getUsersAndLastMessages);
routes.post("/chat", MessageController_1.default.getChat);
exports.default = routes;
