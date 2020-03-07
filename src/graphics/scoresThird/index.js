import m from 'mithril';
import gsap from 'gsap';

import ArcherComponent from '../archer';
import ColumnTitlesComponent from '../columnHeadings';
import {
  container,
  toucan,
  leagueBrand,
  infoGrid,
  thirdsGrid,
  timerRed,
  timerAmber,
  clickersBrand,
  clickersContainer,
  sponsoredBy,
} from '../common.css';

import {
  globalTimerContainer,
  timerTile,
  ggTime,
} from './styles.css';

const archersRep = window.NodeCG.Replicant('archers', 'archery');
const matchTitleRep = window.NodeCG.Replicant('matchTitle', 'archery');
const shootOffRep = window.NodeCG.Replicant('shootOff', 'archery');
const globalTimerRep = window.NodeCG.Replicant('globalTimer', 'archery');
const archerTimersRep = window.NodeCG.Replicant('archerTimers', 'archery');

class ToucanImageComponent {
  view() {
    return m('div', { class: `${toucan}` });
  }
}

class ClickersBrandComponent {
  view() {
    return m('div', { class: `${clickersContainer}` },
      m('span', { class: `${sponsoredBy}` }, 'Sponsored by:'),
      m('div', { class: `${clickersBrand}` }));
  }
}


class LeagueBrandComponent {
  view() {
    return m('div', { class: `${leagueBrand}` },
      m(ToucanImageComponent));
  }
}

function getTimerColour() {
  if (globalTimerRep.value.startTime <= 20) {
    if (globalTimerRep.value.time === 0) {
      return `${timerRed}`;
    }
    if (globalTimerRep.value.time <= 10) {
      return `${timerAmber}`;
    }
    return '';
  }

  if (globalTimerRep.value.time === 0) {
    return `${timerRed}`;
  }
  if (globalTimerRep.value.time <= 30) {
    return `${timerAmber}`;
  }
  return '';
}

class GlobalTimerTile {
  oncreate(vnode) {
    const { fadeIndex } = vnode.attrs;

    // TODO: Fade in/out when starting/stopping timers

    window.nodecg.listenFor('startShootOff', () => {
      gsap.to(vnode.dom, {
        duration: 0.5,
        ease: 'power4.in',
        opacity: 0,
        x: -50,
        delay: 0.15 * fadeIndex,
      }).then(() => {
        gsap.set(vnode.dom, { display: 'none' });
      });
    });

    window.nodecg.listenFor('clearArchers', () => {
      gsap.to(vnode.dom, {
        duration: 0.5,
        ease: 'power4.in',
        opacity: 0,
        x: -50,
        display: 'block',
      }).then(() => {
        window.nodecg.sendMessage('resetGlobalTimer');
      });
    });

    window.nodecg.listenFor('resumeGlobalTimer', () => {
      // Check if the timer is already visible - if it is then don't animate
      if ((vnode.dom.style.opacity || '1') === '0') {
        gsap.to(vnode.dom, {
          duration: 0.5,
          ease: 'power4.out',
          opacity: 1,
          x: 0,
        });
      }
    });

    window.nodecg.listenFor('resetGlobalTimer', () => {
      gsap.to(vnode.dom, {
        duration: 0.5,
        ease: 'power4.in',
        opacity: 0,
        x: -50,
      }).then(() => {
        window.nodecg.sendMessage('resetGlobalTimerActual');
      });
    });

    window.nodecg.listenFor('nextEnd', () => {
      gsap.to(vnode.dom, {
        duration: 0.5,
        ease: 'power4.in',
        opacity: 0,
        x: -50,
      }).then(() => {
        window.nodecg.sendMessage('resetGlobalTimerActual');
      });
    });
  }

  view(vnode) {
    const { time } = vnode.attrs;

    return m('div', {
      class: `${timerTile} ${getTimerColour()}`,
      style: 'opacity: 0; transform: translate(-50px);',
    },
    m('span', m('i', { class: `${ggTime}`, style: 'margin-right: 6px;' }), `${time}s`));
  }
}

class GlobalTimerRowComponent {
  view() {
    return m('div', { class: `${globalTimerContainer}` },
      m(GlobalTimerTile, {
        time: globalTimerRep.value.time,
        fadeIndex: 6,
      }));
  }
}


class LowerThirdsComponent {
  view() {
    return m('div', { class: `${infoGrid}` },
      m(LeagueBrandComponent),
      m('div', { class: `${thirdsGrid}` },
        m(ColumnTitlesComponent),
        m(ArcherComponent, {
          row: 2,
          archer: 0,
        }),
        m(ArcherComponent, {
          row: 3,
          archer: 1,
        }),
        m(GlobalTimerRowComponent)));
  }
}

class ScoresComponent {
  view() {
    return m('div', { class: `${container}` },
      m(LowerThirdsComponent),
      m(ClickersBrandComponent));
  }
}

window.NodeCG.waitForReplicants(archersRep, matchTitleRep,
  shootOffRep, globalTimerRep, archerTimersRep).then(() => {
  m.mount(document.body, ScoresComponent);
});

globalTimerRep.on('change', () => { m.redraw(); });
archersRep.on('change', () => { m.redraw(); });
