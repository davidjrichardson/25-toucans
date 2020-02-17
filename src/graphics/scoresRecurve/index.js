import m from 'mithril';
// import gsap from 'gsap';

import ArcherComponent from '../archer';
import ColumnTitlesComponent from '../columnHeadings';
import {
  container, toucan, leagueBrand, infoGrid, thirdsGrid,
} from '../common.css';

const archersRep = window.NodeCG.Replicant('archers', 'archery');
const matchTitleRep = window.NodeCG.Replicant('matchTitle', 'archery');

const archers = [
  {
    name: 'Boaty McBoatrace',
    scores: {
      sets: 5,
      end: [10, 9, 8],
    },
  },
  {
    name: 'Arthur Coveney',
    scores: {
      sets: 3,
      end: [6, 4, 2],
    },
  },
];

class ToucanImageComponent {
  view() {
    return m('div', { class: `${toucan}` });
  }
}

class LeagueBrandComponent {
  view() {
    return m('div', { class: `${leagueBrand}` },
      m(ToucanImageComponent));
  }
}

class LowerThirdsComponent {
  view() {
    return m('div', { class: `${infoGrid}` },
      m(LeagueBrandComponent),
      m('div', { class: `${thirdsGrid}` },
        m(ColumnTitlesComponent, { maxPoints: 7, winnerThreshold: 6, totTitle: 'S.P.' }),
        m(ArcherComponent, {
          row: 2,
          archer: archers[0],
          winnerPred: archers[0].scores.sets >= 6,
        }),
        m(ArcherComponent, {
          row: 3,
          archer: archers[1],
          winnerPred: archers[1].scores.sets >= 6,
        })));
  }
}

class ScoresComponent {
  view() {
    return m('div', { class: `${container}` },
      m(LowerThirdsComponent));
  }
}

window.NodeCG.waitForReplicants(archersRep, matchTitleRep).then(() => {
  m.mount(document.body, ScoresComponent);
});

archersRep.on('change', () => { m.redraw(); });
