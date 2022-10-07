import 'express-async-errors'
import express, { NextFunction, Request, Response } from 'express';
import { AppDataSource  } from './data-source';
import { errorMiddleware } from './middlewares/error';
import { testRouter } from './routes/test.routes';

AppDataSource.initialize().then(() => {
    const app = express()

    app.use(express.json())

	app.use(testRouter)

    console.log("API is running.")

    app.use(errorMiddleware)
	return app.listen(process.env.PORT)
});  