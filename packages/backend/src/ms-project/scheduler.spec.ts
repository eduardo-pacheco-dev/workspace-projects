import { scheduleProject } from './scheduler';

const WEEKDAYS = [1, 2, 3, 4, 5];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

describe('scheduleProject', () => {
  it('should schedule a simple FS chain across working days', () => {
    const result = scheduleProject(
      '2026-08-03',
      WEEKDAYS,
      [
        { id: 1, durationDays: 3 },
        { id: 2, durationDays: 2 },
      ],
      [{ taskId: 2, predecessorTaskId: 1, type: 'FS', lagDays: 0 }],
    );

    expect(result.startDate).toBe('2026-08-03');
    expect(result.finishDate).toBe('2026-08-07');
    expect(result.durationDays).toBe(5);

    const t1 = result.byTask.get(1)!;
    const t2 = result.byTask.get(2)!;
    expect(t1.start).toBe('2026-08-03');
    expect(t1.finish).toBe('2026-08-05');
    expect(t2.start).toBe('2026-08-06');
    expect(t2.finish).toBe('2026-08-07');

    expect(t1.critical).toBe(true);
    expect(t1.slackDays).toBe(0);
    expect(t2.critical).toBe(true);
    expect(result.criticalTasks).toEqual([1, 2]);
  });

  it('should give slack to tasks that can finish later', () => {
    const result = scheduleProject(
      '2026-08-03',
      WEEKDAYS,
      [
        { id: 1, durationDays: 2 },
        { id: 2, durationDays: 3 },
      ],
      [],
    );

    expect(result.finishDate).toBe('2026-08-05');

    const t1 = result.byTask.get(1)!;
    const t2 = result.byTask.get(2)!;
    expect(t1.slackDays).toBe(1);
    expect(t1.critical).toBe(false);
    expect(t2.slackDays).toBe(0);
    expect(t2.critical).toBe(true);
  });

  it('should skip weekends when computing dates', () => {
    const result = scheduleProject(
      '2026-08-07', // Friday
      WEEKDAYS,
      [{ id: 1, durationDays: 3 }],
      [],
    );

    const t1 = result.byTask.get(1)!;
    expect(t1.start).toBe('2026-08-07');
    expect(t1.finish).toBe('2026-08-11'); // Mon Aug 10, Tue Aug 11
  });

  it('should apply lag on FS dependencies', () => {
    const result = scheduleProject(
      '2026-08-03',
      WEEKDAYS,
      [
        { id: 1, durationDays: 3 },
        { id: 2, durationDays: 2 },
      ],
      [{ taskId: 2, predecessorTaskId: 1, type: 'FS', lagDays: 2 }],
    );

    // T1 finishes Wed Aug 05; +2 working days => Mon Aug 10
    expect(result.byTask.get(2)!.start).toBe('2026-08-10');
    expect(result.byTask.get(2)!.finish).toBe('2026-08-11');
  });

  it('should handle SS dependencies', () => {
    const result = scheduleProject(
      '2026-08-03',
      WEEKDAYS,
      [
        { id: 1, durationDays: 4 },
        { id: 2, durationDays: 3 },
      ],
      [{ taskId: 2, predecessorTaskId: 1, type: 'SS', lagDays: 1 }],
    );

    const t2 = result.byTask.get(2)!;
    expect(t2.start).toBe('2026-08-04'); // T1 start +1 working day
    expect(t2.finish).toBe('2026-08-06');
  });

  it('should handle FF dependencies', () => {
    const result = scheduleProject(
      '2026-08-03',
      WEEKDAYS,
      [
        { id: 1, durationDays: 4 },
        { id: 2, durationDays: 2 },
      ],
      [{ taskId: 2, predecessorTaskId: 1, type: 'FF', lagDays: 1 }],
    );

    const t2 = result.byTask.get(2)!;
    // T1 finishes Thu Aug 06; T2 must finish on/after Fri Aug 07 -> starts Thu Aug 06
    expect(t2.start).toBe('2026-08-06');
    expect(t2.finish).toBe('2026-08-07');
  });

  it('should schedule milestones as zero-duration points', () => {
    const result = scheduleProject(
      '2026-08-03',
      WEEKDAYS,
      [
        { id: 1, durationDays: 2 },
        { id: 2, durationDays: 0 },
      ],
      [{ taskId: 2, predecessorTaskId: 1, type: 'FS', lagDays: 0 }],
    );

    expect(result.byTask.get(2)!.start).toBe('2026-08-05');
    expect(result.byTask.get(2)!.finish).toBe('2026-08-05');
    expect(result.byTask.get(2)!.critical).toBe(true);
  });

  it('should use a 7-day calendar when configured', () => {
    const result = scheduleProject(
      '2026-08-03',
      ALL_DAYS,
      [{ id: 1, durationDays: 5 }],
      [],
    );

    expect(result.byTask.get(1)!.finish).toBe('2026-08-07');
    expect(result.durationDays).toBe(5);
  });

  it('should snap a non-working project start to the next working day', () => {
    const result = scheduleProject(
      '2026-08-08', // Saturday
      WEEKDAYS,
      [{ id: 1, durationDays: 1 }],
      [],
    );

    expect(result.startDate).toBe('2026-08-10');
    expect(result.byTask.get(1)!.start).toBe('2026-08-10');
  });

  it('should return empty schedule for projects without tasks', () => {
    const result = scheduleProject('2026-08-03', WEEKDAYS, [], []);

    expect(result.durationDays).toBe(0);
    expect(result.criticalTasks).toEqual([]);
  });

  it('should ignore dependencies that reference unknown tasks', () => {
    const result = scheduleProject(
      '2026-08-03',
      WEEKDAYS,
      [{ id: 1, durationDays: 2 }],
      [{ taskId: 2, predecessorTaskId: 1, type: 'FS', lagDays: 0 }],
    );

    expect(result.byTask.get(1)!.start).toBe('2026-08-03');
    expect(result.finishDate).toBe('2026-08-04');
  });

  it('should not loop forever when the dependency graph has a cycle', () => {
    const result = scheduleProject(
      '2026-08-03',
      WEEKDAYS,
      [
        { id: 1, durationDays: 2 },
        { id: 2, durationDays: 2 },
      ],
      [
        { taskId: 2, predecessorTaskId: 1, type: 'FS', lagDays: 0 },
        { taskId: 1, predecessorTaskId: 2, type: 'FS', lagDays: 0 },
      ],
    );

    expect(result.byTask.size).toBe(2);
    expect(result.byTask.get(1)!.finish).toBe('2026-08-05');
    expect(result.byTask.get(2)!.finish).toBe('2026-08-07');
    expect(result.finishDate).toBe('2026-08-07');
  });
});
