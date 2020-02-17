import m from 'mithril';

import {
  button, form, input, helpTextStyle, formRow, formLabel, formInput,
  submitWrapper, radioInput, radioLabel,
} from '../common.css';

const matchTitleRep = window.NodeCG.Replicant('matchTitle', 'archery');
const matchTypeRep = window.NodeCG.Replicant('matchType', 'archery');
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
const safeMatchType = () => (matchTypeRep.value || 'recurve');

class RadioButtonComponent {
  view(vnode) {
    const {
      name, values, labels, label, checkedValue,
    } = vnode.attrs;

    return m('div', { class: `${formRow}` },
      m('p', { class: `${formLabel}` }, `${label}`),
      m('div',
        ...values.map((v, i) => [
          m('label', { class: `${radioLabel}`, for: `${v}` }, `${labels[i]}`),
          m('input', {
            class: `${radioInput}`,
            type: 'radio',
            name: `${name}`,
            id: `${v}`,
            value: `${v}`,
            checked: (checkedValue === v ? 'checked' : ''),
          }),
        ])));
  }
}

class TextInputComponent {
  view(vnode) {
    const {
      label, value, id, helpText, placeholder,
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
          placeholder: (placeholder ? `${placeholder}` : 'Recurve team quarter finals'),
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
          matchTypeRep.value = document.querySelector('input[name="bowstyle"]:checked').value;
          archersRep.value[0].name = ev.target[3].value;
          archersRep.value[1].name = ev.target[4].value;
        },
        class: `${form}`,
      }, m(TextInputComponent, {
        label: 'Match title',
        id: 'matchTitle',
        value: matchTitleRep.value,
        helpText: '"Gold" and "Bronze" change the colour of the title for the respective medal matches.',
      }), m(RadioButtonComponent, {
        label: 'Match type',
        name: 'bowstyle',
        labels: ['Recurve', 'Compound'],
        values: ['recurve', 'compound'],
        checkedValue: safeMatchType(),
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

window.NodeCG.waitForReplicants(archersRep, matchTitleRep, matchTypeRep).then(() => {
  m.mount(document.body, MatchInfoComponent);
});
matchTitleRep.on('change', () => { m.redraw(); });
matchTypeRep.on('change', () => { m.redraw(); });
archersRep.on('change', () => { m.redraw(); });
