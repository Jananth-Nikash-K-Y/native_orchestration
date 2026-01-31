import { Context, Task, TaskResult } from './types';

export class Orchestrator {
  private tasks: Map<string, Task> = new Map();
  private context: Context;
  private errorTask?: string;
  private finalTask?: string;

  constructor(initialContext: Context) {
    this.context = {
      ...initialContext,
      metadata: {
        ...initialContext.metadata,
        executionPath: [],
        startTime: Date.now(),
      },
    };
  }

  registerTask(task: Task): void {
    this.tasks.set(task.name, task);
  }

  setErrorTask(taskName: string): void {
    this.errorTask = taskName;
  }

  setFinalTask(taskName: string): void {
    this.finalTask = taskName;
  }

  async execute(startTaskName: string): Promise<Context> {
    let currentTaskName: string | null = startTaskName;
    let executionCount = 0;
    const maxIterations = 1000;

    try {
      while (currentTaskName !== null && executionCount < maxIterations) {
        executionCount++;

        const task = this.tasks.get(currentTaskName);
        if (!task) {
          throw new Error(`Task "${currentTaskName}" not found`);
        }

        this.context.metadata.previousTask = this.context.metadata.currentTask;
        this.context.metadata.currentTask = currentTaskName;
        this.context.metadata.executionPath.push(currentTaskName);

        let result: TaskResult;
        try {
          result = await Promise.resolve(task.execute(this.context));
        } catch (error) {
          this.context.errors.push(
            error instanceof Error ? error : new Error(String(error))
          );
          
          if (this.errorTask) {
            currentTaskName = this.errorTask;
            continue;
          } else {
            throw error;
          }
        }

        if (result.shouldStop || result.nextTask === null) {
          currentTaskName = null;
        } else {
          currentTaskName = result.nextTask;
        }
      }

      if (executionCount >= maxIterations) {
        throw new Error('Maximum execution iterations reached');
      }

      if (this.finalTask && this.tasks.has(this.finalTask)) {
        const wasFinalTaskExecuted = this.context.metadata.executionPath.includes(this.finalTask);
        if (!wasFinalTaskExecuted) {
          const finalTask = this.tasks.get(this.finalTask)!;
          this.context.metadata.previousTask = this.context.metadata.currentTask;
          this.context.metadata.currentTask = this.finalTask;
          this.context.metadata.executionPath.push(this.finalTask);
          await Promise.resolve(finalTask.execute(this.context));
        }
      }

    } catch (error) {
      this.context.errors.push(
        error instanceof Error ? error : new Error(String(error))
      );

      if (this.errorTask && this.tasks.has(this.errorTask)) {
        try {
          const errorTask = this.tasks.get(this.errorTask)!;
          this.context.metadata.currentTask = this.errorTask;
          this.context.metadata.executionPath.push(this.errorTask);
          await Promise.resolve(errorTask.execute(this.context));
        } catch (err) {
          console.error('Error in error handler:', err);
        }
      }
    } finally {
      this.context.metadata.endTime = Date.now();
    }

    return this.context;
  }

  getContext(): Context {
    return this.context;
  }
}

