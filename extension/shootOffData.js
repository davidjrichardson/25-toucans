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
  defaultValue: emptyShootOff(),
});

nodecg.listenFor('clearArchers', () => {
  nodecg.log.info('Clearing shootOff values');
  shootOffRep.value = emptyShootOff();
});

nodecg.listenFor('clearShootoff', () => {
  nodecg.log.info('Clearing shootOff values');
  nodecg.sendMessage('clearWinners');
  shootOffRep.value = emptyShootOff();
});

nodecg.listenFor('updateShootOff', (data) => {
  const matchEnd = nodecg.readReplicant('matchEndCount', 'archery');
  if (matchEnd > 6) { // If the match is in shoot off mode
    shootOffRep.value = data;
  }
});

function parseValue(v) {
  if (v === '' || v === '-') {
    return -1;
  }
  if (v === 'm' || v === 'M') {
    return 0;
  }
  if (v.endsWith('*')) {
    return parseInt(v.slice(0, v.length - 1), 10);
  }
  if (Number.isNaN(parseInt(v, 10))) {
    return 0;
  }
  return parseInt(v, 10);
}

nodecg.listenFor('declareWinner', (closestArrow) => {
  // const matchEnd = nodecg.readReplicant('matchEndCount', 'archery');
  // if (matchEnd < 7) { // Exit early if we're not in a shoot off yet
  //   return;
  // }

  const archer0 = shootOffRep.value[0];
  const archer0Clean = parseValue(archer0.value);
  const archer1 = shootOffRep.value[1];
  const archer1Clean = parseValue(archer1.value);
  nodecg.sendMessage('clearWinners');

  if (archer0Clean > archer1Clean) {
    nodecg.sendMessage('winner-archer0');
  } else if (archer1Clean > archer0Clean) {
    nodecg.sendMessage('winner-archer1');
  } else { // Now for the more complex case for when the archers are equal
    if (closestArrow) {
      nodecg.sendMessage(`winner-${closestArrow}`);

      if (closestArrow === 'archer0') {
        shootOffRep.value[0].isCloser = true;
      } else if (closestArrow === 'archer1') {
        shootOffRep.value[1].isCloser = true;
      }
    }
    if (archer0.isCloser) {
      nodecg.sendMessage('winner-archer0');
    } else if (archer1.isCloser) {
      nodecg.sendMessage('winner-archer1');
    }
  }
});