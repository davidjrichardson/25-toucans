import m from 'mithril';

import {
  container,
  toucan,
  leagueBrand,
  infoGrid,
} from '../common.css';

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
    return m('div', { class: `${infoGrid}`, style: 'bottom: 64px;' },
      m(LeagueBrandComponent));
  }
}

class ToucanComponent {
  view() {
    return m('div', { class: `${container}` },
      m(LowerThirdsComponent));
  }
}

m.mount(document.body, ToucanComponent);
