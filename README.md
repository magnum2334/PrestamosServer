## solucion


2. nestjs se instalo en su version 10.2.1 comando de verificacion nest -v.
3. el [Configuration] se añadio en el app module comentario de gia //module Config
4. se añadio la carpeta de prima para el manejo de consultas en el proyecto
5. se añadieron DTO class-validator useGlobalPipes para validar datos enviados por POST/PUT/PATCH
6. carpeta de base datos: prisma, carpeta para los ficheros: uploads, carpeta para eventos y los log : log
7. endponit jwt: http://localhost:3000/auth/login
8. endponit crear usuario: http://localhost:3000/users/create
9. endponit : http://localhost:3000/file/create
10. endponit : http://localhost:3000/file/create
11. el evento user.login se encuentra en el controlador auth.controller.ts
12. para validar el guard cree un enpoint llamado profile donde es necesario utilizar el token bearer
13. el endpoint de login y health-check como publico verifica la creacion del decorador  @PublicEndpoint()

## Installation

crea un archivo .env y añade esto y crea una base de datos 
dejo el .env como ejemplo 
DATABASE_URL="postgresql://postgres:error404@localhost:5432/db_cibernos"
```bash
$ pnpm install
$ npx prisma migrate dev
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

