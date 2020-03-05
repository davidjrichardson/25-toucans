'use strict';
const nodecgApiContext = require("./util/nodecg-api-context");
const nodecg = nodecgApiContext.get();

const rankingEndCounterRep = nodecg.Replicant('rankingRoundEndCounter', 'archery', {
  persistent: false,
  defaultValue: 1,
});

nodecg.listenFor('incRankingEnd', () => {
  rankingEndCounterRep.value = Math.min(rankingEndCounterRep.value + 1, 20);
});

nodecg.listenFor('decRankingEnd', () => {
  rankingEndCounterRep.value = Math.max(rankingEndCounterRep.value - 1, 1);
});
