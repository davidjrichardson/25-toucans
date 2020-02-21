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

let lastArcherVersion = emptyArchers;
let lastMatchEndVersion = 1;
const archersRep = nodecg.Replicant('archers', 'archery', {
  persistent: false,
  defaultValue: emptyArchers()
});
const matchEndCountRep = nodecg.Replicant('matchEndCount', 'archery', {
  persistent: false,
  defaultValue: 1
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

archersRep.on('change', (_, oldVal) => {
  lastArcherVersion = oldVal;
});

matchEndCountRep.on('change', (end, oldVal) => {
  nodecg.log.info('Now on end', end);
  lastMatchEndVersion = oldVal;
});

nodecg.listenFor('clearArchers', () => {
  nodecg.log.info('Clearing archers');
  const name0 = archersRep.value[0].name;
  const name1 = archersRep.value[1].name;
  archersRep.value = emptyArchers();
  archersRep.value[0].name = name0;
  archersRep.value[1].name = name1;
  matchEndCountRep.value = 1;
});

nodecg.listenFor('undoArcherChange', () => {
  nodecg.log.info('Undoing last change to archer data');
  archersRep.value = lastArcherVersion;
  matchEndCountRep.value = lastMatchEndVersion;
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
  const matchType = nodecg.readReplicant('matchType', 'archery');
  // TODO: Check if the recurve archer should win
  // Handle if a compound archer should win
  if (matchEndCountRep.value === 5 && matchType === 'compound') {
    if (archer0.scores.rt >= archer1.scores.rt) {
      nodecg.log.info('archer 0 wins - sending message');
      nodecg.sendMessage('winner-archer0');
    } else if (archer1.scores.rt >= archer0.scores.rt) {
      nodecg.log.info('archer 0 wins - sending message');
      nodecg.sendMessage('winner-archer1');
    }
  }
  // TODO: If we're on end 5, either:
  // --- The match is a compound match (and a winner needs declaring)
  // --- OR the match is going to a shoot off

  matchEndCountRep.value += 1;
});
