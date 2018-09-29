import * as signale from 'signale';

export const logger = new signale.Signale({
  types: {
    signin: {
      badge: 'yes',
      color: 'yellow',
      label: 'signin',
    },
    disconnect: {
      badge: 'rip',
      color: 'red',
      label: 'disconnect',
    },
  },
  config: {
    displayTimestamp: true,
  },
});
