'use strict';
const nodecgApiContext = require('./util/nodecg-api-context');
const nodecg = nodecgApiContext.get();

const emptyArchers = () => {
  return [
    {
      name: 'Archer 1',
      scores: {
        sets: 0,
        rt: 0,
        shootOff: '0',
        end: ['', '', '']
      }
    },
    {
      name: 'Archer 2',
      scores: {
        sets: 0,
        rt: 0,
        shootOff: '0',
        end: ['', '', '']
      }
    }
  ];
};

let lastVersion = emptyArchers;
const archersRep = nodecg.Replicant('archers', 'archery', {
  persistent: false,
  defaultValue: emptyArchers()
});
const matchEndCountRep = nodecg.Replicant('matchEndCount', 'archery', {
  persistent: false,
  defaultValue: 0
});

function addScores(a, b) {
  if (b === '' || b === '-' || b === 'm' || b === 'M') {
    return parseInt(a, 10);
  }
  if (b.endsWith('*')) {
    return parseInt(a, 10) + parseInt(b.slice(0, 1), 10);
  }
  if (Number.isNaN(parseInt(b, 10))) {
    return parseInt(a, 10);
  }
  return parseInt(a, 10) + parseInt(b, 10);
}

archersRep.on('change', (newVal, oldVal) => {
  lastVersion = oldVal;
});

nodecg.listenFor('clearArchers', () => {
  nodecg.log.info('Clearing archers');
  archersRep.value = emptyArchers();
});

nodecg.listenFor('undoArcherChange', () => {
  nodecg.log.info('Undoing last change to archer data');
  archersRep.value = lastVersion;
});

nodecg.listenFor('updateArchers', (newNames) => {
  nodecg.log.info('Updating archer names');
  archersRep.value[0].name = newNames[0];
  archersRep.value[1].name = newNames[1];
});

nodecg.listenFor('updateScores', (newData) => {
  nodecg.log.info('Updating score values');
  archersRep.value[0].scores = newData[0];
  archersRep.value[1].scores = newData[1];
});

nodecg.listenFor('nextEnd', () => {
  nodecg.log.info('Advancing end');
  const archers = nodecg.readReplicant('archers', 'archery');
  let archer0 = archers[0];
  let archer1 = archers[1];

  // Calculate end and running totals
  const archer0Total = archer0.scores.end.reduce(addScores, 0);
  const archer1Total = archer1.scores.end.reduce(addScores, 0);
  archer0.scores.rt += archer0Total;
  archer1.scores.rt += archer1Total;

  // Calculate set points
  if (archer0Total === archer1Total) {
    archer0.scores.sets += 1;
    archer1.scores.sets += 1;
  } else if (archer0Total >= archer1Total) {
    archer0.scores.sets += 2;
  } else if (archer1Total >= archer0Total) {
    archer1.scores.sets += 2;
  }

  // Reset the arrow values
  archer0.scores.end = ['', '', ''];
  archer1.scores.end = ['', '', ''];

  // Update the replicant
  archersRep.value = [archer0, archer1];

  // TODO: Factor in shootOff arrow
  // TODO: Figure out who won
});
