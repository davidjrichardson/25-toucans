import m from 'mithril';

import {
  button, form, input, helpTextStyle, formRow, formLabel, formInput,
  submitWrapper,
} from '../common.css';

const matchTitleRep = window.NodeCG.Replicant('matchTitle', 'archery');
const archersRep = window.NodeCG.Replicant('archers', 'archery');

const emptyArchers = [
  {
    name: '',
    scores: {
      sets: 0,
      rt: 0,
      end: ['', '', ''],
    },
  },
  {
    name: '',
    scores: {
      sets: 0,
      rt: 0,
      end: ['', '', ''],
    },
  },
];

const safeArchers = () => (archersRep.value || emptyArchers);

class TextInputComponent {
  view(vnode) {
    const {
      label, value, id, helpText, placeholder
    } = vnode.attrs;

    return m('div', { class: `${formRow}` },
      m('label', { for: `${id}`, class: `${formLabel}` }, `${label}`),
      m('div', { class: `${formInput}` },
        m('input', {
          type: 'text',
          name: `${id}`,
          id: `${id}`,
          value: `${value}`,
          class: `${input}`,
          placeholder: `${placeholder}`
        })),
      (helpText ? m('p', { class: `${helpTextStyle}` }, helpText) : undefined));
  }
}

class SubmitButtonComponent {
  view(vnode) {
    const { text } = vnode.attrs;

    return m('div', { class: `${formRow}` },
      m('div', { class: `${submitWrapper}` },
        m('button', { type: 'submit', class: `${button}` }, text)));
  }
}

class MatchInfoComponent {
  view() {
    return m('div',
      m('form', {
        onsubmit: (ev) => {
          ev.preventDefault();
          matchTitleRep.value = ev.target[0].value;
          if (!archersRep.value) {
            archersRep.value = emptyArchers;
          }

          archersRep.value[0].name = ev.target[1].value;
          archersRep.value[1].name = ev.target[2].value;
        },
        class: `${form}`,
      }, m(TextInputComponent, {
        label: 'Match title',
        id: 'matchTitle',
        value: matchTitleRep.value,
        helpText: '"Gold" and "Bronze" change the colour of the title for the respective medal matches.',
      }), m(TextInputComponent, {
        label: 'Name of Archer 1',
        placeholder: 'Bob Ross',
        id: 'archer1Name',
        value: safeArchers()[0].name,
      }), m(TextInputComponent, {
        label: 'Name of Archer 2',
        placeholder: 'Boaty McBoatrace',
        id: 'archer2Name',
        value: safeArchers()[1].name,
      }), m(SubmitButtonComponent, { text: 'Update' })));
  }
}

window.NodeCG.waitForReplicants(archersRep, matchTitleRep).then(() => {
  m.mount(document.body, MatchInfoComponent);
});
matchTitleRep.on('change', () => { m.redraw(); });
archersRep.on('change', () => { m.redraw(); });
