import Router from '@koa/router';
import ListController from '../Controller/list';

const todo = new Router({ prefix: '/todo' });

todo.get('/', ListController.showItem);
todo.get('/:id', ListController.showItem);
todo.put('/add', ListController.addItem);
todo.del('/del/:id', ListController.delItem);

const doing = new Router({ prefix: '/doing' });

doing.get('/', ListController.showItem);
doing.get('/:id', ListController.showItem);
doing.put('/add', ListController.addItem);
doing.del('/del/:id', ListController.delItem);

const done = new Router({ prefix: '/done' });

done.get('/', ListController.showItem);
done.get('/:id', ListController.showItem);
done.put('/add', ListController.addItem);
done.del('/del/:id', ListController.delItem);

const token = new Router({ prefix: '/token' });

token.post('/');

export { todo, doing, done };
