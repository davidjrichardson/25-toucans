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
  timeLeftColumn,
  timerControls,
} from './styles.css';

const archersTimerRep = window.NodeCG.Replicant('archerTimers', 'archery');
const archersRep = window.NodeCG.Replicant('archers', 'archery');

function getTimerColour(time) {
  if (time === 0) {
    return `${timeRed}`;
  }
  if (time <= 10) {
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

class TimeRemainingComponent {
  view(vnode) {
    const { time, archer } = vnode.attrs;

    return m('div', { class: `${timeLeftColumn}` },
      m('span', { style: 'display: block;' }, `${archersRep.value[archer].name}`),
      m('div', { class: `${timeLeftWrapper} ${getTimerColour(time)}` },
        m('span', { class: `${timeLeft}` }, `${time}s/`),
        m('span', { class: `${timeLeft}`, style: 'font-size: 16px !important;' }, '20s')));
  }
}

function startTimer() {
  window.nodecg.sendMessage('startShootOffTimers');

  document.getElementById('startShootOffTimers').style.display = 'none';
  document.getElementById('nextArcherButton').style.display = 'block';
  document.getElementById('pauseTimerButton').style.display = 'block';
}

function nextTimer() {
  window.nodecg.sendMessage('startNextTimer');

  document.getElementById('startShootOffTimers').style.display = 'none';
  document.getElementById('nextArcherButton').style.display = 'block';
  document.getElementById('pauseTimerButton').style.display = 'block';
}

function pauseTimers() {
  window.nodecg.sendMessage('stopShootOffTimers');

  document.getElementById('startShootOffTimers').style.display = 'block';
  document.getElementById('nextArcherButton').style.display = 'none';
  document.getElementById('pauseTimerButton').style.display = 'none';
}

function resetTimers() {
  window.nodecg.sendMessage('resetArcherTimers');

  document.getElementById('startShootOffTimers').style.display = 'block';
  document.getElementById('nextArcherButton').style.display = 'none';
  document.getElementById('pauseTimerButton').style.display = 'none';
}

window.nodecg.listenFor('clearArchers', () => {
  document.getElementById('startShootOffTimers').style.display = 'block';
  document.getElementById('nextArcherButton').style.display = 'none';
  document.getElementById('pauseTimerButton').style.display = 'none';
});

class TimingControlComponent {
  view() {
    return m('div', { class: 'foo' },
      m('div', { class: `${timeLeftContainer}` },
        m(TimeRemainingComponent, { archer: 0, time: archersTimerRep.value[0] }),
        m(TimeRemainingComponent, { archer: 1, time: archersTimerRep.value[1] })),
      m('div', { class: `${timerControls}` },
        m(GenericButtonComponent, {
          id: 'startShootOffTimers',
          call: startTimer,
          text: 'Start timer',
          extraClasses: `${buttonGreen}`,
        }),
        m(GenericButtonComponent, {
          text: 'Next archer',
          id: 'nextArcherButton',
          call: nextTimer,
          extraClasses: `${buttonBlue}`,
          extraStyles: 'display: none;',
        }),
        m(GenericButtonComponent, {
          text: 'Pause timer',
          id: 'pauseTimerButton',
          call: pauseTimers,
          extraStyles: 'display: none;',
        }),
        m('div', { class: `${sectionSpacer}` }),
        m(GenericButtonComponent, {
          text: 'Reset timers',
          call: resetTimers,
          extraClasses: `${buttonRed}`,
        })));
  }
}

window.NodeCG.waitForReplicants(archersTimerRep, archersRep).then(() => {
  m.mount(document.body, TimingControlComponent);
});

archersTimerRep.on('change', () => { m.redraw(); });
archersRep.on('change', () => { m.redraw(); });
