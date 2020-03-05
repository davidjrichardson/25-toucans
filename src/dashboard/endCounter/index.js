import m from 'mithril';
import {
  button,
  buttonRed,
  buttonGreen,
} from '../common.css';

import {
  controlsContainer,
  counterContainer,
} from './styles.css';

const rankingEndReplicant = window.NodeCG.Replicant('rankingRoundEndCounter', 'archery');

function incCounter() {
  window.nodecg.sendMessage('incRankingEnd');
}

function decCounter() {
  window.nodecg.sendMessage('decRankingEnd');
}

class GenericButtonComponent {
  view(vnode) {
    const {
      text,
      call,
      extraStyles,
      extraClasses,
    } = vnode.attrs;

    return m('button', {
      class: `${button} ${(extraClasses || '')}`,
      style: `${(extraStyles || '')}`,
      type: 'button',
      onclick: () => { call(); },
    }, text);
  }
}

class EndCounterComponent {
  view() {
    return m('div', { class: `${controlsContainer}` },
      m(GenericButtonComponent, {
        text: '-',
        extraClasses: `${buttonRed}`,
        call: decCounter,
      }),
      m('div', { class: `${counterContainer}` }, `End ${rankingEndReplicant.value}/`,
        m('span', '20')),
      m(GenericButtonComponent, {
        text: '+',
        extraClasses: `${buttonGreen}`,
        call: incCounter,
      }));
  }
}

window.NodeCG.waitForReplicants(rankingEndReplicant).then(() => {
  m.mount(document.body, EndCounterComponent);
});

rankingEndReplicant.on('change', () => { m.redraw(); });
