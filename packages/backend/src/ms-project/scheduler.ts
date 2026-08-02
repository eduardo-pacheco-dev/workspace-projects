export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface SchedulerTask {
  id: number;
  durationDays: number;
}

export interface SchedulerDependency {
  taskId: number; // successor
  predecessorTaskId: number;
  type: DependencyType;
  lagDays: number;
}

export interface TaskSchedule {
  start: string;
  finish: string;
  earlyStart: string;
  earlyFinish: string;
  lateStart: string;
  lateFinish: string;
  slackDays: number;
  critical: boolean;
}

export interface ScheduleResult {
  startDate: string;
  finishDate: string;
  durationDays: number;
  criticalTasks: number[];
  byTask: Map<number, TaskSchedule>;
}

const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5];

const pad2 = (n: number) => String(n).padStart(2, '0');

const toDateString = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const parseDate = (s: string): Date => {
  const [y, m, day] = s.split('-').map(Number);
  return new Date(y, m - 1, day);
};

const addDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const isWorking = (d: Date, working: Set<number>): boolean => working.has(d.getDay());

const snapForward = (d: Date, working: Set<number>): Date => {
  let cur = new Date(d);
  while (!isWorking(cur, working)) cur = addDays(cur, 1);
  return cur;
};

const snapBackward = (d: Date, working: Set<number>): Date => {
  let cur = new Date(d);
  while (!isWorking(cur, working)) cur = addDays(cur, -1);
  return cur;
};

/**
 * Returns the date `n` working-day steps after `start`.
 * addWorkingDays(X, 0) === X, addWorkingDays(X, 1) === next working day.
 * Negative `n` moves backwards.
 */
const addWorkingDays = (start: string, n: number, working: Set<number>): string => {
  if (n === 0) return toDateString(snapForward(parseDate(start), working));
  const step = n > 0 ? 1 : -1;
  let cur = n > 0 ? snapForward(parseDate(start), working) : snapBackward(parseDate(start), working);
  let remaining = Math.abs(n);
  while (remaining > 0) {
    cur = addDays(cur, step);
    if (isWorking(cur, working)) remaining--;
  }
  return toDateString(cur);
};

/** Number of working days between `start` and `end`, inclusive of both. */
const workingDaysBetween = (start: string, end: string, working: Set<number>): number => {
  let cur = snapForward(parseDate(start), working);
  const target = parseDate(end);
  let count = 0;
  while (cur.getTime() <= target.getTime()) {
    count++;
    cur = addDays(cur, 1);
    while (!isWorking(cur, working)) cur = addDays(cur, 1);
  }
  return count;
};

/** Kahn topological order; cycle members are appended last (deterministic by id). */
const topoOrder = (taskIds: number[], deps: SchedulerDependency[]): number[] => {
  const indeg = new Map<number, number>();
  const succs = new Map<number, number[]>();
  for (const id of taskIds) indeg.set(id, 0);
  for (const d of deps) {
    indeg.set(d.taskId, (indeg.get(d.taskId) ?? 0) + 1);
    const list = succs.get(d.predecessorTaskId) ?? [];
    list.push(d.taskId);
    succs.set(d.predecessorTaskId, list);
  }
  const queue = taskIds.filter((id) => (indeg.get(id) ?? 0) === 0).sort((a, b) => a - b);
  const order: number[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const next of succs.get(id) ?? []) {
      const d = (indeg.get(next) ?? 1) - 1;
      indeg.set(next, d);
      if (d === 0) {
        queue.push(next);
        queue.sort((a, b) => a - b);
      }
    }
  }
  const remaining = taskIds.filter((id) => (indeg.get(id) ?? 0) > 0).sort((a, b) => a - b);
  return [...order, ...remaining];
};

