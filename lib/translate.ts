import { resolveEnvValue } from '@/lib/env';

type TranslationPayload = {
  title: string;
  excerpt?: string | null;
  bodyHtml: string;
  targetLocale: 'th' | 'fr' | 'es' | 'zh';
};

type TranslationResult = {
  title: string;
  excerpt?: string | null;
  bodyHtml: string;
  note?: string;
  source: 'llm' | 'stub';
};

const cache = new Map<string, TranslationResult>();

const TARGET_LANGUAGE_LABELS: Record<TranslationPayload['targetLocale'], string> = {
  th: 'Thai',
  fr: 'French',
  es: 'Spanish',
  zh: 'Simplified Chinese'
};

export async function translateWithFallback(
  key: string,
  payload: TranslationPayload,
  envOverride?: Record<string, string | undefined>
): Promise<TranslationResult> {
  if (cache.has(key)) {
    return cache.get(key)!;
  }

  const apiKey = resolveEnvValue('LLM_API_KEY', envOverride);

  if (!apiKey) {
    const stub = {
      title: `${payload.title} [TRANSLATION NEEDED]`,
      excerpt: payload.excerpt
        ? `${payload.excerpt} [TRANSLATION NEEDED]`
        : 'Translation pending [TRANSLATION NEEDED]',
      bodyHtml: `${payload.bodyHtml}<p><em>[TRANSLATION NEEDED]</em></p>`,
      note: 'LLM not configured',
      source: 'stub' as const
    };
    cache.set(key, stub);
    return stub;
  }

  try {
    const result = await callLLM(payload, {
      apiKey,
      endpoint:
        resolveEnvValue('LLM_API_URL', envOverride) ||
        'https://api.openai.com/v1/chat/completions',
      model: resolveEnvValue('LLM_API_MODEL', envOverride) || 'gpt-4o-mini'
    });
    cache.set(key, result);
    return result;
  } catch (error) {
    const stub = {
      title: `${payload.title} [TRANSLATION NEEDED]`,
      excerpt: payload.excerpt
        ? `${payload.excerpt} [TRANSLATION NEEDED]`
        : 'Translation pending [TRANSLATION NEEDED]',
      bodyHtml: `${payload.bodyHtml}<p><em>[TRANSLATION ERROR]</em></p>`,
      note: error instanceof Error ? error.message : 'Unknown translation error',
      source: 'stub' as const
    };
    cache.set(key, stub);
    return stub;
  }
}

async function callLLM(
  payload: TranslationPayload,
  options: { apiKey: string; endpoint: string; model: string }
): Promise<TranslationResult> {
  const systemPrompt = `You are a professional real-estate copywriter translating English marketing copy into ${TARGET_LANGUAGE_LABELS[payload.targetLocale]}. Preserve all HTML tags (<p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>) and keep sentences concise.`;
  const userPrompt = JSON.stringify({
    title: payload.title,
    excerpt: payload.excerpt,
    bodyHtml: payload.bodyHtml,
    targetLocale: payload.targetLocale
  });

  const response = await fetch(options.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.apiKey}`
    },
    body: JSON.stringify({
      model: options.model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content:
            'Translate the JSON payload. Answer strictly as JSON with keys title, excerpt, bodyHtml. ' +
            userPrompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`LLM request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Missing translation content');
  }

  let parsed: { title: string; excerpt?: string | null; bodyHtml: string };
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to parse LLM response to JSON', error);
    }
    throw new Error('Failed to parse LLM response to JSON');
  }

  return {
    title: parsed.title,
    excerpt: parsed.excerpt,
    bodyHtml: parsed.bodyHtml,
    source: 'llm'
  };
}

