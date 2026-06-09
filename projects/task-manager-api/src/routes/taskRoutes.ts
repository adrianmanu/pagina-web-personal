import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { TaskService } from '../services/taskService';

const router = Router();
const controller = new TaskController(new TaskService());

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
