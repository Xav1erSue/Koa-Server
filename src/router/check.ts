import Router from '@koa/router';
import CheckController from '../Controller/check';

const check = new Router();
check.post('/', CheckController.checkInfo);

export default check;
