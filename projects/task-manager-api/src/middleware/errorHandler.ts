import type { NextFunction, Request, Response } from 'express';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ detail: 'Recurso no encontrado' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ detail: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ detail: 'Error interno del servidor' });
}

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/** Envuelve handlers async para que sus errores lleguen al errorHandler. */
export function asyncHandler(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}
