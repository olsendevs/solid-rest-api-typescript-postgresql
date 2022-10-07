# Modelo de REST SOLID API para autenticação JWT com TypeScript e PostgreSQL 
Seguem referencias para criação do modelo:
- API REST com Node.js e TypeScript | TypeORM [Atualizado] (https://www.youtube.com/watch?v=j8cm2C5-xn8)
- TypeORM Doc (https://typeorm.io)
- Tratamento de erros no Express.js com TypeScript (https://www.youtube.com/watch?v=SnxAq9ktyuo)

## Iniciando o projeto

1. Para iniciar seu ambiente use os seguintes comandos:

``yarn init -y `` (Para iniciar o projeto com a package.json)

``yarn add -D nodemon ts-node @types/express @types/node typescript``  (Para instalar todas as dependencias de desenvolvimento)

``yarn add express pg typeorm dotenv reflect-metadata`` (Para instalas as dependencias de produção)

``yarn add express-async-errors`` (Para inserir o sistema de middleware de erros do express)

``npx tsc --init`` (Para iniciar o typescript no projeto)

2. Para rodar seu projeto e builda-lo no futuro crie os seguintes scripts nas sua ``package.json``:
```
"scripts": {
    "dev": "nodemon --exec ts-node ./src/index.ts"
},
```

3. Monte seu arquivo ``tsconfig.json``:
```
{
	"compilerOptions": {
		"target": "es2018",
		"lib": ["es5", "es6", "ES2018"],
		"experimentalDecorators": true,
		"emitDecoratorMetadata": true,
		"module": "commonjs",
		"moduleResolution": "node",
		"resolveJsonModule": true,
		"allowJs": true,
		"outDir": "./dist",
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"strict": true,
		"noImplicitAny": true,
		"strictPropertyInitialization": false
	},
	"include": ["src/**/*"],
	"exclude": ["node_modules", "dist"],
	"ts-node": {
		"files": true
	}
}
```

4. Configure o TyopeORM conforme a documentação do projeto, para isso crie um arquivo chamado ``data-source.ts`` com o seguinte codigo:
```
import { DataSource } from "typeorm";

const port = process.env.DB_PORT as number | undefined

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: process.env.DB_HOST,
	port: port,
	username: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	entities: [`${__dirname}/**/entities/*.{ts,js}`],
	migrations: [`${__dirname}/**/migrations/*.{ts,js}`],
})
```

5. Agora você deve configurar seu arquivo ``.env``, segue um modelo abaixo:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=api_rest_typescript

PORT=3000

```

6. Aqui você deve criar uma sequencia de pastas para seu projeto, segue modelo:
```
- entities/
- providers/
- repositories/
- middlewares/
- helpers/
- services/
- useCases/
- routes/

```

7. Dentro da pasta routes, crie um arquivo chamado ``test.routes.ts`` com o seguinte código:
```
import express, { Request, Response } from "express";

export const testRouter = express.Router();

testRouter.get('/', async (request, response) => {
    response.send('The service is working.');
});

```

8. O proximo passo é criar o seu sistema de gerenciamento de erros, para isso comece criando dentro da pasta ``helpers`` um arquivo chamado ``api-errors.ts``, siga o modelo abaixo ao cria-lo:
```
export class ApiError extends Error {
	public readonly statusCode: number

	constructor(message: string, statusCode: number) {
		super(message)
		this.statusCode = statusCode
	}
}

export class BadRequestError extends ApiError {
	constructor(message: string) {
		super(message, 400)
	}
}

export class NotFoundError extends ApiError {
	constructor(message: string) {
		super(message, 404)
	}
}

export class UnauthorizedError extends ApiError {
	constructor(message: string) {
		super(message, 401)
	}
}
```

9. Agora você deve criar seus middlewares para gerenciamento de erros no projeto, dentro da pasta ``middlewares`` crie o arquivo ``error.ts``, segue o exemplo:
```
import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../helpers/api-erros'

export const errorMiddleware = (
	error: Error & Partial<ApiError>,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const statusCode = error.statusCode ?? 500
	const message = error.statusCode ? error.message : 'Internal Server Error'
	return res.status(statusCode).json({ message })
}

```

10. Para adicionar isso ao projeto, dentro do seu arquivo ``index.ts`` você deve adicionar o middleware de erro do seu projeto sempre antes do return, segue o modelo abaixo que pode ser utilizado como base:
```
import 'express-async-errors'
import express, { NextFunction, Request, Response } from 'express';
import { AppDataSource  } from './data-source';
import { errorMiddleware } from './middlewares/error';
import { testRouter } from './routes/test.routes';

AppDataSource.initialize().then(() => {
    const app = express();

    app.use(express.json());

	app.use(testRouter);

    console.log("API is running.");

    app.use(errorMiddleware);
    
	return app.listen(process.env.PORT)
});  

```