
import { test, expect } from '@playwright/test';
import Ajv from 'ajv';

const cartResponseSchema = {
  type: 'object',
  required: ['success'],
  properties: {
    success: { type: 'string', minLength: 1 },
    total: { type: 'string' },
  },
  additionalProperties: true,
} as const;

test('Cart API response follows JSON Schema contract', async ({
  request,
}) => {
  const response = await request.post(
    'http://localhost:8080/index.php?route=checkout/cart%7Cadd&language=en-gb',
    {
      form: {
        product_id: '43',
        quantity: '1',
      },
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    }
  );

  expect(response.status()).toBe(200);

  const body: unknown = await response.json();
  console.log('API RESPONSE:', body);

  const ajv = new Ajv();
  const validate = ajv.compile(cartResponseSchema);

  expect(
    validate(body),
    JSON.stringify(validate.errors)
  ).toBe(true);
  expect((body as { success: string }).success)
  .toContain('You have added');
});
