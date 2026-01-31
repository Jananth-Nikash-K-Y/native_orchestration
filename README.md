# Native Orchestration Layer

Simple orchestration layer built with Angular and TypeScript. No external orchestration frameworks.

## Run

```bash
npm install
npm start
```

Open http://localhost:4200

## What it does

The orchestrator controls task execution flow. Each task receives context and returns the next task to run.

- Shared context holds input, results, and errors
- Tasks decide the next task based on context
- Orchestrator manages execution and error handling

## Structure

- `src/app/core/` - Core orchestration logic
- `src/app/services/` - Angular service
- `src/app/app.component.*` - UI component
