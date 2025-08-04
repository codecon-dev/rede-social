import type { Response } from "express";
import { body, validationResult } from "express-validator";
import { pool } from "../config/database";
import { getChatService } from "../services/chatService";
import type { AuthRequest } from "../types";

export const createChatRoom = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  const client = await pool.connect();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, is_group, member_ids } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      await client.query("BEGIN");

      const existingRoomCheck = await client.query(
        `
        -- group chat room check
        SELECT cr.* FROM chat_rooms cr WHERE name = $1 AND is_group = $2

        UNION
        -- direct message room check

        SELECT cr.* FROM chat_rooms cr
        JOIN chat_rooms_members crm ON cr.id = crm.room_id AND crm.user_id = $3
        JOIN chat_rooms_members crm2 ON cr.id = crm2.room_id AND crm2.user_id = $4
        WHERE cr.is_group = $2 AND cr.name IS NULL
        `,
        [name, is_group || false, userId, member_ids ? member_ids[0] : null],
      );

      if (existingRoomCheck.rows.length > 0) {
        return res.status(200).json(existingRoomCheck.rows[0]);
      }

      const roomResult = await client.query(
        "INSERT INTO chat_rooms (name, is_group, created_by) VALUES ($1, $2, $3) RETURNING *",
        [name, is_group || false, userId],
      );

      const room = roomResult.rows[0];

      await client.query(
        "INSERT INTO chat_rooms_members (room_id, user_id) VALUES ($1, $2)",
        [room.id, userId],
      );

      if (member_ids && Array.isArray(member_ids)) {
        for (const memberId of member_ids) {
          if (memberId !== userId) {
            await client.query(
              "INSERT INTO chat_rooms_members (room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
              [room.id, memberId],
            );
          }
        }
      }

      await client.query("COMMIT");

      const membersResult = await client.query(
        `
        SELECT u.id, u.username, u.first_name, u.last_name
        FROM chat_rooms_members crm
        JOIN users u ON crm.user_id = u.id
        WHERE crm.room_id = $1`,
        [room.id],
      );

      room.members = membersResult.rows.map((member) => ({
        user_id: member.id,
        username: member.username,
        first_name: member.first_name,
        last_name: member.last_name,
      }));

      // Notify all members about the new room
      try {
        const chatService = getChatService();
        const allMemberIds = [userId, ...(member_ids || [])];
        await chatService.notifyNewRoom(allMemberIds, room);
      } catch (notifyError) {
        console.error("Error notifying users about new room:", notifyError);
        // Don't fail the request if notification fails
      }

      return res.status(201).json(room);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating chat room:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export const getUserChatRooms = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  const client = await pool.connect();
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await client.query(
      `
      SELECT
        cr.*,
        COALESCE(
          (
            SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'user_id', u.id,
                'username', u.username,
                'first_name', u.first_name,
                'last_name', u.last_name,
                'avatar_url', u.avatar_url
              )
            )
            FROM chat_rooms_members crm_inner
            JOIN users u ON crm_inner.user_id = u.id
            WHERE crm_inner.room_id = cr.id
          ),
          '[]'::json
        ) as members,
        (
          SELECT JSON_BUILD_OBJECT(
            'id', cm.id,
            'user_id', cm.user_id,
            'message', cm.message,
            'created_at', cm.created_at,
            'username', u2.username,
            'first_name', u2.first_name,
            'last_name', u2.last_name
          )
          FROM chat_messages cm
          JOIN users u2 ON cm.user_id = u2.id
          WHERE cm.room_id = cr.id
          ORDER BY cm.created_at DESC
          LIMIT 1
        ) as last_message
      FROM chat_rooms cr
      JOIN chat_rooms_members crm ON cr.id = crm.room_id
      WHERE crm.user_id = $1
      ORDER BY cr.updated_at DESC
    `,
      [userId],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export const getChatRoomMessages = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  const client = await pool.connect();
  try {
    const { room_id } = req.params;
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const memberCheck = await client.query(
      "SELECT 1 FROM chat_rooms_members WHERE room_id = $1 AND user_id = $2",
      [room_id, userId],
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await client.query(
      `
      SELECT
        cm.*,
        u.username,
        u.first_name,
        u.last_name
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.room_id = $1
      ORDER BY cm.created_at ASC
      LIMIT $2 OFFSET $3
    `,
      [room_id, limit, offset],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export const validateCreateRoom = [
  body("name")
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage("Room name must be 1-255 characters"),
  body("is_group")
    .optional()
    .isBoolean()
    .withMessage("is_group must be a boolean"),
  body("member_ids")
    .optional()
    .isArray()
    .withMessage("member_ids must be an array"),
];

export const validateSendMessage = [
  body("message")
    .notEmpty()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be 1-1000 characters"),
  body("message_type")
    .optional()
    .isIn(["text", "image", "file"])
    .withMessage("Invalid message type"),
];

export const validateCreateDM = [
  body("recipient_id")
    .isInt({ min: 1 })
    .withMessage("Valid recipient ID is required"),
];
