import { Injectable } from '@angular/core';
import { Orchestrator } from '../core/orchestrator';
import { Context } from '../core/types';
import {
  ValidateInputTask,
  AnalyzeRequirementsTask,
  GenerateCodeTask,
  ValidateCodeTask,
  OptimizeCodeTask,
  ProcessDataTask,
  UnknownTypeHandlerTask,
  ErrorHandlerTask,
  FinalTask,
} from '../core/tasks';

@Injectable({
  providedIn: 'root'
})
export class OrchestrationService {
  
  createOrchestrator(input: any): Orchestrator {
    const context: Context = {
      input,
      results: {},
      errors: [],
      metadata: {
        executionPath: [],
      },
    };

    const orchestrator = new Orchestrator(context);

    orchestrator.registerTask(new ValidateInputTask());
    orchestrator.registerTask(new AnalyzeRequirementsTask());
    orchestrator.registerTask(new GenerateCodeTask());
    orchestrator.registerTask(new ValidateCodeTask());
    orchestrator.registerTask(new OptimizeCodeTask());
    orchestrator.registerTask(new ProcessDataTask());
    orchestrator.registerTask(new UnknownTypeHandlerTask());
    orchestrator.registerTask(new ErrorHandlerTask());
    orchestrator.registerTask(new FinalTask());

    orchestrator.setErrorTask('error-handler');
    orchestrator.setFinalTask('finalize');

    return orchestrator;
  }

  async runExample(input: any): Promise<Context> {
    const orchestrator = this.createOrchestrator(input);
    return await orchestrator.execute('validate-input');
  }
}