export function scheduleProject(
  projectStart: string,
  workingDays: number[],
  tasks: SchedulerTask[],
  dependencies: SchedulerDependency[],
): ScheduleResult {
  const working = new Set(workingDays.length > 0 ? workingDays : DEFAULT_WORKING_DAYS);
  const startDate = toDateString(snapForward(parseDate(projectStart), working));

  if (tasks.length === 0) {
    return { startDate, finishDate: startDate, durationDays: 0, criticalTasks: [], byTask: new Map() };
  }

  const taskIds = new Set(tasks.map((t) => t.id));
  const deps = dependencies.filter((d) => taskIds.has(d.taskId) && taskIds.has(d.predecessorTaskId));

  const predsByTask = new Map<number, SchedulerDependency[]>();
  const succsByTask = new Map<number, SchedulerDependency[]>();
  for (const d of deps) {
    const preds = predsByTask.get(d.taskId) ?? [];
    preds.push(d);
    predsByTask.set(d.taskId, preds);

    const succs = succsByTask.get(d.predecessorTaskId) ?? [];
    succs.push(d);
    succsByTask.set(d.predecessorTaskId, succs);
  }

  const taskById = new Map(tasks.map((t) => [t.id, t]));
  const dur = (id: number) => taskById.get(id)?.durationDays ?? 1;
  const effDuration = (d: number) => (d === 0 ? 0 : d - 1);

  const earlyStart = new Map<number, string>();
  const earlyFinish = new Map<number, string>();
  const lateStart = new Map<number, string>();
  const lateFinish = new Map<number, string>();

  for (const id of taskIds) {
    earlyStart.set(id, startDate);
    earlyFinish.set(id, startDate);
    lateStart.set(id, startDate);
    lateFinish.set(id, startDate);
  }

  const order = topoOrder([...taskIds], deps);

  // Forward pass: earliest start date that satisfies all dependency constraints.
  const successorESConstraint = (d: SchedulerDependency): string => {
    const predES = earlyStart.get(d.predecessorTaskId)!;
    const predEF = earlyFinish.get(d.predecessorTaskId)!;
    const back = Math.max(0, dur(d.taskId) - 1);
    switch (d.type) {
      case 'FS':
        return addWorkingDays(predEF, d.lagDays + 1, working);
      case 'SS':
        return addWorkingDays(predES, d.lagDays, working);
      case 'FF':
        return addWorkingDays(addWorkingDays(predEF, d.lagDays, working), -back, working);
      case 'SF':
        return addWorkingDays(addWorkingDays(predES, d.lagDays, working), -back, working);
    }
  };

  for (const id of order) {
    let es = startDate;
    for (const d of predsByTask.get(id) ?? []) {
      const c = successorESConstraint(d);
      if (parseDate(c).getTime() > parseDate(es).getTime()) es = c;
    }
    earlyStart.set(id, es);
    const d = dur(id);
    earlyFinish.set(id, d === 0 ? es : addWorkingDays(es, d - 1, working));
  }

  let projectFinish = startDate;
  for (const id of order) {
    const ef = earlyFinish.get(id)!;
    if (parseDate(ef).getTime() > parseDate(projectFinish).getTime()) projectFinish = ef;
  }

  for (const id of taskIds) {
    lateFinish.set(id, projectFinish);
    lateStart.set(id, projectFinish);
  }

  // Backward pass: latest finish that does not delay the project.
  const predecessorLFConstraint = (succId: number, d: SchedulerDependency): string => {
    const sLS = lateStart.get(succId)!;
    const sLF = lateFinish.get(succId)!;
    const forward = Math.max(0, dur(d.predecessorTaskId) - 1);
    switch (d.type) {
      case 'FS':
        return addWorkingDays(sLS, -(d.lagDays + 1), working);
      case 'SS':
        return addWorkingDays(addWorkingDays(sLS, -d.lagDays, working), forward, working);
      case 'FF':
        return addWorkingDays(sLF, -d.lagDays, working);
      case 'SF':
        return addWorkingDays(addWorkingDays(sLF, -d.lagDays, working), forward, working);
    }
  };

  for (const id of [...order].reverse()) {
    let lf = projectFinish;
    for (const d of succsByTask.get(id) ?? []) {
      const c = predecessorLFConstraint(d.taskId, d);
      if (parseDate(c).getTime() < parseDate(lf).getTime()) lf = c;
    }
    lateFinish.set(id, lf);
    const d = dur(id);
    lateStart.set(id, d === 0 ? lf : addWorkingDays(lf, -(d - 1), working));
  }

  const byTask = new Map<number, TaskSchedule>();
  const criticalTasks: number[] = [];
  for (const id of order) {
    const es = earlyStart.get(id)!;
    const ef = earlyFinish.get(id)!;
    const ls = lateStart.get(id)!;
    const lf = lateFinish.get(id)!;
    const slackDays = workingDaysBetween(es, ls, working) - 1;
    const critical = slackDays === 0;
    if (critical) criticalTasks.push(id);
    byTask.set(id, {
      start: es,
      finish: ef,
      earlyStart: es,
      earlyFinish: ef,
      lateStart: ls,
      lateFinish: lf,
      slackDays,
      critical,
    });
  }

  const durationDays = workingDaysBetween(startDate, projectFinish, working);
  return { startDate, finishDate: projectFinish, durationDays, criticalTasks, byTask };
}
