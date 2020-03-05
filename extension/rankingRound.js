'use strict';
const nodecgApiContext = require("./util/nodecg-api-context");
const nodecg = nodecgApiContext.get();

rankingEndCounterRep = nodecg.Replicant('rankingRoundEndCounter', 'archery', {
  persistent: false,
  defaultValue: 1,
});

nodecg.listenFor('incRankingEnd', () => {
  rankingEndCounterRep.value++;
});

nodecg.listenFor('decRankingEnd', () => {
  rankingEndCounterRep.value--;
});
