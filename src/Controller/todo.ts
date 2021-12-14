import { Context } from 'koa';
import { getManager } from 'typeorm';
import { Todo } from '../entity/todolist';

export default class TodoController {
  // 查询todo
  public static async showTodo(ctx: Context) {
    const uid = ctx.state.user.id;
    const tid = ctx.params.id;
    const todoRepository = getManager().getRepository(Todo);
    if (tid) {
      const todo = await todoRepository.findOne({
        id: tid,
        user: uid,
      });
      console.log(todo);
      if (todo) {
        ctx.status = 200;
        ctx.body = { code: 2000, message: '查询成功', data: todo };
      } else {
        ctx.status = 404;
        ctx.body = { code: 40002, message: '查询项不存在', data: '' };
      }
    } else {
      // 加载该用户的所有todo
      const todoList = await todoRepository.find({
        user: uid,
      });
      ctx.status = 200;
      ctx.body = { code: 2000, message: '查询成功', data: todoList };
    }
  }

  // 新增todo
  public static async addTodo(ctx: Context) {
    const todoRepository = getManager().getRepository(Todo);

    const newTodo = new Todo();
    newTodo.title = ctx.request.body.title;
    newTodo.description = ctx.request.body.description;
    newTodo.time = ctx.request.body.time;
    // 当前请求用户id
    newTodo.user = ctx.state.user.id;
    await todoRepository.save(newTodo);
    ctx.status = 201;
    ctx.body = { code: 2000, message: '查询成功', data: newTodo };
  }

  public static async delTodo(ctx: Context) {
    // 获取用户id和todoid
    const uid = ctx.state.user.id;
    const tid = ctx.params.id;
    const todoRepository = getManager().getRepository(Todo);

    const todo = await todoRepository.findOne({
      id: tid,
      user: uid,
    });
    if (todo) {
      await todoRepository
        // 比remove更高效
        .createQueryBuilder()
        .delete()
        .from(Todo)
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
