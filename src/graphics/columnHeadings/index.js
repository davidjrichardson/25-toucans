import m from 'mithril';
import gsap from 'gsap';
import {
  columnsContainer, matchTitle, endTitle, totalTitle,
  isGold, isBronze, shootOffTitle,
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

class ShootOffTitleTile {
  oncreate(vnode) {
    const { fadeIndex } = vnode.attrs;

    window.nodecg.listenFor('startShootOff', () => {
      gsap.fromTo(vnode.dom, {
        display: 'block',
        opacity: 0,
        x: -50,
      }, {
        ease: 'power4.out',
        x: 0,
        opacity: 1,
        delay: 1 + 0.15 * fadeIndex,
      });
    });

    window.nodecg.listenFor('clearArchers', () => {
      const delay = Math.abs(fadeIndex - 8) * 0.15;

      gsap.set(vnode.dom, {
        ease: 'power4.out',
        x: -50,
        opacity: 0,
        display: 'none',
        delay,
      });
    });
  }

  view() {
    return m('div', { class: `${matchTitle} ${shootOffTitle}` },
      m('span', 'S.O.'));
  }
}

class ArrowNumberTile {
  oncreate(vnode) {
    const { fadeIndex } = vnode.attrs;

    window.nodecg.listenFor('startShootOff', () => {
      gsap.to(vnode.dom, {
        duration: 0.5,
        ease: 'power4.in',
        opacity: 0,
        x: -50,
        delay: 0.15 * fadeIndex,
      }).then(() => {
        gsap.set(vnode.dom, { display: 'none' });
      });
    });

    window.nodecg.listenFor('clearArchers', () => {
      if ((vnode.dom.style.opacity || '1') === '0') {
        const delay = Math.abs(fadeIndex - 8) * 0.15 * 1000;
        window.setTimeout(() => {
          gsap.fromTo(vnode.dom, {
            opacity: 0,
            x: -50,
            display: 'block',
          }, {
            ease: 'power4.out',
            duration: 0.5,
            opacity: 1,
            x: 0,
          });
        }, delay);
      }
    });
  }

  view(vnode) {
    const { end, col } = vnode.attrs;

    return m('div', { class: `${endTitle}`, style: `grid-column: ${col + 1}` },
      m('span', end));
  }
}

class TotalTitleTile {
  oncreate(vnode) {
    const { fadeIndex } = vnode.attrs;

    window.nodecg.listenFor('startShootOff', () => {
      gsap.to(vnode.dom, {
        duration: 0.5,
        ease: 'power4.in',
        opacity: 0,
        x: -50,
        delay: 0.15 * fadeIndex,
      }).then(() => {
        gsap.set(vnode.dom, { display: 'none' });
      });
    });

    window.nodecg.listenFor('clearArchers', () => {
      if ((vnode.dom.style.opacity || '1') === '0') {
        const delay = Math.abs(fadeIndex - 8) * 0.15 * 1000;
        window.setTimeout(() => {
          gsap.fromTo(vnode.dom, {
            opacity: 0,
            x: -50,
            display: 'block',
          }, {
            ease: 'power4.out',
            duration: 0.5,
            opacity: 1,
            x: 0,
          });
        }, delay);
      }
    });
  }

  view(vnode) {
    const { title, col } = vnode.attrs;

    return m('div', { class: `${totalTitle}`, style: `grid-column: ${col + 5}` },
      m('span', title));
  }
}

export default class ColumnTitlesComponent {
  view() {
    const matchTitleFormatted = (matchEndRep.value < 6
      ? `${matchTitleRep.value} - End ${matchEndRep.value}` : `${matchTitleRep.value} - Shoot off`);

    return m('div', { class: `${columnsContainer}` },
      m(MatchTitleTile, {
        title: matchTitleFormatted,
      }), [1, 2, 3].map((n, i) => m(ArrowNumberTile, {
        end: n,
        col: n,
        fadeIndex: (Math.abs(i - 3) + 1),
      })), m(TotalTitleTile, { title: 'E.T.', col: 1, fadeIndex: 1 }),
      m(TotalTitleTile, { title: (safeMatchType() === 'compound' ? 'R.T.' : 'S.P.'), col: 2, fadeIndex: 0 }),
      m(ShootOffTitleTile, { fadeIndex: 7 }));
  }
}

matchTitleRep.on('change', () => { m.redraw(); });
matchTypeRep.on('change', () => { m.redraw(); });
matchEndRep.on('change', () => { m.redraw(); });
