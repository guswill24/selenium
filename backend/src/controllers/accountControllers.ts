import type { Request, Response } from 'express';
import { getAuth } from '../middleware/auth.js';
import { login, loginSchema, previewProfileUpdate, profileUpdateSchema, toPublicUser } from '../services/authService.js';
import { listUserHistory } from '../services/historyService.js';
import { sendData } from '../utils/respond.js';
import { parseBody } from '../utils/validate.js';

export const authController = {
  login: (req: Request, res: Response) => sendData(res, login(parseBody(loginSchema, req.body))),

  /** Stateless tokens cannot be revoked server-side: the client discards the token. */
  logout: (_req: Request, res: Response) => sendData(res, { loggedOut: true }),

  me: (_req: Request, res: Response) => sendData(res, toPublicUser(getAuth(res).user)),
};

export const profileController = {
  update: (req: Request, res: Response) =>
    sendData(res, previewProfileUpdate(getAuth(res).user, parseBody(profileUpdateSchema, req.body))),
};

export const historyController = {
  list: (_req: Request, res: Response) => sendData(res, listUserHistory(getAuth(res).user.id)),
};
