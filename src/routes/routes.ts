import { Router } from "express";
import UserController from "../controllers/UserController";
import MessageController from "../controllers/MessageController";

const routes = Router()

routes.get('/', (req, res) => {
    res.status(200).json({ message: 'API is running!' });
})
routes.post("/signup", UserController.createUser)
routes.post("/signin", UserController.validUser)
routes.post("/message", MessageController.createMessage)
routes.get("/users/:id", MessageController.users)
routes.get("/lastmessages/:id", MessageController.getUsersAndLastMessages)
routes.post("/chat", MessageController.getChat)

export default routes