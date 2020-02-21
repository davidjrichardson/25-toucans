import m from 'mithril';
// import gsap from 'gsap';

import ArcherComponent from '../archer';
import ColumnTitlesComponent from '../columnHeadings';
import {
  container, toucan, leagueBrand, infoGrid, thirdsGrid,
} from '../common.css';

const archersRep = window.NodeCG.Replicant('archers', 'archery');
const matchTitleRep = window.NodeCG.Replicant('matchTitle', 'archery');

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
        m(ColumnTitlesComponent),
        m(ArcherComponent, {
          row: 2,
          archer: 0,
        }),
        m(ArcherComponent, {
          row: 3,
          archer: 1,
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
