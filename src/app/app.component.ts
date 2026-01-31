import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrchestrationService } from './services/orchestration.service';
import { Context } from './core/types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  results: Context[] = [];
  running = false;

  constructor(private orchestrationService: OrchestrationService) {}

  async runExample(exampleNumber: number) {
    this.running = true;
    
    let input: any;
    
    switch(exampleNumber) {
      case 1:
        input = {
          type: 'code-generation',
          requirements: 'Create a function that processes user data and handles errors'
        };
        break;
      case 2:
        input = {
          type: 'code-generation',
          requirements: 'Simple hello world'
        };
        break;
      case 3:
        input = {
          type: 'data-processing',
          data: ['item1', 'item2', 'item3']
        };
        break;
      case 4:
        input = {};
        break;
      case 5:
        input = { type: 'unknown-type' };
        break;
    }

    try {
      const result = await this.orchestrationService.runExample(input);
      this.results[exampleNumber - 1] = result;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.running = false;
    }
  }

  getExecutionPath(result: Context): string {
    return result.metadata.executionPath.join(' → ');
  }

  getSummary(result: Context): any {
    return result.results.summary || {};
  }
}

