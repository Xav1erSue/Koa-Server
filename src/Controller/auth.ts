import { Context } from 'koa';
import * as argon2 from 'argon2';
import { getManager } from 'typeorm';
import { User } from '../entity/user';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constants';
import dayjs from 'dayjs';
import sendSMS from '../utils/sms';
import { start } from 'repl';
export default class AuthController {
  // 为每一个注册登录的用户储存与手机号相对应的短信验证码
  // 储存格式为 [phoneNumber, { SMSCode, startTime }]
  public static codeMap = new Map();

  // 登录Controller
  public static async login(ctx: Context) {
    try {
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
        ctx.body = {
          code: 2000,
          message: '登录成功',
          token: jwt.sign({ id: user.id }, JWT_SECRET),
        };
      }
      // 密码错误，拒绝登录
      else {
        ctx.status = 403;
        ctx.body = { code: 40003, message: '密码错误' };
      }
    } catch (e) {
      console.log(e);
      ctx.status = 500;
      ctx.body = {
        code: 40000,
        message: '未知错误，请联系网站负责人',
      };
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
    try {
      const userRepository = getManager().getRepository(User);
      const userInside = await userRepository
        .createQueryBuilder()
        .where({ name: ctx.request.body.name })
        .getOne();
      if (userInside) {
        ctx.status = 403;
        ctx.body = { code: 40001, message: '当前用户名已被注册' };
        return;
      } else if (
        ctx.request.body.SMSCode != AuthController.codeMap.get(ctx.request.body.phoneNumber).SMSCode
      ) {
        console.log(ctx.request.body.SMSCode);
        console.log(AuthController.codeMap.get(ctx.request.body.phoneNumber).SMSCode);
        ctx.status = 403;
        ctx.body = { code: 40006, message: '短信验证码错误' };
        return;
      } else {
        // 短信验证码正确,删除codeMap中对应的键值对
        AuthController.codeMap.delete(ctx.request.body.phoneNumber);
        const newUser = new User();
        newUser.name = ctx.request.body.name;
        newUser.email = ctx.request.body.email;
        newUser.phoneNumber = ctx.request.body.phoneNumber;
        // 密码加密储存
        newUser.password = await argon2.hash(ctx.request.body.password);

        // 保存到数据库
        await userRepository.save(newUser);
        await userRepository.findOne(newUser);
        ctx.status = 201;
        ctx.body = {
          code: 2000,
          message: '注册成功',
          token: jwt.sign({ id: newUser.id }, JWT_SECRET),
        };
      }
    } catch {
      ctx.status = 500;
      ctx.body = {
        code: 40000,
        message: '未知错误，请联系网站负责人',
      };
    }
  }

  public static async tokenValidate(ctx: Context) {
    try {
      // 获取请求该方法的用户
      const uid = ctx.state.user.id;
      const userRepository = getManager().getRepository(User);
      const user = await userRepository.findOne(uid);
      if (user) {
        ctx.status = 200;
        ctx.body = {
          code: 2000,
          message: 'token合法',
          user: user,
        };
      } else {
        ctx.status = 410;
        ctx.body = {
          code: 40005,
          message: 'token持有者已注销',
        };
      }
    } catch {
      ctx.status = 500;
      ctx.body = {
        code: 40000,
        message: '未知错误，请联系网站负责人',
      };
    }
  }
  public static async getSMSCode(ctx: Context) {
    try {
      const now = dayjs();
      const mapItem = AuthController.codeMap.get(ctx.request.body.phoneNumber) || {};
      const _startTime = mapItem.startTime || dayjs();
      const between = dayjs(now).diff(dayjs(_startTime), 'seconds');
      // 如果已经发送过短信验证码,并且距离上次时间小于30秒,则不再次发送
      if (_startTime && between && between < 30) {
        ctx.status = 403;
        ctx.body = { code: 40007, message: '短信验证码发送过于频繁' };
      } else {
        // 如果已经发送过短信验证码,则删除已有键值对
        if (_startTime) AuthController.codeMap.delete(ctx.request.body.phoneNumber);
        const phoneNumber = ctx.request.body.phoneNumber;
        const SMSCode = Math.floor(Math.random() * 1000000);
        const startTime = dayjs();
        sendSMS(phoneNumber, SMSCode);
        AuthController.codeMap.set(phoneNumber, { SMSCode, startTime });
        ctx.status = 200;
        ctx.body = { code: 2000, message: '短信验证码已发送' };
      }
    } catch (e) {
      console.log(e);
      ctx.status = 500;
      ctx.body = {
        code: 40000,
        message: '未知错误，请联系网站负责人',
      };
    }
  }
}
