import { generateUUID } from './uuid-generator';

export const uuidRegexp = /^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/;

test('generate uuid', () => {
  expect(generateUUID()).toMatch(uuidRegexp);
});
