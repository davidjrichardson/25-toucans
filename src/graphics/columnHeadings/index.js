import m from 'mithril';
import {
  columnsContainer, matchTitle, endTitle, totalTitle,
  isGold, isBronze,
} from './styles.css';

const matchTitleRep = window.NodeCG.Replicant('matchTitle', 'archery');
const matchTypeRep = window.NodeCG.Replicant('matchType', 'archery');
const matchEndRep = window.NodeCG.Replicant('matchEndCount', 'archery');

const safeMatchType = () => (matchTypeRep.value || 'recurve');

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
    const { end, col } = vnode.attrs;

    return m('div', { class: `${endTitle}`, style: `grid-column: ${col + 1}` },
      m('span', end));
  }
}

class TotalTitleTile {
  view(vnode) {
    const { title, col } = vnode.attrs;

    return m('div', { class: `${totalTitle}`, style: `grid-column: ${col + 5}` },
      m('span', title));
  }
}

export default class ColumnTitlesComponent {
  view(vnode) {
    const { showTimer } = vnode.attrs;

    return m('div', { class: `${columnsContainer}` },
      m(MatchTitleTile, { title: `${matchTitleRep.value} - End ${matchEndRep.value}` }),
      [1, 2, 3].map((n) => m(ArrowNumberTile, { end: n, col: n })),
      m(TotalTitleTile, { title: 'E.T.', col: 1 }),
      m(TotalTitleTile, { title: (safeMatchType() === 'compound' ? 'R.T.' : 'S.P.'), col: 2 }),
      (showTimer ? undefined : undefined));
  }
}

matchTitleRep.on('change', () => { m.redraw(); });
matchTypeRep.on('change', () => { m.redraw(); });
matchEndRep.on('change', () => { m.redraw(); });
