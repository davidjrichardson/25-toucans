import m from 'mithril';

import {
  input,
  button,
  form,
  disabledInput,
} from '../common.css';

import {
  inputRow,
  inputGrid,
  archerName,
  colHeadings,
  colTitle,
  centerInput,
  buttonRow,
  buttonGreen,
  buttonRed,
  buttonBlue,
} from './styles.css';

const matchTypeRep = window.NodeCG.Replicant('matchType', 'archery');
const archersRep = window.NodeCG.Replicant('archers', 'archery');

function addScores(a, b) {
  if (b === '' || b === '-' || b === 'm' || b === 'M') {
    return parseInt(a, 10);
  }
  if (b.endsWith('*')) {
    return parseInt(a, 10) + parseInt(b.slice(0, 1), 10);
  }
  if (Number.isNaN(parseInt(b, 10))) {
    return parseInt(a, 10);
  }
  return parseInt(a, 10) + parseInt(b, 10);
}

class ArrowInputComponent {
  view(vnode) {
    const { archer, col, value } = vnode.attrs;

    return m('input', {
      type: 'text',
      class: `${input} ${centerInput}`,
      name: `archer${archer}-arrow${col}`,
      'data-col': `${col}`,
      'data-archer': `${archer}`,
      value,
      tabindex: 100 + archer + (col * 2),
    });
  }
}

class GenericInputComponent {
  view(vnode) {
    const {
      archer,
      value,
      name,
      gridCol,
      disabled,
    } = vnode.attrs;

    return m('input', {
      type: 'text',
      class: `${input} ${centerInput} ${disabled ? disabledInput : ''}`,
      name: `${name}-archer${archer}`,
      'data-archer': `${archer}`,
      value,
      style: `grid-column: ${gridCol}`,
      disabled,
    });
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

function nextEnd() {
  window.nodecg.sendMessage('nextEnd');
}

function undoClear() {
  window.nodecg.sendMessage('undoArcherChange');
}

function clearArchers() {
  window.nodecg.sendMessage('clearArchers');
}

class ButtonRowComponent {
  view() {
    return m('div', { class: `${buttonRow}` },
      m(GenericButtonComponent, {
        text: 'Clear',
        call: clearArchers,
        extraStyles: 'grid-column: 1',
        extraClasses: `${buttonRed}`,
      }),
      m(GenericButtonComponent, {
        text: 'Undo',
        call: undoClear,
        extraStyles: 'grid-column: 2',
        extraClasses: `${buttonBlue}`,
      }),
      m(GenericButtonComponent, {
        text: 'Next end',
        call: nextEnd,
        extraStyles: 'grid-column: 4',
        extraClasses: `${buttonGreen}`,
      }),
      m(SubmitButtonComponent, {
        text: 'Update',
        extraStyles: 'grid-column: 6',
      }));
  }
}

class ColumnTitleComponent {
  view(vnode) {
    const { text, col } = vnode.attrs;

    return m('span', { style: `grid-column: ${col}`, class: `${colTitle}` }, `${text}`);
  }
}

class ColumnHeadingsComponent {
  view() {
    return m('div', { class: `${inputRow} ${colHeadings}` },
      [1, 2, 3].map((x) => m(ColumnTitleComponent, { text: `Arrow ${x}`, col: (x + 1) })),
      m(ColumnTitleComponent, { text: 'Shoot off', col: 6 }),
      m(ColumnTitleComponent, { text: 'End total', col: 8 }),
      m(ColumnTitleComponent, {
        text: (matchTypeRep.value === 'recurve' ? 'Set points' : 'Running total'),
        col: 9,
      }));
  }
}

class ArcherInputComponent {
  view(vnode) {
    const { archer } = vnode.attrs;

    return m('div', { class: `${inputRow}` },
      m('span', { class: `${archerName}` }, archersRep.value[archer].name),
      archersRep.value[archer].scores.end.map((x, i) => m(ArrowInputComponent, {
        archer,
        col: i,
        value: x,
      })),
      m(GenericInputComponent, {
        archer,
        value: archersRep.value[archer].scores.shootOff,
        name: 'shootOff',
        gridCol: 6,
      }),
      m(GenericInputComponent, {
        archer,
        value: archersRep.value[archer].scores.end.reduce(addScores, 0),
        name: 'endTotal',
        gridCol: 8,
        disabled: true,
      }),
      m(GenericInputComponent, {
        archer,
        value: (matchTypeRep.value === 'recurve' ? archersRep.value[archer].scores.sets : archersRep.value[archer].scores.rt),
        name: 'matchTotal',
        gridCol: 9,
        disabled: true,
      }));
  }
}

class ScoreEntryComponent {
  view() {
    return m('form', {
      class: `${inputGrid} ${form}`,
      id: 'scoreForm',
      onsubmit: (ev) => {
        ev.preventDefault();
        const formData = new FormData(ev.target);
        const oldData = {
          'archer0-arrow0': archersRep.value[0].scores.end[0],
          'archer0-arrow1': archersRep.value[0].scores.end[1],
          'archer0-arrow2': archersRep.value[0].scores.end[2],
          'archer1-arrow0': archersRep.value[1].scores.end[0],
          'archer1-arrow1': archersRep.value[1].scores.end[1],
          'archer1-arrow2': archersRep.value[1].scores.end[2],
          'shootOff-archer0': archersRep.value[0].scores.shootOff,
          'shootOff-archer1': archersRep.value[1].scores.shootOff,
        };
        const newData = {
          'archer0-arrow0': formData.get('archer0-arrow0'),
          'archer0-arrow1': formData.get('archer0-arrow1'),
          'archer0-arrow2': formData.get('archer0-arrow2'),
          'archer1-arrow0': formData.get('archer1-arrow0'),
          'archer1-arrow1': formData.get('archer1-arrow1'),
          'archer1-arrow2': formData.get('archer1-arrow2'),
          'shootOff-archer0': formData.get('shootOff-archer0'),
          'shootOff-archer1': formData.get('shootOff-archer1'),
        };

        const changedKeys = [];
        Object.keys(newData).forEach((key) => {
          if (newData[key] !== oldData[key]) {
            changedKeys.push(key);
          }
        });

        const archer0Scores = {
          sets: archersRep.value[0].scores.sets,
          rt: archersRep.value[0].scores.rt,
          shootOff: newData['shootOff-archer0'],
          end: [newData['archer0-arrow0'], newData['archer0-arrow1'], newData['archer0-arrow2']],
        };
        const archer1Scores = {
          sets: archersRep.value[1].scores.sets,
          rt: archersRep.value[1].scores.rt,
          shootOff: newData['shootOff-archer1'],
          end: [newData['archer1-arrow0'], newData['archer1-arrow1'], newData['archer1-arrow2']],
        };

        console.log('Score update submitted');
        window.nodecg.sendMessage('updateScores', [archer0Scores, archer1Scores]);

        changedKeys.forEach((v) => { window.nodecg.sendMessage(`arrowChange-${v}`); });
        return false;
      },
    }, m(ColumnHeadingsComponent),
    m(ArcherInputComponent, { archer: 0 }),
    m(ArcherInputComponent, { archer: 1 }),
    m(ButtonRowComponent));
  }
}

window.NodeCG.waitForReplicants(archersRep, matchTypeRep).then(() => {
  m.mount(document.body, ScoreEntryComponent);
});

matchTypeRep.on('change', () => { m.redraw(); });
archersRep.on('change', () => { m.redraw(); });
