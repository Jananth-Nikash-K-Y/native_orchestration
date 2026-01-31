import { Task, TaskResult, Context } from './types';

export class ValidateInputTask implements Task {
  name = 'validate-input';

  execute(context: Context): TaskResult {
    const input = context.input;
    
    if (!input || typeof input !== 'object') {
      context.errors.push(new Error('Invalid input: must be an object'));
      return { nextTask: 'error-handler' };
    }

    if (!input.type) {
      context.errors.push(new Error('Input missing required field: type'));
      return { nextTask: 'error-handler' };
    }

    context.results.validation = { valid: true, timestamp: Date.now() };

    if (input.type === 'code-generation') {
      return { nextTask: 'analyze-requirements' };
    } else if (input.type === 'data-processing') {
      return { nextTask: 'process-data' };
    } else {
      return { nextTask: 'unknown-type-handler' };
    }
  }
}

export class AnalyzeRequirementsTask implements Task {
  name = 'analyze-requirements';

  execute(context: Context): TaskResult {
    const requirements = context.input.requirements || '';
    const analysis = {
      complexity: requirements.length > 100 ? 'high' : 'low',
      estimatedSteps: Math.ceil(requirements.length / 50),
      timestamp: Date.now(),
    };

    context.results.analysis = analysis;
    return { nextTask: 'generate-code' };
  }
}

export class GenerateCodeTask implements Task {
  name = 'generate-code';

  execute(context: Context): TaskResult {
    const analysis = context.results.analysis;
    const requirements = context.input.requirements || '';

    const generatedCode = `// Generated code
// Complexity: ${analysis?.complexity || 'unknown'}

function generatedFunction() {
  return "Hello, World!";
}

module.exports = { generatedFunction };`;

    context.results.generatedCode = generatedCode;
    context.results.codeGenerationTime = Date.now();
    return { nextTask: 'validate-code' };
  }
}

export class ValidateCodeTask implements Task {
  name = 'validate-code';

  execute(context: Context): TaskResult {
    const code = context.results.generatedCode;
    
    if (!code || code.length < 10) {
      context.errors.push(new Error('Generated code is invalid'));
      return { nextTask: 'error-handler' };
    }

    const hasFunction = code.includes('function');
    const hasReturn = code.includes('return');
    
    context.results.codeValidation = {
      valid: hasFunction && hasReturn,
      hasFunction,
      hasReturn,
      timestamp: Date.now(),
    };

    if (!hasFunction || !hasReturn) {
      context.errors.push(new Error('Code validation failed'));
      return { nextTask: 'error-handler' };
    }

    const analysis = context.results.analysis;
    if (analysis?.complexity === 'high') {
      return { nextTask: 'optimize-code' };
    }

    return { nextTask: 'finalize' };
  }
}

export class OptimizeCodeTask implements Task {
  name = 'optimize-code';

  execute(context: Context): TaskResult {
    let code = context.results.generatedCode;
    code = code.replace(/\n\s*\n/g, '\n');
    
    context.results.optimizedCode = code;
    context.results.optimizationTime = Date.now();
    return { nextTask: 'finalize' };
  }
}

export class ProcessDataTask implements Task {
  name = 'process-data';

  execute(context: Context): TaskResult {
    const data = context.input.data || [];
    const processed = data.map((item: any, index: number) => ({
      id: index + 1,
      processed: true,
      value: item,
    }));

    context.results.processedData = processed;
    context.results.processedCount = processed.length;
    return { nextTask: 'finalize' };
  }
}

export class UnknownTypeHandlerTask implements Task {
  name = 'unknown-type-handler';

  execute(context: Context): TaskResult {
    context.errors.push(
      new Error(`Unknown input type: ${context.input.type}`)
    );
    return { nextTask: 'error-handler' };
  }
}

export class ErrorHandlerTask implements Task {
  name = 'error-handler';

  execute(context: Context): TaskResult {
    const errors = context.errors;
    context.results.errorSummary = {
      count: errors.length,
      messages: errors.map(e => e.message),
      timestamp: Date.now(),
    };
    return { nextTask: null, shouldStop: true };
  }
}

export class FinalTask implements Task {
  name = 'finalize';

  execute(context: Context): TaskResult {
    const executionTime = 
      (context.metadata.endTime || Date.now()) - (context.metadata.startTime || 0);
    
    context.results.summary = {
      executionTime,
      tasksExecuted: context.metadata.executionPath.length,
      executionPath: context.metadata.executionPath,
      success: context.errors.length === 0,
      timestamp: Date.now(),
    };

    return { nextTask: null, shouldStop: true };
  }
}

