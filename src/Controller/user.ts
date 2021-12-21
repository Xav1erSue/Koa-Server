import { Context } from 'koa';
import { getManager } from 'typeorm';
import { User } from '../entity/user';

export default class UserController {
  // 查询所有用户信息
  public static async listUser(ctx: Context) {
    // 获取请求该方法的用户
    const uid = ctx.state.user.id;
    const userRepository = getManager().getRepository(User);
    const users = await userRepository.findOne(uid);
    if (users) {
      ctx.status = 200;
      ctx.body = {
        code: 2000,
        message: '查询成功',
        data: users,
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        code: 40002,
        message: '查询项不存在',
        data: [],
      };
    }
  }

  public static async showUserDetail(ctx: Context) {
    const userRepository = getManager().getRepository(User);
    const user = await userRepository.findOne(ctx.params.id);

    if (user) {
      ctx.status = 200;
      ctx.body = {
        code: 2000,
        message: '查询成功',
        data: user,
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        code: 40002,
        message: '查询项不存在',
        data: [],
      };
    }
  }

  public static async updateUser(ctx: Context) {
    const userId = ctx.params.id;

    if (userId !== ctx.state.user.id) {
      ctx.status = 403;
      ctx.body = {
        code: 40004,
        message: '无权进行此操作',
      };
      return;
    }
    const userRepository = getManager().getRepository(User);
    await userRepository.update(userId, ctx.request.body);
    const updatedUser = await userRepository.findOne(userId);

    if (updatedUser) {
      ctx.status = 200;
      ctx.body = updatedUser;
    } else {
      ctx.status = 404;
    }
  }

  public static async deleteUser(ctx: Context) {
    const userId = +ctx.params.id;

    if (userId !== +ctx.state.user.id) {
      ctx.status = 403;
      ctx.body = { message: '无权进行此操作' };
      return;
    }

    const userRepository = getManager().getRepository(User);
    await userRepository.delete(userId);

    ctx.status = 204;
  }
}
