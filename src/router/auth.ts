import Router from '@koa/router';

import AuthController from '../Controller/auth';

const login = new Router();
login.post('/login', AuthController.login);

const register = new Router();
register.post('/register', AuthController.register);

const tokenValidate = new Router();
tokenValidate.post('/validate', AuthController.tokenValidate);

export { login, register, tokenValidate };
