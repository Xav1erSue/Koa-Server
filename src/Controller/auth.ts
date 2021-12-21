import { Context } from 'koa';
import * as argon2 from 'argon2';
import { getManager } from 'typeorm';
import { User } from '../entity/user';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constants';

export default class AuthController {
  public static async login(ctx: Context) {
    const userRepository = getManager().getRepository(User);
    const user = await userRepository
      .createQueryBuilder()
      .where({ name: ctx.request.body.name })
      .addSelect('User.password')
      .getOne();

    // 如果没有查询到对应用户
    if (!user) {
      ctx.status = 404;
      ctx.body = { code: 40002, message: '用户名不存在' };
    }
    // 密码正确，签发token
    else if (await argon2.verify(user.password, ctx.request.body.password)) {
      ctx.status = 200;
      ctx.body = { code: 2000, message: '登录成功', token: jwt.sign({ id: user.id }, JWT_SECRET) };
    }
    // 密码错误，拒绝登录
    else {
      ctx.status = 403;
      ctx.body = { code: 40003, message: '密码错误' };
    }
  }

  // 首先根据用户名（请求体中的 name 字段）查询对应的用户
  // 如果该用户不存在，则直接返回 401
  // 存在的话再通过 argon2.verify 来验证请求体中的明文密码 password 是否和数据库中存储的加密密码是否一致，
  // 如果一致则通过 jwt.sign 签发 Token，如果不一致则还是返回 401。
  // 这里的 Token 负载就是标识用户 ID 的对象 { id: user.id }
  // 这样后面鉴权成功后就可以通过 ctx.user.id 来获取用户 ID。

  // 注册用户
  public static async register(ctx: Context) {
    const userRepository = getManager().getRepository(User);
    const userInside = await userRepository
      .createQueryBuilder()
      .where({ name: ctx.request.body.name })
      .getOne();
    if (userInside) {
      ctx.status = 403;
      ctx.body = { code: 40001, message: '当前用户名已被注册' };
    } else {
      const newUser = new User();
      // 后续进行后端格式检查
      newUser.name = ctx.request.body.name;
      newUser.email = ctx.request.body.email;
      newUser.phoneNumber = ctx.request.body.phoneNumber;
      // 密码加密储存
      newUser.password = await argon2.hash(ctx.request.body.password);

      // 保存到数据库
      await userRepository.save(newUser);
      ctx.status = 201;
      ctx.body = { code: 2000, message: '注册成功' };
    }
  }

  public static async tokenValidate(ctx: Context) {
    // 获取请求该方法的用户
    const uid = ctx.state.user.id;
    const userRepository = getManager().getRepository(User);
    const user = await userRepository.findOne(uid);
    ctx.status = 200;
    ctx.body = {
      code: 2000,
      message: 'token合法',
      user: user,
    };
  }
}
