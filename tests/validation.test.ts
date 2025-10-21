import { describe, expect, it } from 'vitest';

import { leadSubmissionSchema } from '../lib/validation';

describe('leadSubmissionSchema', () => {
  it('parses a valid payload', () => {
    const result = leadSubmissionSchema.parse({
      firstName: 'Jane',
      email: 'jane@example.com',
      phone: '+6600000000',
      budget: 'under500k',
      propertyType: 'villa',
      areas: ['Bophut'],
      timing: 'soon',
      callPreference: 'phone',
      timezone: 'Asia/Bangkok',
      message: 'Looking to invest soon',
      locale: 'en',
      consent: true
    });

    expect(result.firstName).toBe('Jane');
  });

  it('rejects honeypot submissions', () => {
    const result = leadSubmissionSchema.safeParse({
      firstName: 'Bot',
      email: 'bot@example.com',
      phone: '+6600000000',
      budget: 'under500k',
      propertyType: 'villa',
      areas: [],
      timing: 'soon',
      callPreference: 'phone',
      timezone: 'Asia/Bangkok',
      locale: 'en',
      consent: true,
      _hpt: 'spam'
    });

    expect(result.success).toBe(false);
  });
});
