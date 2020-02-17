import m from 'mithril';

import {
  button, form, input, helpText,
} from '../common.css';

const matchTitleRep = window.NodeCG.Replicant('matchTitle', 'archery');

class MatchInputComponent {
  view() {
    return m('div',
      m('form', {
        onsubmit: (ev) => {
          ev.preventDefault();
          matchTitleRep.value = ev.target[0].value;
        },
        class: `${form}`,
      }, m('input', {
        type: 'text',
        name: 'matchTitle',
        id: 'matchTitle',
        value: matchTitleRep.value,
        class: `${input}`,
      }), m('button', { type: 'submit', class: `${button}` }, 'Update')),
      m('p', { class: `${helpText}` }, 'Enter the match title above.'),
      m('p', { class: `${helpText}` }, '"Gold" and "Bronze" change the colour of the title for the respective medal matches.'));
  }
}

matchTitleRep.once('change', () => { m.mount(document.body, MatchInputComponent); });
matchTitleRep.on('change', () => { m.redraw(); });
