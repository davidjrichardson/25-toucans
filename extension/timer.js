'use strict';
const nodecgApiContext = require('./util/nodecg-api-context');
const nodecg = nodecgApiContext.get();

const emptyTimers = () => {
  return [
    20,
    20
  ];
}

const globalTimerRep = nodecg.Replicant('globalTimer', 'archery', {
  persistent: false,
  defaultValue: {
    time: 120,
    startTime: 120,
  },
});
const archerTimersRep = nodecg.Replicant('archerTimers', 'archery', {
  persistent: false,
  defaultValue: emptyTimers(),
});

const Timer = function(cb, interval) {
  let id, intval = interval;

  this.pause = function() {
    clearInterval(id);
  }

  this.resume = function() {
    clearInterval(id);
    id = setInterval(cb, intval);
  }
}

/* --- Per-archer timer functions --- */
const archerTimers = [
  new Timer(() => { // Archer 0 timer
    if (archerTimersRep.value[0] > 0) {
      archerTimersRep.value[0] -= 1;
    } 
    if (archerTimersRep.value[0] === 0) {
      swapTimers();
    }
  }, 1000),
  new Timer(() => { // Archer 1 timer
    if (archerTimersRep.value[1] > 0) {
      archerTimersRep.value[1] -= 1;
    }
    if (archerTimersRep.value[1] === 0) {
      swapTimers();
    }
  }, 1000),
]
let currentArcher = 0;

function swapTimers() {
  archerTimers[currentArcher].pause();
  // Swap the timer and set it to 20s
  currentArcher = (currentArcher + 1) % 2;
  archerTimersRep.value[currentArcher] = 20;
  archerTimers[currentArcher].resume();
}

function getTimerToStart() {
  const archers = nodecg.readReplicant('archers', 'archery');
  const matchType = nodecg.readReplicant('matchType', 'archery');

  const getValue = (archer, type) => {
    if (type === 'compound') {
      return archer.scores.rt;
    } else {
      return archer.scores.sets;
    }
  }
  
  if (getValue(archers[0], matchType) > getValue(archers[1], matchType)) {
    currentArcher = 0;
  } else if (getValue(archers[1], matchType) > getValue(archers[0], matchType)) {
    currentArcher = 1;
  } else {
    currentArcher = 0; // Return archer 0 because they're higher seed and go first
  }

  return archerTimers[currentArcher];
}

nodecg.listenFor('startShootOffTimers', () => {
  getTimerToStart().resume();
});

nodecg.listenFor('startNextTimer', () => {
  swapTimers();
});

nodecg.listenFor('stopShootOffTimers', () => {
  archerTimers.forEach((t) => { t.pause(); });
})

nodecg.listenFor('resetArcherTimers', () => {
  archerTimers.forEach((t) => { t.pause(); });
  archerTimersRep.value = emptyTimers();
});

/* --- Global timer functions --- */
const globalTimer = new Timer(() => {
  if (globalTimerRep.value.time > 0) {
    globalTimerRep.value.time -= 1;
  } else {
    globalTimer.pause();
    nodecg.sendMessage('globalTimerFinished');
  }
}, 1000);

nodecg.listenFor('resumeGlobalTimer', () => {
  globalTimer.resume();
});

nodecg.listenFor('pauseGlobalTimer', () => {
  globalTimer.pause();
});

nodecg.listenFor('setGlobalTimer', (time) => {
  globalTimer.pause();
  
  globalTimerRep.value.time = time;
  globalTimerRep.value.startTime = time;
});

nodecg.listenFor('resetGlobalTimerActual', () => {
  globalTimer.pause();
  globalTimerRep.value.time = globalTimerRep.value.startTime;
});
