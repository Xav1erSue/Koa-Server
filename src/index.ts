import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import { createConnection } from 'typeorm';
import jwt from 'koa-jwt';
import 'reflect-metadata';
import { protectedRouter, unprotectedRouter } from './router';
import { logger } from './MiddleWare/logger';
import { JWT_SECRET } from './constants';

createConnection()
  .then(() => {
    // 初始化 Koa 应用实例
    const app = new Koa();
    // 注册中间件
    app
      .use(logger())
      .use(cors())
      .use(bodyParser())

      // 无需 JWT Token 即可访问
      .use(unprotectedRouter.routes())

      // 注册 JWT 中间件
      .use(jwt({ secret: JWT_SECRET }))
      //  GET方法除外
      // .unless({ method: 'GET' })

      // 需要 JWT Token 才可访问
      .use(protectedRouter.routes())

      // 运行服务器
      .listen(3000, () => {
        console.log('Koa server is running...');
      });
  })
  .catch((err: string) => console.log('TypeORM connection error:', err));
