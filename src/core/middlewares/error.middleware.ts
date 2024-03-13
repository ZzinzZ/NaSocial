import { HttpException } from "@core/exceptions";
import { Logger } from "@core/utils";
import { NextFunction, Request, Response } from "express";

const errorMiddleware = (err: HttpException, req: Request, res: Response, next: NextFunction) => {
    const status: number = err.status || 500;
    const message: string = err.message || 'Something went wrong'

    Logger.error(`[ERROR] - Status : ${status} - Message : ${message}`);
    res.status(status).json({ message: message });
};

export default errorMiddleware;