import Router from '@koa/router';

import UserController from '../Controller/user';

const user = new Router();
user.get('/', UserController.listUsers);
user.get('/:id', UserController.showUserDetail);
user.put('/:id', UserController.updateUser);
user.delete('/:id', UserController.deleteUser);

export { user };
