import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: number;
    user_id: string;
    email?: string;
  };
}
