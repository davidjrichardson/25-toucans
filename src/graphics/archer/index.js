import m from 'mithril';
import gsap from 'gsap';
import {
  archerTile, archersContainer, scoreTile, isGold, isDefault,
  isRed, isWhite, isBlue, isBlack, totalTile, winnerTile,
} from './styles.css';

const archersRep = window.NodeCG.Replicant('archers', 'archery');

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
    if (v === '-' || v === '') {
      return `${isDefault}`;
    }
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

    return `${isWhite}`;
  }

  oncreate(vnode) {
    const { col, archer } = vnode.attrs;

    const changeFlash = gsap.to(vnode.dom, {
      easing: 'power4',
      paused: true,
      backgroundColor: '#FFF',
      color: '#FFF',
      duration: 0.25,
      yoyo: true,
      repeat: 1,
    });

    window.nodecg.listenFor(`arrowChange-archer${archer}-arrow${col}`, () => {
      changeFlash.restart();
    });
  }

  view(vnode) {
    const { value } = vnode.attrs;
    const { col } = vnode.attrs;

    return m('div', { class: `${scoreTile} ${this.getColour(value)}`, style: `grid-column: ${col + 2}` },
      m('span', value));
  }
}

class WinnerTile {
  oncreate(vnode) {
    const { archer } = vnode.attrs;

    const slideIn = gsap.from(vnode.dom, {
      easing: 'power4',
      paused: true,
      opacity: 0.0,
      duration: 0.5,
      x: -50,
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

export default class ArcherNamesComponent {
  view(vnode) {
    const { archer } = vnode.attrs;
    const { row } = vnode.attrs;
    const { winnerPred } = vnode.attrs;

    const archerData = archersRep.value[archer];

    return m('div', { class: `${archersContainer}`, style: `grid-row: ${row};` },
      m(ArcherNameTile, { name: archerData.name }),
      ...archerData.scores.end.map((s, i) => m(ArrowValueTile, { archer, value: s, col: i })),
      m(TotalTile, { value: archerData.scores.end.reduce(addScores, 0), col: 1 }),
      m(TotalTile, { value: archerData.scores.sets, col: 2 }),
      (winnerPred ? m(WinnerTile, { archer }) : undefined));
  }
}

archersRep.on('change', () => { m.redraw(); });
