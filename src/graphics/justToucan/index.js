import m from 'mithril';

import {
  container,
  toucan,
  leagueBrand,
  infoGrid,
  clickersBrand,
  clickersContainer,
  sponsoredBy,
} from '../common.css';

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

class LowerThirdsComponent {
  view() {
    return m('div', { class: `${infoGrid}`, style: 'bottom: 64px;' },
      m(LeagueBrandComponent));
  }
}

class ToucanComponent {
  view() {
    return m('div', { class: `${container}` },
      m(LowerThirdsComponent),
      m(ClickersBrandComponent));
  }
}

m.mount(document.body, ToucanComponent);
