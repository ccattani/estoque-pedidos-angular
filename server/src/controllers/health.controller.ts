import type { Request, Response } from "express";

export const healthCheck = (_request: Request, response: Response) => {
  response.json({ status: "ok" });
};
