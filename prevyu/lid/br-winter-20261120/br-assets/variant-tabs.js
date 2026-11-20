for (const list of document.querySelectorAll('.sample-tabs [role="tablist"]')) {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  function select(target) {
    for (const tab of tabs) {
      tab.setAttribute('aria-selected', String(tab === target));
      tab.tabIndex = tab === target ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = tab !== target;
    }
  }
  list.addEventListener('click', event => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) select(tab);
  });
  list.addEventListener('keydown', event => {
    const current = tabs.indexOf(event.target);
    const next = {
      ArrowLeft: (current + tabs.length - 1) % tabs.length,
      ArrowRight: (current + 1) % tabs.length,
      Home: 0, End: tabs.length - 1,
    }[event.key];
    if (current < 0 || next === undefined) return;
    event.preventDefault();
    select(tabs[next]);
    tabs[next].focus();
  });
}
