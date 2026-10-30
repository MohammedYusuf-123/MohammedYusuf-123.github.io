(() => {
  'use strict';
  const key = 'ahe603-reading-preferences';
  const defaults = { textSize: '100', contrast: false, spacing: false, motion: false, theme: 'system' };
  const sizes = ['100', '125', '150', '175', '200'];
  const sanitize = value => ({
    textSize: sizes.includes(value?.textSize) ? value.textSize : '100',
    contrast: value?.contrast === true,
    spacing: value?.spacing === true,
    motion: value?.motion === true,
    theme: ['system','light','dark'].includes(value?.theme) ? value.theme : 'system'
  });
  let settings = { ...defaults };
  try { settings = sanitize(JSON.parse(localStorage.getItem(key))); } catch (_) { /* Browser storage is optional. */ }
  const icon = name => {
    const paths = {
      tools:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
      access:'<circle cx="12" cy="4" r="2"/><path d="M4 8l8 2 8-2M12 10v5m0 0l-5 6m5-6l5 6"/>',
      moon:'<path d="M20 14A8 8 0 0 1 10 4a8.5 8.5 0 1 0 10 10Z"/>',
      sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
      email:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>'
    };
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[name]+'</svg>';
  };
  const apply = () => {
    const root = document.documentElement;
    root.style.setProperty('--text-scale', String(Number(settings.textSize) / 100));
    root.dataset.textSize = settings.textSize;
    root.dataset.contrast = settings.contrast ? 'high' : 'default';
    root.dataset.readingSpacing = settings.spacing ? 'comfortable' : 'default';
    root.dataset.reduceMotion = String(settings.motion);
    const dark = settings.theme === 'dark' || (settings.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    const toggle = document.querySelector('.theme-toggle');
    if(toggle){toggle.innerHTML=icon(dark?'sun':'moon')+'<span>'+(dark?'Light mode':'Dark mode')+'</span>';toggle.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');}

  };
  apply();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',apply);
  // Skip native navigation transitions when either preference requests less motion.
  for (const eventName of ['pageswap', 'pagereveal']) {
    window.addEventListener(eventName, event => {
      if (settings.motion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) event.viewTransition?.skipTransition();
    });
  }
  const initialize = () => {
    const launcher = document.createElement('button');
    launcher.type = 'button'; launcher.className = 'accessibility-launch';
    launcher.innerHTML = icon('access')+'<span>Accessibility</span>';
    launcher.setAttribute('aria-haspopup', 'dialog');
    launcher.setAttribute('aria-controls', 'reading-preferences');
    launcher.setAttribute('aria-expanded', 'false');
    const dialog = document.createElement('dialog');
    dialog.id = 'reading-preferences'; dialog.className = 'accessibility-dialog';
    dialog.setAttribute('aria-labelledby', 'reading-preferences-title');
    dialog.setAttribute('aria-describedby', 'reading-preferences-description');
    dialog.innerHTML = `
      <div class="preferences-heading"><h2 id="reading-preferences-title">Reading preferences</h2><button class="preferences-close" type="button" aria-label="Close reading preferences">×</button></div>
      <p id="reading-preferences-description">Choose how you would like to read this site.</p>
      <div class="preferences-field"><label for="reading-theme">Color theme</label><select id="reading-theme"><option value="system">Use device setting</option><option value="light">Light</option><option value="dark">Dark</option></select></div>
      <div class="preferences-field"><label for="reading-text-size">Text size</label><select id="reading-text-size"><option value="100">Default (100%)</option><option value="125">Larger (125%)</option><option value="150">Large (150%)</option><option value="175">Very large (175%)</option><option value="200">Largest (200%)</option></select></div>
      <label class="preferences-toggle"><input type="checkbox" id="reading-contrast"><span>Higher contrast</span></label>
      <label class="preferences-toggle"><input type="checkbox" id="reading-spacing"><span>Increased text spacing</span></label>
      <label class="preferences-toggle"><input type="checkbox" id="reading-motion"><span>Reduce motion</span></label>
      <p class="preferences-note">Your device’s reduced-motion setting also disables animations. These settings apply to website text. Text inside slide images and PDF files is unchanged; use the readable text versions or your browser’s zoom for those materials.</p>
      <div class="preferences-actions"><button class="button button-light preferences-reset" type="button">Reset preferences</button><button class="button preferences-done" type="button">Done</button></div>
      <p class="preferences-status" role="status" aria-live="polite"></p>`;
    document.body.append(launcher, dialog);
    const theme = dialog.querySelector('#reading-theme');
    const size = dialog.querySelector('#reading-text-size');
    const contrast = dialog.querySelector('#reading-contrast');
    const spacing = dialog.querySelector('#reading-spacing');
    const motion = dialog.querySelector('#reading-motion');
    const status = dialog.querySelector('.preferences-status');
    const synchronize = () => {
      theme.value = settings.theme; size.value = settings.textSize; contrast.checked = settings.contrast;
      spacing.checked = settings.spacing; motion.checked = settings.motion;
    };
    const save = () => { try { localStorage.setItem(key, JSON.stringify(settings)); } catch (_) { /* Preferences still work for this page. */ } };
    const themeToggle = document.createElement('button'); themeToggle.type='button';themeToggle.className='theme-toggle';
    const tools = document.createElement('div'); tools.className='site-tools';
    const trigger = document.createElement('button');trigger.type='button';trigger.className='tools-trigger';
    trigger.innerHTML=icon('tools');trigger.title='Site tools';trigger.setAttribute('aria-label','Site tools');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','site-tools-panel');
    const panel=document.createElement('div');panel.className='tools-panel';panel.id='site-tools-panel';panel.hidden=true;panel.setAttribute('role','group');panel.setAttribute('aria-label','Site tools');
    const contact=document.createElement('button');contact.type='button';contact.className='tools-contact';contact.innerHTML=icon('email')+'<span>Contact me</span>';
    contact.setAttribute('aria-haspopup','dialog');contact.setAttribute('aria-controls','contact-details');contact.setAttribute('aria-expanded','false');
    const contactDialog=document.createElement('dialog');contactDialog.id='contact-details';contactDialog.className='accessibility-dialog contact-dialog';contactDialog.setAttribute('aria-labelledby','contact-title');
    contactDialog.innerHTML=`<div class="preferences-heading"><h2 id="contact-title">Contact me</h2><button class="preferences-close contact-close" type="button" aria-label="Close contact details">×</button></div>
      <p class="contact-name">Mohammed Yusuf Mujawar</p><p class="contact-affiliation">Computer Science · The University of Alabama</p>
      <p class="contact-email-label" id="contact-email-label">Email address</p><p class="contact-email" aria-labelledby="contact-email-label">mmujawar@crimson.ua.edu</p>
      <div class="preferences-actions"><button type="button" class="button copy-email">Copy email</button><a class="button button-light" href="mailto:mmujawar@crimson.ua.edu">Open email app</a></div>
      <p class="contact-help">You can paste the address into any email service. Opening an email app requires a configured email account on your device.</p><p class="contact-status" role="status" aria-live="polite"></p>`;
    document.body.append(contactDialog);
    const modalOpen=()=>dialog.open||contactDialog.open;
    panel.append(launcher,themeToggle,contact);tools.append(trigger,panel);document.body.append(tools);
    const backTop=document.createElement('button');backTop.type='button';backTop.className='scroll-top';backTop.setAttribute('aria-label','Back to top');backTop.title='Back to top';
    backTop.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 11 6-6 6 6M12 5v14"/></svg>';
    document.body.append(backTop);
    const updateBackTop=()=>{backTop.hidden=window.scrollY<400||!panel.hidden||modalOpen();};
    window.addEventListener('scroll',updateBackTop,{passive:true});updateBackTop();
    backTop.addEventListener('click',()=>{
      const reduced=settings.motion||matchMedia('(prefers-reduced-motion:reduce)').matches;
      window.scrollTo({top:0,behavior:reduced?'instant':'smooth'});
      document.querySelector('.brand')?.focus({preventScroll:true});
    });
    let clickOpen=false,keyboardInput=false;
    const expand = open => {panel.hidden=!open;trigger.setAttribute('aria-expanded',String(open));if(!open)clickOpen=false;updateBackTop();};
    document.addEventListener('keydown',event=>{if(['Tab','Enter',' ','ArrowDown','ArrowUp'].includes(event.key))keyboardInput=true;});
    document.addEventListener('pointerdown',()=>{keyboardInput=false;},{passive:true});
    tools.addEventListener('pointermove',()=>{keyboardInput=false;},{passive:true});
    trigger.addEventListener('click',()=>{clickOpen=!clickOpen;expand(clickOpen);});
    tools.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover) and (pointer:fine)').matches)expand(true);});
    tools.addEventListener('mouseleave',()=>{
      if(modalOpen()||(keyboardInput&&tools.contains(document.activeElement)))return;
      if(panel.contains(document.activeElement))trigger.focus();
      expand(false);
    });
    tools.addEventListener('focusout',()=>setTimeout(()=>{if(!tools.contains(document.activeElement)&&!modalOpen())expand(false);},0));
    document.addEventListener('click',event=>{if(!event.composedPath().includes(tools)&&!event.composedPath().includes(dialog)&&!event.composedPath().includes(backTop)&&!modalOpen())expand(false);});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!modalOpen()&&!panel.hidden){expand(false);trigger.focus();}});
    themeToggle.addEventListener('click',()=>{settings.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';apply();save();synchronize();expand(true);themeToggle.focus();});
    contact.addEventListener('click',()=>{contactDialog.querySelector('.contact-status').textContent='';contactDialog.showModal();expand(false);contact.setAttribute('aria-expanded','true');});
    contactDialog.querySelector('.contact-close').addEventListener('click',()=>contactDialog.close());
    contactDialog.addEventListener('close',()=>{expand(true);contact.setAttribute('aria-expanded','false');contact.focus();});
    contactDialog.querySelector('.copy-email').addEventListener('click',async()=>{
      const message=contactDialog.querySelector('.contact-status');
      try{await navigator.clipboard.writeText('mmujawar@crimson.ua.edu');message.textContent='Email address copied.';}
      catch(_){const range=document.createRange();range.selectNodeContents(contactDialog.querySelector('.contact-email'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);message.textContent='Select and copy the email address above.';}
    });
    apply(); synchronize();
    launcher.addEventListener('click', () => {
      status.textContent = ''; dialog.showModal();expand(false); launcher.setAttribute('aria-expanded', 'true');
    });
    dialog.addEventListener('close', () => { expand(true);launcher.setAttribute('aria-expanded', 'false'); launcher.focus(); });
    dialog.querySelector('.preferences-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.preferences-done').addEventListener('click', () => dialog.close());
    dialog.addEventListener('change', () => {
      settings = sanitize({ theme: theme.value, textSize: size.value, contrast: contrast.checked, spacing: spacing.checked, motion: motion.checked });
      apply(); save(); status.textContent = 'Reading preferences updated.';
    });
    dialog.querySelector('.preferences-reset').addEventListener('click', () => {
      settings = { ...defaults }; apply(); synchronize();
      try { localStorage.removeItem(key); } catch (_) { /* Storage may be unavailable. */ }
      status.textContent = 'Default reading preferences restored.';
    });
    window.addEventListener('storage', event => {
      if (event.key === key) {
        try { settings = sanitize(JSON.parse(event.newValue)); } catch (_) { settings = { ...defaults }; }
        apply(); synchronize();
      }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
