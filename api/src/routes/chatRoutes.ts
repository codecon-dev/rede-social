import { Router } from "express";
import {
  createChatRoom,
  getChatRoomMessages,
  getUserChatRooms,
} from "../controllers/chatController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.get("/rooms", getUserChatRooms);
router.post("/rooms", createChatRoom);
router.get("/rooms/:room_id/messages", getChatRoomMessages);

export const chatRoutes = router;
