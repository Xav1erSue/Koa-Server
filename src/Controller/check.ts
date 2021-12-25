import check from '@/router/check';
import { Context } from 'koa';
import { getManager } from 'typeorm';
import { User } from '../entity/user';

export default class CheckController {
  public static async checkInfo(ctx: Context) {
    const query = ctx.request.body;
    const userRepository = getManager().getRepository(User);
    const info = await userRepository.findOne(query);
    if (!info) {
      ctx.status = 200;
      ctx.body = { code: 2000, message: '可以注册' };
    } else {
      ctx.status = 409;
      ctx.body = { code: 40001, message: '该字段已被注册' };
    }
  }
}
