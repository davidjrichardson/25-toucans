import m from 'mithril';
import {
  columnsContainer, matchTitle, endTitle, totalTitle,
  isGold, isBronze,
} from './styles.css';

const matchTitleRep = window.NodeCG.Replicant('matchTitle', 'archery');

class MatchTitleTile {
  getColour(t) {
    if (t.match(/gold/i)) {
      return `${isGold}`;
    }
    if (t.match(/bronze/i)) {
      return `${isBronze}`;
    }
    return '';
  }

  view(vnode) {
    const { title } = vnode.attrs;

    return m('div', { class: `${matchTitle} ${this.getColour(title)}` },
      m('span', title));
  }
}

class ArrowNumberTile {
  view(vnode) {
    const { end } = vnode.attrs;
    const { col } = vnode.attrs;

    return m('div', { class: `${endTitle}`, style: `grid-column: ${col + 1}` },
      m('span', end));
  }
}

class TotalTitleTile {
  view(vnode) {
    const { title } = vnode.attrs;
    const { col } = vnode.attrs;

    return m('div', { class: `${totalTitle}`, style: `grid-column: ${col + 5}` },
      m('span', title));
  }
}

export default class ColumnTitlesComponent {
  view(vnode) {
    const { showTimer } = vnode.attrs;
    const { totTitle } = vnode.attrs;

    return m('div', { class: `${columnsContainer}` },
      m(MatchTitleTile, { title: 'Gold boat race' }),
      [1, 2, 3].map((n) => m(ArrowNumberTile, { end: n, col: n })),
      m(TotalTitleTile, { title: 'E.T.', col: 1 }),
      m(TotalTitleTile, { title: totTitle, col: 2 }),
      (showTimer ? undefined : undefined));
  }
}

matchTitleRep.on('change', () => { m.redraw(); });
