// 所有路由汇总到入口文件
import Router from '@koa/router';
import { login, register, tokenValidate, getSMSCode } from './auth';
import { user } from './user';
import { todo, doing, done } from './list';
import check from './check';

const unprotectedRouter = new Router();
unprotectedRouter
  .use('/auth', login.routes(), login.allowedMethods())
  .use('/auth', register.routes(), register.allowedMethods())
  .use('/auth', getSMSCode.routes(), getSMSCode.allowedMethods())
  .use('/check', check.routes(), check.allowedMethods());
const protectedRouter = new Router();
protectedRouter
  .use('/user', user.routes(), user.allowedMethods())
  .use('/list', todo.routes(), todo.allowedMethods())
  .use('/list', doing.routes(), doing.allowedMethods())
  .use('/list', done.routes(), done.allowedMethods())
  .use('/auth', tokenValidate.routes(), tokenValidate.allowedMethods());

export { protectedRouter, unprotectedRouter };
