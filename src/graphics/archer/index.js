import m from 'mithril';
import gsap from 'gsap';
import {
  archerTile, archersContainer, scoreTile, isGold, isDefault,
  isRed, isWhite, isBlue, isBlack, totalTile, winnerTile,
  scoreTileFlash, timerTile,
} from './styles.css';

import {
  timerRed,
  timerAmber,
} from '../common.css';

const archersRep = window.NodeCG.Replicant('archers', 'archery');
const matchTypeRep = window.NodeCG.Replicant('matchType', 'archery');
const shootOffRep = window.NodeCG.Replicant('shootOff', 'archery');
const archerTimersRep = window.NodeCG.Replicant('archerTimers', 'archery');

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

function getTimerColour(time) {
  if (time === 0) {
    return `${timerRed}`;
  }
  if (time <= 10) {
    return `${timerAmber}`;
  }
  return '';
}

class ArcherNameTile {
  view(vnode) {
    const { name } = vnode.attrs;

    return m('div', { class: `${archerTile}` },
      m('span', name));
  }
}

class ShootOffTimerTile {
  oncreate(vnode) {
    const { fadeIndex } = vnode.attrs;

    window.nodecg.listenFor('stopShootOffTimers', () => {
      gsap.to(vnode.dom, {
        duration: 0.5,
        ease: 'power4.in',
        opacity: 0,
        display: 'none',
        x: -50,
      });
    });

    window.nodecg.listenFor('startShootOffTimers', () => {
      // Check if the timer is already visible - if it is then don't animate
      if ((vnode.dom.style.opacity || '1') === '0') {
        gsap.to(vnode.dom, {
          duration: 0.5,
          ease: 'power4.out',
          display: 'block',
          opacity: 1,
          x: 0,
        });
      }
    });

    window.nodecg.listenFor('startShootOff', () => {
      gsap.fromTo(vnode.dom, {
        opacity: 0,
        x: -50,
        display: 'block',
      }, {
        ease: 'power4.out',
        duration: 0.5,
        opacity: 1,
        x: 0,
        delay: 1 + 0.15 * fadeIndex,
      });
    });

    window.nodecg.listenFor('clearArchers', () => {
      gsap.set(vnode.dom, {
        x: -50,
        opacity: 0,
        display: 'none',
      });
    });
  }

  view(vnode) {
    const { time } = vnode.attrs;

    // TODO: If the match is configured so it's alternating detail, use this instead

    return m('div', {
      class: `${timerTile} ${getTimerColour(time)}`,
      style: 'opacity: 0; transform: translate(-50px); display: none;',
    },
    m('span', `${time}s`));
  }
}

class TotalTile {
  oncreate(vnode) {
    const { fadeIndex } = vnode.attrs;

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
      gsap.set(vnode.dom, {
        opacity: 1,
        x: 0,
        display: 'block',
      });
    });
  }

  view(vnode) {
    const { value, col } = vnode.attrs;

    return m('div', { class: `${totalTile}`, style: `grid-column: ${col + 5}` },
      m('span', value));
  }
}

const getColour = (v) => {
  if (v > 8) {
    return `${isGold}`;
  }
  if (v > 6) {
    return `${isRed}`;
  }
  if (v > 4) {
    return `${isBlue}`;
  }
  if (v > 2) {
    return `${isBlack}`;
  }
  if (v >= 0) {
    return `${isWhite}`;
  }

  return `${isDefault}`;
};

class ArrowValueTile {
  oncreate(vnode) {
    const { col, archer, fadeIndex } = vnode.attrs;

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
      gsap.set(vnode.dom, {
        opacity: 1,
        x: 0,
        display: 'block',
      });
    });

    window.nodecg.listenFor(`arrowChange-archer${archer}-arrow${col}`, () => {
      gsap.fromTo(`#arrowFlash-archer${archer}-arrow${col}`, {
        backgroundColor: 'rgba(255, 255, 255, 1)',
      }, {
        ease: 'power4',
        duration: 1.5,
        backgroundColor: 'rgba(255, 255, 255, 0)',
      });
    });
  }

  view(vnode) {
    const { value, col, archer } = vnode.attrs;

    return m('div', { class: `${scoreTile} ${getColour(parseValue(value))}`, style: `grid-column: ${col + 2}` },
      m('span', value),
      m('div', { class: `${scoreTileFlash}`, id: `arrowFlash-archer${archer}-arrow${col}` }));
  }
}

