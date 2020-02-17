import m from 'mithril';
import gsap from 'gsap';
import {
  archerTile, archersContainer, scoreTile, isGold,
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

    const changeFlash = gsap.from(vnode.dom, {
      easing: 'power4',
      paused: true,
      backgroundColor: '#FFF',
      borderColor: '#FFF',
      color: '#FFF',
      duration: 0.5,
    });

    window.nodecg.listenFor(`arrowChange-${archer}-${col}`, () => {
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
  if (b === '' || b === '-') {
    return a;
  }
  return a + b;
}

export default class ArcherNamesComponent {
  view(vnode) {
    const { archer } = vnode.attrs;
    const { row } = vnode.attrs;
    const { winnerPred } = vnode.attrs;

    const archerData = archersRep.value[archer];

    console.log(archerData);

    return m('div', { class: `${archersContainer}`, style: `grid-row: ${row};` },
      m(ArcherNameTile, { name: archerData.name }),
      ...archerData.scores.end.map((s, i) => m(ArrowValueTile, { value: s, col: i })),
      m(TotalTile, { value: archerData.scores.end.reduce(addScores, 0), col: 1 }),
      m(TotalTile, { value: archerData.scores.sets, col: 2 }),
      (winnerPred ? m(WinnerTile, { archer }) : undefined));
  }
}

archersRep.on('change', () => { m.redraw(); });
