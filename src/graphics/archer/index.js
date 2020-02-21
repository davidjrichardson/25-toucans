import m from 'mithril';
import gsap from 'gsap';
import {
  archerTile, archersContainer, scoreTile, isGold, isDefault,
  isRed, isWhite, isBlue, isBlack, totalTile, winnerTile,
  scoreTileFlash,
} from './styles.css';

const archersRep = window.NodeCG.Replicant('archers', 'archery');
const matchTypeRep = window.NodeCG.Replicant('matchType', 'archery');

function parseValue(v) {
  if (v === '' || v === '-') {
    return -1;
  }
  if (v === 'm' || v === 'M') {
    return 0;
  }
  if (v.endsWith('*')) {
    return parseInt(v.slice(0, 1), 10);
  }
  if (Number.isNaN(parseInt(v, 10))) {
    return 0;
  }
  return parseInt(v, 10);
}

class ArcherNameTile {
  view(vnode) {
    const { name } = vnode.attrs;

    return m('div', { class: `${archerTile}` },
      m('span', name));
  }
}

class TotalTile {
  view(vnode) {
    const { value } = vnode.attrs;
    const { col } = vnode.attrs;

    return m('div', { class: `${totalTile}`, style: `grid-column: ${col + 5}` },
      m('span', value));
  }
}

class ArrowValueTile {
  getColour(v) {
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
  }

  oncreate(vnode) {
    const { col, archer } = vnode.attrs;

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

    return m('div', { class: `${scoreTile} ${this.getColour(parseValue(value))}`, style: `grid-column: ${col + 2}` },
      m('span', value),
      m('div', { class: `${scoreTileFlash}`, id: `arrowFlash-archer${archer}-arrow${col}` }));
  }
}

class WinnerTile {
  oncreate(vnode) {
    const { archer } = vnode.attrs;

    const slideIn = gsap.from(vnode.dom, {
      ease: 'power4',
      paused: true,
      opacity: 0.0,
      duration: 0.5,
      x: -50,
    });

    window.nodecg.listenFor('clearArchers', () => {
      gsap.set(vnode.dom, {
        opacity: 0.0,
        x: -50,
      });
    });

    window.nodecg.listenFor(`winner-archer${archer}`, () => {
      slideIn.restart();
    });
  }

  view() {
    return m('div', { class: `${winnerTile}` },
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
      ...archerData.scores.end.map((s, i) => m(ArrowValueTile, { archer, value: s, col: i })),
      m(TotalTile, { value: archerData.scores.end.reduce(addScores, 0), col: 1 }),
      m(TotalTile, {
        value: (matchTypeRep.value === 'recurve' ? archerData.scores.sets : archerData.scores.rt + archerData.scores.end.reduce(addScores, 0)),
        col: 2,
      }), m(WinnerTile, { archer }));
  }
}

archersRep.on('change', () => { m.redraw(); });
