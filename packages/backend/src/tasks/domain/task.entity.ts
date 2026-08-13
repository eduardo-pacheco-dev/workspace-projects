export interface TaskProps {
  id?: number;
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueAt?: string | null;
  project?: string | null;
  client?: string | null;
  assignedTo?: string | null;
  parentId?: number | null;
  subtasks?: Task[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Task {
  id?: number;
  title?: string;
  description?: string | null;
  status: string;
  priority: string;
  dueAt?: string | null;
  project?: string | null;
  client?: string | null;
  assignedTo?: string | null;
  parentId?: number | null;
  subtasks?: Task[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: TaskProps) {
    Object.assign(this, { status: 'pending', priority: 'medium', ...props });
  }
}
