// /backend/services/taskExecutionService.js
import fetch from 'node-fetch';

class TaskExecutionService {
  constructor() {
    this.ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
    this.modelName = process.env.MODEL_NAME || "deepseek-coder:6.7b";
  }

  async executeTask(task) {
    console.log(`Executing ${task.type} task: ${task.title}`);

    try {
      let prompt = '';
      let result = null;

      switch (task.type) {
        case 'summarize':
          prompt = this.buildSummarizationPrompt(task);
          result = await this.callLLM(prompt);
          break;
        case 'analyze':
          prompt = this.buildAnalysisPrompt(task);
          result = await this.callLLM(prompt);
          break;
        case 'monitor':
          result = await this.handleMonitoringTask(task);
          break;
        case 'report':
          prompt = this.buildReportPrompt(task);
          result = await this.callLLM(prompt);
          break;
        case 'alert':
          result = await this.handleAlertTask(task);
          break;
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }

      return result;
    } catch (error) {
      console.error(`Task execution failed: ${error.message}`);
      throw error;
    }
  }

  buildSummarizationPrompt(task) {
    return `Summarize the following content:
Context: ${task.description}
Content: ${task.input.get('content')}
Instructions: ${task.input.get('instructions') || 'Provide a concise summary'}

Please provide a summary that:
1. Captures the main points
2. Is clear and concise
3. Follows any specific instructions provided`;
  }

  buildAnalysisPrompt(task) {
    return `Analyze the following:
Context: ${task.description}
Content: ${task.input.get('content')}
Analysis Type: ${task.input.get('analysisType') || 'general'}
Instructions: ${task.input.get('instructions') || 'Provide a detailed analysis'}

Please provide an analysis that:
1. Identifies key patterns or insights
2. Supports findings with evidence
3. Follows any specific instructions provided`;
  }

  buildReportPrompt(task) {
    return `Generate a report based on the following:
Context: ${task.description}
Data: ${task.input.get('data')}
Format: ${task.input.get('format') || 'markdown'}
Instructions: ${task.input.get('instructions') || 'Generate a comprehensive report'}`;
  }

  async handleMonitoringTask(task) {
    const url = task.input.get('url');
    const response = await fetch(url);
    const content = await response.text();
    
    // Use LLM to analyze changes if needed
    if (task.input.get('analyzeChanges')) {
      const prompt = `Analyze the following webpage content for significant changes:
Content: ${content}
Previous State: ${task.input.get('previousState') || 'None'}
Criteria: ${task.input.get('criteria') || 'Look for any significant changes'}`;
      
      return await this.callLLM(prompt);
    }

    return { 
      timestamp: new Date(),
      content,
      url 
    };
  }

  async handleAlertTask(task) {
    const condition = task.input.get('condition');
    const data = task.input.get('data');
    
    const prompt = `Evaluate the following condition and determine if an alert should be triggered:
Condition: ${condition}
Data: ${data}
Instructions: ${task.input.get('instructions') || 'Evaluate if the condition is met'}

Please provide:
1. Whether the condition is met (true/false)
2. A brief explanation of why
3. Recommended actions if applicable`;

    const evaluation = await this.callLLM(prompt);
    
    return {
      timestamp: new Date(),
      alert: evaluation.includes('true'),
      evaluation
    };
  }

  async callLLM(prompt) {
    try {
      const response = await fetch(`${this.ollamaHost}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that performs various tasks like summarization, analysis, and report generation.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`LLM request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message?.content || data;

    } catch (error) {
      console.error('LLM call failed:', error);
      throw error;
    }
  }
}

export const taskExecutionService = new TaskExecutionService();