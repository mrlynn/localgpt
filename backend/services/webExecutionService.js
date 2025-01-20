// /backend/services/webExecutionService.js

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

class WebExecutionService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (compatible; LocalAIBot/1.0)';
  }

  async executeWebTask(taskConfig) {
    console.log('Executing web task:', taskConfig);

    try {
      switch (taskConfig.action) {
        case 'search':
          return await this.performSearch(taskConfig);
        case 'scrape':
          return await this.scrapePage(taskConfig);
        case 'monitor':
          return await this.monitorPage(taskConfig);
        default:
          throw new Error(`Unsupported web action: ${taskConfig.action}`);
      }
    } catch (error) {
      console.error('Web task execution failed:', error);
      throw error;
    }
  }

  async performSearch(config) {
    const { query, engine = 'google', numResults = 5 } = config;

    // For demonstration, return mock search results
    // In production, integrate with actual search APIs
    return {
      engine,
      query,
      timestamp: new Date(),
      results: [
        {
          title: 'Example Search Result 1',
          url: 'https://example.com/1',
          snippet: 'Example search result content...'
        },
        {
          title: 'Example Search Result 2',
          url: 'https://example.com/2',
          snippet: 'Example search result content...'
        }
      ]
    };
  }

  async scrapePage(config) {
    const { url, selectors } = config;

    try {
      console.log('Scraping URL:', url);
      const response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const results = {};

      // Process each selector
      for (const [key, selector] of Object.entries(selectors)) {
        if (typeof selector === 'string') {
          results[key] = $(selector).text().trim();
        } else if (selector.type === 'list') {
          results[key] = $(selector.selector)
            .map((i, el) => $(el).text().trim())
            .get();
        }
      }

      return {
        url,
        timestamp: new Date(),
        results
      };

    } catch (error) {
      console.error('Scraping failed:', error);
      throw error;
    }
  }

  async monitorPage(config) {
    const { url, conditions } = config;
    
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const results = {
        url,
        timestamp: new Date(),
        conditions: {}
      };

      for (const [key, condition] of Object.entries(conditions)) {
        const element = $(condition.selector);
        const value = element.text().trim();
        
        results.conditions[key] = {
          met: this.evaluateCondition(value, condition),
          value,
          expected: condition.value
        };
      }

      return results;

    } catch (error) {
      console.error('Monitoring failed:', error);
      throw error;
    }
  }

  evaluateCondition(actual, condition) {
    switch (condition.operator) {
      case 'equals':
        return actual === condition.value;
      case 'contains':
        return actual.includes(condition.value);
      case 'greaterThan':
        return parseFloat(actual) > parseFloat(condition.value);
      case 'lessThan':
        return parseFloat(actual) < parseFloat(condition.value);
      default:
        throw new Error(`Unsupported condition operator: ${condition.operator}`);
    }
  }
}

export const webExecutionService = new WebExecutionService();