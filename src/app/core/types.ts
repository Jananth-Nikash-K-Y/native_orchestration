export interface Context {
  input: any;
  results: Record<string, any>;
  errors: Error[];
  metadata: {
    currentTask?: string;
    previousTask?: string;
    executionPath: string[];
    startTime?: number;
    endTime?: number;
  };
}

export interface TaskResult {
  nextTask: string | null;
  shouldStop?: boolean;
}

export interface Task {
  name: string;
  execute(context: Context): Promise<TaskResult> | TaskResult;
}

