import type { Request, Response } from 'express';
import type { AuthService } from '../services/authService';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body ?? {});
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body ?? {});
    res.json(result);
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.getMe(req.userId!);
    res.json(user);
  };
}
