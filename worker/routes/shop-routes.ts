import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { HonoContext } from '../types';

const EXTERNAL_API_BASE = 'https://b4b7cd081fa7.ngrok-free.app';

const createMessageSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string(),
});

const feedbackSchema = z.object({
  sessionId: z.string(),
  messageID: z.string(),
  productId: z.string(),
  rating: z.number().min(1).max(5),
  reason: z.array(z.string()).optional(),
  reason_text: z.string().optional(),
  user_query: z.string().optional(),
  feedback_type: z.string().optional(),
});

export const shopRoutes = new Hono<HonoContext>()
  .post(
    '/message',
    zValidator('json', createMessageSchema),
    async (c) => {
      try {
        const { sessionId, message } = c.req.valid('json');

        const formData = new FormData();
        if (sessionId) {
          formData.append('sessionId', sessionId);
        }
        formData.append('message', message);

        const response = await fetch(`${EXTERNAL_API_BASE}/api/chat/message`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`External API error: ${response.statusText}`);
        }

        const data = await response.json();
        return c.json(data);
      } catch (error) {
        console.error('Error in /message:', error);
        return c.json({ error: 'Failed to send message' }, 500);
      }
    }
  )
  .get('/sessions/:userId', async (c) => {
    try {
      const userId = c.req.param('userId');
      const response = await fetch(`${EXTERNAL_API_BASE}/api/sessions/user/${userId}`);

      if (!response.ok) {
        throw new Error(`External API error: ${response.statusText}`);
      }

      const data = await response.json();
      return c.json(data);
    } catch (error) {
      console.error('Error in /sessions/:userId:', error);
      return c.json({ error: 'Failed to fetch sessions' }, 500);
    }
  })
  .get('/sessions/messages/:sessionId', async (c) => {
    try {
      const sessionId = c.req.param('sessionId');
      const response = await fetch(`${EXTERNAL_API_BASE}/api/sessions/messages/${sessionId}`);

      if (!response.ok) {
        throw new Error(`External API error: ${response.statusText}`);
      }

      const data = await response.json();
      return c.json(data);
    } catch (error) {
      console.error('Error in /sessions/messages/:sessionId:', error);
      return c.json({ error: 'Failed to fetch session messages' }, 500);
    }
  })
  .post(
    '/feedback',
    zValidator('json', feedbackSchema),
    async (c) => {
      try {
        const feedbackData = c.req.valid('json');

        const response = await fetch(`${EXTERNAL_API_BASE}/api/feedback/product`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData),
        });

        if (!response.ok) {
          throw new Error(`External API error: ${response.statusText}`);
        }

        const data = await response.json();
        return c.json(data);
      } catch (error) {
        console.error('Error in /feedback:', error);
        return c.json({ error: 'Failed to submit feedback' }, 500);
      }
    }
  );
