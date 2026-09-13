import { AIModelPreset } from '../types';

export const AI_MODEL_PRESETS: AIModelPreset[] = [
  // Google Gemini Models
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    displayName: 'Gemini 2.5 Flash',
    provider: 'gemini',
    providerLabel: 'Google Gemini',
    providerName: 'Google Gemini',
    badge: 'Recommended',
    tier: 'flagship',
    speed: 'Ultra Fast',
    bestFor: 'Multimodal RAG & Low Latency',
    description: 'Flagship fast model with superior multimodal reasoning, high factual precision, and 1M context token window.',
    contextWindow: '1M tokens',
    recommended: true
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    displayName: 'Gemini 3.8 Flash',
    provider: 'gemini',
    providerLabel: 'Google Gemini',
    providerName: 'Google Gemini',
    badge: 'Next-Gen Speed',
    tier: 'fast',
    speed: 'Ultra Fast',
    bestFor: 'High-Throughput Chat Ingestion',
    description: 'High-throughput Flash generation engineered for real-time conversation and rapid document parsing.',
    contextWindow: '1M tokens'
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    displayName: 'Gemini 3.1 Flash-Lite',
    provider: 'gemini',
    providerLabel: 'Google Gemini',
    providerName: 'Google Gemini',
    badge: 'Low Latency',
    tier: 'fast',
    speed: 'Ultra Fast',
    bestFor: 'Instant Conversational Replies',
    description: 'Lightweight and ultra cost-effective Flash variant for instant conversational replies.',
    contextWindow: '1M tokens'
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    displayName: 'Gemini Flash Latest',
    provider: 'gemini',
    providerLabel: 'Google Gemini',
    providerName: 'Google Gemini',
    badge: 'Continuous Stable',
    tier: 'flagship',
    speed: 'Ultra Fast',
    bestFor: 'Automated Evergreen Updates',
    description: 'Dynamically routes to the latest stable Google Gemini Flash checkpoint release.',
    contextWindow: '1M tokens'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    displayName: 'Gemini 3.1 Pro',
    provider: 'gemini',
    providerLabel: 'Google Gemini',
    providerName: 'Google Gemini',
    badge: 'Deep Reasoning',
    tier: 'reasoning',
    speed: 'Deep Reasoning',
    bestFor: 'Complex Corporate Law & Tax',
    description: 'Pro-tier reasoning engine designed for complex legal, licensing, tax, and architectural inquiries.',
    contextWindow: '2M tokens'
  },

  // Local PostgreSQL RAG Engine
  {
    id: 'local-rag',
    name: 'PostgreSQL Local RAG',
    displayName: 'PostgreSQL Knowledge RAG',
    provider: 'local',
    providerLabel: 'Local PostgreSQL',
    providerName: 'Local Database',
    badge: '100% Offline / Zero API Cost',
    tier: 'fast',
    speed: 'Instant (5ms)',
    bestFor: 'Grounded Doc Q&A without Cloud Key',
    description: 'Direct SQL fuzzy & vector knowledge retrieval across all ingested company documents, FAQs, and forum discussions.',
    contextWindow: 'Unlimited Local KB',
    recommended: true
  },

  // OpenAI Models
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    displayName: 'GPT-4.1 Mini',
    provider: 'openai',
    providerLabel: 'OpenAI',
    providerName: 'OpenAI',
    badge: 'High Precision',
    tier: 'fast',
    speed: 'Fast',
    bestFor: 'JSON Chunk Parsing & Extraction',
    description: 'Fast, highly reliable model with exceptional structured JSON output and knowledge extraction accuracy.',
    contextWindow: '128K tokens'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o Omni',
    displayName: 'GPT-4o Omni',
    provider: 'openai',
    providerLabel: 'OpenAI',
    providerName: 'OpenAI',
    badge: 'Omni Intelligence',
    tier: 'flagship',
    speed: 'Fast',
    bestFor: 'Multilingual Bengali / Arabic & Logic',
    description: 'Flagship omni model with advanced natural language comprehension and deep multilingual support.',
    contextWindow: '128K tokens'
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    displayName: 'GPT-5 Mini',
    provider: 'openai',
    providerLabel: 'OpenAI',
    providerName: 'OpenAI',
    badge: 'Next-Gen Reasoning',
    tier: 'reasoning',
    speed: 'Fast',
    bestFor: 'Next-Gen Strategic Advisory',
    description: 'Next-generation reasoning mini model optimized for fast technical advisory.',
    contextWindow: '128K tokens'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    displayName: 'GPT-4o Mini',
    provider: 'openai',
    providerLabel: 'OpenAI',
    providerName: 'OpenAI',
    badge: 'Everyday Assistant',
    tier: 'fast',
    speed: 'Ultra Fast',
    bestFor: 'High Volume Continuous Chat',
    description: 'Cost-efficient and agile OpenAI model for continuous customer chat routing.',
    contextWindow: '128K tokens'
  }
];

export function resolveAIProvider(modelId: string, explicitProvider?: 'auto' | 'gemini' | 'openai'): 'gemini' | 'openai' {
  if (explicitProvider === 'gemini') return 'gemini';
  if (explicitProvider === 'openai') return 'openai';

  const clean = (modelId || '').toLowerCase().trim();
  if (clean.startsWith('gemini-')) return 'gemini';
  if (clean.startsWith('gpt-') || clean.startsWith('o1-') || clean.startsWith('o3-') || clean.startsWith('chatgpt-')) return 'openai';
  
  // Default to gemini
  return 'gemini';
}

export function getModelPreset(modelId: string): AIModelPreset | null {
  const match = AI_MODEL_PRESETS.find(m => m.id.toLowerCase() === (modelId || '').toLowerCase().trim());
  return match || null;
}
