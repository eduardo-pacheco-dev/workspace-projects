import { Task } from './task.entity';
import { TASK_PRIORITIES, TASK_STATUSES } from './task-rules';

describe('Task domain', () => {
  describe('constructor', () => {
    it('should default status to pending and priority to medium', () => {
      const task = new Task({ title: 'A' });
      expect(task.status).toBe('pending');
      expect(task.priority).toBe('medium');
    });

    it('should preserve provided values', () => {
      const task = new Task({ id: 1, title: 'A', status: 'completed', priority: 'urgent', parentId: 5 });

      expect(task.id).toBe(1);
      expect(task.status).toBe('completed');
      expect(task.priority).toBe('urgent');
      expect(task.parentId).toBe(5);
    });
  });

  describe('constants', () => {
    it('should list the statuses and priorities', () => {
      expect(TASK_STATUSES).toEqual(['pending', 'in_progress', 'completed', 'cancelled']);
      expect(TASK_PRIORITIES).toEqual(['low', 'medium', 'high', 'urgent']);
    });
  });
});
