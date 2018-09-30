import { generateUUID } from './uuidGenerator';

export const uuidRegexp = /^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/;

test('generate uuid', () => {
  const uuid = generateUUID();
  expect(uuid).toMatch(uuidRegexp);
});
