for (const list of document.querySelectorAll('.sample-tabs [role="tablist"]')) {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  function select(target) {
    for (const tab of tabs) {
      const active = tab === target;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      panel.hidden = !active;
      panel.setAttribute('aria-hidden', String(!active));
      panel.inert = !active;
    }
  }
  select(tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0]);
  list.addEventListener('click', event => {
    const tab = event.target.closest('[role="tab"]');
    if (tab && tabs.includes(tab)) select(tab);
  });
  list.addEventListener('keydown', event => {
    const current = tabs.indexOf(event.target);
    const next = { ArrowLeft: (current + tabs.length - 1) % tabs.length, ArrowRight: (current + 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
    if (current < 0 || next === undefined) return;
    event.preventDefault();
    select(tabs[next]);
    tabs[next].focus();
  });
}
