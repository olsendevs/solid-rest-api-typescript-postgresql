import express, { Request, Response } from "express";
import { ApiError, NotFoundError } from "../helpers/api-errors";

export const testRouter = express.Router();

testRouter.get('/', async (request, response) => {
    throw new NotFoundError('teste');
    response.send('The service is working.');
});