class ShootOffTile {
  oncreate(vnode) {
    const { archer, fadeIndex } = vnode.attrs;

    window.nodecg.listenFor('startShootOff', () => {
      gsap.fromTo(vnode.dom, {
        opacity: 0,
        x: -50,
        display: 'block',
      }, {
        ease: 'power4.out',
        duration: 0.5,
        opacity: 1,
        x: 0,
        delay: 1 + 0.15 * fadeIndex,
      });
    });

    window.nodecg.listenFor(`arrowChange-shootOff-archer${archer}`, () => {
      gsap.fromTo(`#arrowFlash-archer${archer}-shootOffArrow`, {
        backgroundColor: 'rgba(255, 255, 255, 1)',
      }, {
        ease: 'power4',
        duration: 1.5,
        backgroundColor: 'rgba(255, 255, 255, 0)',
      });
    });

    window.nodecg.listenFor('clearArchers', () => {
      gsap.set(vnode.dom, {
        x: -50,
        opacity: 0,
        display: 'none',
      });
    });
  }

  view(vnode) {
    const { value, archer } = vnode.attrs;

    return m('div', { class: `${scoreTile} ${getColour(parseValue(value))}`, style: 'display: none;' },
      m('span', value),
      m('div', { class: `${scoreTileFlash}`, id: `arrowFlash-archer${archer}-shootOffArrow` }));
  }
}

class WinnerTile {
  oncreate(vnode) {
    const { archer } = vnode.attrs;

    window.nodecg.listenFor('clearArchers', () => {
      gsap.set(vnode.dom, {
        opacity: 0.0,
        x: -50,
      });
    });

    window.nodecg.listenFor('clearWinners', () => {
      gsap.set(vnode.dom, {
        opacity: 0.0,
        x: -50,
      });
    });

    window.nodecg.listenFor(`winner-archer${archer}`, () => {
      gsap.fromTo(vnode.dom, {
        opacity: 0.0,
        x: -50,
      }, {
        ease: 'power4',
        duration: 0.5,
        x: 0,
        opacity: 1,
      });
    });
  }

  view() {
    return m('div', { class: `${winnerTile}`, style: 'opacity: 0;' },
      m('span', 'WINNER!'));
  }
}

function addScores(a, b) {
  return parseInt(a, 10) + Math.max(parseValue(b, 10), 0);
}

export default class ArcherNamesComponent {
  view(vnode) {
    const { archer, row } = vnode.attrs;

    const archerData = archersRep.value[archer];

    return m('div', { class: `${archersContainer}`, style: `grid-row: ${row};` },
      m(ArcherNameTile, { name: archerData.name }),
      ...archerData.scores.end.map((s, i) => m(ArrowValueTile, {
        archer,
        value: s,
        col: i,
        fadeIndex: (Math.abs(i - 3) + 1),
      })), m(TotalTile, {
        value: archerData.scores.end.reduce(addScores, 0),
        col: 1,
        fadeIndex: 1,
      }), m(TotalTile, {
        value: (matchTypeRep.value === 'recurve' ? archerData.scores.sets : archerData.scores.rt + archerData.scores.end.reduce(addScores, 0)),
        col: 2,
        fadeIndex: 0,
      }), m(ShootOffTile, { archer, fadeIndex: 7, value: shootOffRep.value[archer].value }),
      m(ShootOffTimerTile, { time: archerTimersRep.value[archer], fadeIndex: 8 }),
      m(WinnerTile, { archer }));
  }
}

archersRep.on('change', () => { m.redraw(); });
shootOffRep.on('change', () => { m.redraw(); });
matchTypeRep.on('change', () => { m.redraw(); });
archerTimersRep.on('change', () => { m.redraw(); });
