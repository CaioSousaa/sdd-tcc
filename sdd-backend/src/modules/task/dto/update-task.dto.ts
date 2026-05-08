import { CreateTaskDTO } from './create-task.dto';

export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {}
