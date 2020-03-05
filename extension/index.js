'use strict';
const nodecgApiContext = require("./util/nodecg-api-context");

module.exports = function (nodecg) {
  nodecgApiContext.set(nodecg);
  init().then(() => {
    nodecg.log.info('Initialisation successful');
    nodecg.sendMessage('clearAchers');
  }).catch((error) => {
    nodecg.log.error('Failed to initialise:', error);
  });
};

async function init() {
  require('./archerData');
  require('./matchData');
  require('./shootOffData');
  require('./timer');
  require('./rankingRound');
}
