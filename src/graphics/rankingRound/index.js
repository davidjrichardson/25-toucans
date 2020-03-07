import m from 'mithril';

import {
  container,
  toucan,
  leagueBrand,
  infoGrid,
  thirdsGrid,
  clickersBrand,
  clickersContainer,
  sponsoredBy,
} from '../common.css';

import {
  archerTile,
} from './styles.css';

const rankindEndRep = window.NodeCG.Replicant('rankingRoundEndCounter', 'archery');
const matchTitleRep = window.NodeCG.Replicant('matchTitle', 'archery');

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

class GenericTile {
  view(vnode) {
    const { text, row } = vnode.attrs;

    return m('div', { class: `${archerTile}`, style: `grid-row: ${row};` },
      m('span', text));
  }
}

class LowerThirdsComponent {
  view() {
    return m('div', { class: `${infoGrid}` },
      m(LeagueBrandComponent),
      m('div', { class: `${thirdsGrid}` },
        m(GenericTile, { text: matchTitleRep.value, row: 2 }),
        m(GenericTile, { text: `End ${rankindEndRep.value} of 20`, row: 3 })));
  }
}

class RankingRoundComponent {
  view() {
    return m('div', { class: `${container}` },
      m(LowerThirdsComponent),
      m(ClickersBrandComponent));
  }
}

window.NodeCG.waitForReplicants(rankindEndRep, matchTitleRep).then(() => {
  m.mount(document.body, RankingRoundComponent);
});

rankindEndRep.on('change', () => { m.redraw(); });
matchTitleRep.on('change', () => { m.redraw(); });
