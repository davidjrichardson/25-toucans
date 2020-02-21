import m from 'mithril';

import {
  button, form, input, helpTextStyle, formRow, formLabel, formInput,
  submitWrapper, radioInput, radioLabel,
} from '../common.css';

const matchTitleRep = window.NodeCG.Replicant('matchTitle', 'archery');
const matchTypeRep = window.NodeCG.Replicant('matchType', 'archery');
const archersRep = window.NodeCG.Replicant('archers', 'archery');

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
          const formData = new FormData(ev.target);

          window.nodecg.sendMessage('updateArchers', [
            formData.get('archer0Name'),
            formData.get('archer1Name'),
          ]);
          window.nodecg.sendMessage('updateMatchType', formData.get('bowstyle'));
          window.nodecg.sendMessage('updateMatchTitle', formData.get('matchTitle'));

          return false;
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
        checkedValue: matchTypeRep.value,
      }), m(TextInputComponent, {
        label: 'Name of Archer 1',
        placeholder: 'Bob Ross',
        id: 'archer0Name',
        value: archersRep.value[0].name,
      }), m(TextInputComponent, {
        label: 'Name of Archer 2',
        placeholder: 'Boaty McBoatrace',
        id: 'archer1Name',
        value: archersRep.value[1].name,
      }), m(SubmitButtonComponent, { text: 'Update' })));
  }
}

window.NodeCG.waitForReplicants(archersRep, matchTitleRep, matchTypeRep).then(() => {
  m.mount(document.body, MatchInfoComponent);
});

matchTitleRep.on('change', () => { m.redraw(); });
matchTypeRep.on('change', () => { m.redraw(); });
archersRep.on('change', () => { m.redraw(); });
