import { Context } from 'koa';
import { getManager } from 'typeorm';
import * as entities from '../entity/todolist';
export default class ListController {
  // 查询信息
  public static async showItem(ctx: Context) {
    // 用户id以及请求id
    const uid = ctx.state.user.id;
    const tid = ctx.params.id;
    let key;
    let url = ctx.url.match(/(?<=\/list\/)\w+/);
    url ? (key = url[0].replace(/^\S/, (s) => s.toUpperCase())) : (key = '');
    // 动态键选择仓库
    const Repository = getManager().getRepository(entities[key]);
    if (tid) {
      const item = await Repository.findOne({
        id: tid,
        user: uid,
      });
      if (item) {
        ctx.status = 200;
        ctx.body = { code: 2000, message: '查询成功', data: item };
      } else {
        ctx.status = 404;
        ctx.body = { code: 40002, message: '查询项不存在', data: '' };
      }
    } else {
      // 加载该用户的所有列表项目
      const list = await Repository.find({
        user: uid,
      });
      ctx.status = 200;
      ctx.body = { code: 2000, message: '查询成功', data: list };
    }
  }

  // 新增todo
  public static async addItem(ctx: Context) {
    let key;
    let url = ctx.url.match(/(?<=\/list\/)\w+/);
    url ? (key = url[0].replace(/^\S/, (s) => s.toUpperCase())) : (key = '');
    // 动态键选择仓库
    const Repository = getManager().getRepository(entities[key]);

    const newItem = new entities[key]();
    newItem.title = ctx.request.body.title;
    newItem.description = ctx.request.body.description;
    newItem.time = ctx.request.body.time;
    // 当前请求用户id
    newItem.user = ctx.state.user.id;
    await Repository.save(newItem);
    ctx.status = 201;
    ctx.body = { code: 2000, message: '查询成功', data: newItem };
  }

  public static async delItem(ctx: Context) {
    // 获取用户id和todoid
    const uid = ctx.state.user.id;
    const tid = ctx.params.id;
    let key;
    let url = ctx.url.match(/(?<=\/list\/)\w+/);
    url ? (key = url[0].replace(/^\S/, (s) => s.toUpperCase())) : (key = '');
    // 动态键选择仓库
    const Repository = getManager().getRepository(entities[key]);

    const item = await Repository.findOne({
      id: tid,
      user: uid,
    });
    if (item) {
      await Repository
        // 比remove更高效
        .createQueryBuilder()
        .delete()
        .from(entities[key])
        .where('id = :id', { id: tid })
        .andWhere('user = :uid', { uid: uid })
        .execute();
      ctx.status = 200;
      ctx.body = { code: 2000, message: '删除成功', data: '' };
    } else {
      ctx.status = 404;
      ctx.body = { code: 40002, message: '查询项不存在', data: '' };
    }
  }
}
