'use strict';
const nodecgApiContext = require('./util/nodecg-api-context');
const nodecg = nodecgApiContext.get();
const matchTypeRep = nodecg.Replicant('matchType', 'archery', {
  persistent: false,
  defaultValue: 'recurve'
});
const matchTitleRep = nodecg.Replicant('matchTitle', 'archery', {
  persistent: false,
  defaultValue: 'Bronze Toucan Finals',
});

nodecg.listenFor('updateMatchTitle', (title) => {
  matchTitleRep.value = title;
});

nodecg.listenFor('updateMatchType', (type) => {
  matchTypeRep.value = type;
});
