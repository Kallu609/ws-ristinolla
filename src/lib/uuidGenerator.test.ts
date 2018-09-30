import { generateUUID } from './uuidGenerator';

test('generate uuid', () => {
  const uuid = generateUUID();
  expect(uuid).toMatch(/^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/);
});
