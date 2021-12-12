import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import { createConnection } from 'typeorm';
import 'reflect-metadata';

import { logger } from './MiddleWare/logger';
import router from './router';

createConnection()
  .then(() => {
    // 初始化 Koa 应用实例
    const app = new Koa();
    // 注册中间件
    app.use(logger());
    app.use(cors());
    app.use(bodyParser());
    app.use(router.routes()).use(router.allowedMethods());
    // 运行服务器
    app.listen(3000);
  })
  .catch((err: string) => console.log('TypeORM connection error:', err));
