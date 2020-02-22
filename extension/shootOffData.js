'use strict';
const nodecgApiContext = require('./util/nodecg-api-context');
const nodecg = nodecgApiContext.get();

const emptyShootOff = () => {
  return [
    {
      value: '',
      isCloser: false,
    },
    {
      value: '',
      isCloser: false,
    },
  ];
};

const shootOffRep = nodecg.Replicant('shootOff', 'archery', {
  persistent: false,
  defaultValue: emptyShootOff,
});

nodecg.listenFor('clearArchers', () => {
  nodecg.log.info('Clearing shootOff values');
  shootOffRep.value = emptyShootOff();
});

nodecg.listenFor('updateShootOff', (data) => {
  // TODO: Update the replicant
});