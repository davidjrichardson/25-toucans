import m from 'mithril';
import {
  button,
  fullWidth,
  buttonGreen,
  buttonRed,
  buttonBlue,
  timeLeftWrapper,
  timeLeft,
  timeGreen,
  timeAmber,
  timeRed,
  sectionSpacer,
} from '../common.css';

import {
  timeLeftContainer,
} from './styles.css';

const globalTimerRep = window.NodeCG.Replicant('globalTimer', 'archery');

function getTimerColour() {
  if (globalTimerRep.value.startTime <= 20) {
    if (globalTimerRep.value.time === 0) {
      return `${timeRed}`;
    }
    if (globalTimerRep.value.time <= 10) {
      return `${timeAmber}`;
    }
    return `${timeGreen}`;
  }

  if (globalTimerRep.value.time === 0) {
    return `${timeRed}`;
  }
  if (globalTimerRep.value.time <= 30) {
    return `${timeAmber}`;
  }
  return `${timeGreen}`;
}

class GenericButtonComponent {
  view(vnode) {
    const {
      id,
      text,
      call,
      extraStyles,
      extraClasses,
    } = vnode.attrs;

    return m('button', {
      class: `${button} ${fullWidth} ${(extraClasses || '')}`,
      style: `${(extraStyles || '')}`,
      type: 'button',
      onclick: () => { call(); },
      id,
    }, text);
  }
}

class TimerSpanComponent {
  view(vnode) {
    const { time, start } = vnode.attrs;

    return m('div', { class: `${timeLeftContainer}` },
      m('span', { style: 'display: block;' }, 'Time remaining:'),
      m('div', { class: `${timeLeftWrapper} ${getTimerColour()}` },
        m('span', { class: `${timeLeft}` }, `${time}s/`),
        m('span', { class: `${timeLeft}`, style: 'font-size: 16px !important;' }, `${start}s`)));
  }
}

const startGlobalTimer = () => {
  window.nodecg.sendMessage('resumeGlobalTimer');
  document.getElementById('startGlobalButton').style.display = 'none';
  document.getElementById('pauseGlobalButton').style.display = 'block';
};

const pauseGlobalTimer = () => {
  window.nodecg.sendMessage('pauseGlobalTimer');
  document.getElementById('startGlobalButton').style.display = 'block';
  document.getElementById('pauseGlobalButton').style.display = 'none';
};

const resetGlobalTimer = () => {
  window.nodecg.sendMessage('resetGlobalTimer');
  document.getElementById('startGlobalButton').style.display = 'block';
  document.getElementById('pauseGlobalButton').style.display = 'none';
};

const setGlobalTimer20s = () => {
  window.nodecg.sendMessage('setGlobalTimer', 20);
};

const setGlobalTimer120s = () => {
  window.nodecg.sendMessage('setGlobalTimer', 120);
};

window.nodecg.listenFor('globalTimerFinished', () => {
  document.getElementById('pauseGlobalButton').style.display = 'none';
});

window.nodecg.listenFor('nextEnd', () => {
  document.getElementById('startGlobalButton').style.display = 'block';
  document.getElementById('pauseGlobalButton').style.display = 'none';
});

class TimingControlComponent {
  view() {
    return m('div',
      m(TimerSpanComponent, {
        time: globalTimerRep.value.time,
        start: globalTimerRep.value.startTime,
      }),
      m(GenericButtonComponent, {
        id: 'startGlobalButton',
        text: 'Start',
        call: startGlobalTimer,
        extraClasses: `${buttonGreen}`,
      }),
      m(GenericButtonComponent, {
        id: 'pauseGlobalButton',
        text: 'Pause',
        call: pauseGlobalTimer,
        extraStyles: 'display: none;',
      }),
      m(GenericButtonComponent, {
        id: 'setGlobalTime20',
        text: 'Set timer (20s)',
        call: setGlobalTimer20s,
        extraClasses: `${buttonBlue}`,
        extraStyles: `display: ${globalTimerRep.value.startTime === 20 ? 'none' : 'block'}`,
      }),
      m(GenericButtonComponent, {
        id: 'setGlobalTime120',
        text: 'Set timer (120s)',
        call: setGlobalTimer120s,
        extraClasses: `${buttonBlue}`,
        extraStyles: `display: ${globalTimerRep.value.startTime === 120 ? 'none' : 'block'}`,
      }),
      m('div', { class: `${sectionSpacer}` }),
      m(GenericButtonComponent, {
        id: 'resetGlobalButton',
        text: 'Reset',
        call: resetGlobalTimer,
        extraClasses: `${buttonRed}`,
      }));
  }
}

window.NodeCG.waitForReplicants(globalTimerRep).then(() => {
  m.mount(document.body, TimingControlComponent);
});

globalTimerRep.on('change', () => { m.redraw(); });
