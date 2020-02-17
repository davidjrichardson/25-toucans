// TODO: Create an input field to change the match title
import m from 'mithril';

const matchTitleRep = window.NodeCG.Replicant('matchTitle', 'archery');

class MatchInputComponent {
  view() {
    return m('div',
      m('label', { for: 'matchTitle' }, 'Match Title'),
      m('input', { type: 'text', id: 'matchTitle' }));
  }
}

window.NodeCG.waitForReplicants(matchTitleRep).then(() => {
  m.mount(document.body, MatchInputComponent);
});
