import m from 'mithril';
import {
  input,
  button,
  form,
  inputGrid,
  colHeadings,
  colTitle,
  archerName,
  centerInput,
  buttonRed,
  buttonGreen,
} from '../common.css';

import {
  inputRow,
  buttonRow,
} from './styles.css';

const shootOffRep = window.NodeCG.Replicant('shootOff', 'archery');
const archersRep = window.NodeCG.Replicant('archers', 'archery');

class ColumnTitleComponent {
  view(vnode) {
    const { text, col } = vnode.attrs;

    return m('span', { style: `grid-column: ${col}`, class: `${colTitle}` }, `${text}`);
  }
}

class ColumnHeadingsComponent {
  view() {
    return m('div', { class: `${colHeadings} ${inputRow}` },
      m(ColumnTitleComponent, { text: 'Arrow', col: 2 }),
      m(ColumnTitleComponent, { text: 'Is closest', col: 3 }));
  }
}

class GenericInputComponent {
  view(vnode) {
    const {
      archer,
      value,
      name,
    } = vnode.attrs;

    return m('input', {
      type: 'text',
      class: `${input} ${centerInput}`,
      name: `${name}-archer${archer}`,
      'data-archer': `${archer}`,
      value,
    });
  }
}

class RadioButtonComponent {
  view(vnode) {
    const {
      archer,
      name,
      checked,
    } = vnode.attrs;

    return m('input', {
      type: 'radio',
      name: `${name}`,
      value: `archer${archer}`,
      checked,
    });
  }
}

class InputRowComponent {
  view(vnode) {
    const { archer } = vnode.attrs;
    const archerData = archersRep.value[archer];
    const shootOffData = shootOffRep.value[archer];

    return m('div', { class: `${inputRow}` },
      m('span', { class: `${archerName}` }, archerData.name),
      m(GenericInputComponent, {
        name: 'shootOff',
        archer,
        value: shootOffData.value,
      }),
      m(RadioButtonComponent, {
        name: 'isCloser',
        archer,
        checked: shootOffData.isCloser,
      }));
  }
}

class GenericButtonComponent {
  view(vnode) {
    const {
      text,
      call,
      extraStyles,
      extraClasses,
    } = vnode.attrs;

    return m('button', {
      class: `${button} ${(extraClasses || '')}`,
      style: `${(extraStyles || '')}`,
      type: 'button',
      onclick: () => { call(); },
    }, text);
  }
}

class SubmitButtonComponent {
  view(vnode) {
    const { text, extraStyles, extraClasses } = vnode.attrs;

    return m('button', {
      type: 'submit',
      class: `${button}  ${(extraClasses || '')}`,
      style: `${(extraStyles || '')}`,
    }, text);
  }
}

function clearShootOff() {
  window.nodecg.sendMessage('clearShootOff');
}

function declareWinner() {
  const formData = new FormData(document.getElementById('shootOffForm'));
  const closestArrow = formData.get('isCloser');

  // If there's a closest arrow decision
  if (closestArrow) {
    window.nodecg.sendMessage('declareWinner', closestArrow);
  }
}

class ButtonRowComponent {
  view() {
    return m('div', { class: `${buttonRow}` }, m(GenericButtonComponent, {
      text: 'Clear',
      call: clearShootOff,
      extraClasses: `${buttonRed}`,
      extraStyles: 'grid-column: 1;',
    }),
    m(GenericButtonComponent, {
      text: 'Declare',
      call: declareWinner,
      extraClasses: `${buttonGreen}`,
      extraStyles: 'grid-column: 3;',
    }),
    m(SubmitButtonComponent, {
      text: 'Update',
      extraStyles: 'grid-column: 5;',
    }));
  }
}

class ShootOffComponent {
  view() {
    return m('form', {
      class: `${form} ${inputGrid}`,
      id: 'shootOffForm',
      onsubmit: (ev) => {
        ev.preventDefault();
        const formData = new FormData(ev.target);
        const oldData = {
          'shootOff-archer0': shootOffRep.value[0].value,
          'shootOff-archer1': shootOffRep.value[1].value,
        };
        const newData = {
          'shootOff-archer0': formData.get('shootOff-archer0'),
          'shootOff-archer1': formData.get('shootOff-archer1'),
        };

        const changedKeys = [];
        Object.keys(newData).forEach((key) => {
          if (newData[key] !== oldData[key]) {
            changedKeys.push(key);
          }
        });

        const shootOffData = [
          {
            value: newData['shootOff-archer0'],
            isCloser: formData.get('isCloser') === 'archer0',
          },
          {
            value: newData['shootOff-archer1'],
            isCloser: formData.get('isCloser') === 'archer1',
          },
        ];

        changedKeys.forEach((v) => { window.nodecg.sendMessage(`arrowChange-${v}`); });
        window.nodecg.sendMessage('updateShootOff', shootOffData);
        return false;
      },
    },
    m(ColumnHeadingsComponent),
    m(InputRowComponent, { archer: 0 }),
    m(InputRowComponent, { archer: 1 }),
    m(ButtonRowComponent));
  }
}

window.NodeCG.waitForReplicants(shootOffRep, archersRep).then(() => {
  m.mount(document.body, ShootOffComponent);
});

shootOffRep.on('change', () => { m.redraw(); });
archersRep.on('change', () => { m.redraw(); });
