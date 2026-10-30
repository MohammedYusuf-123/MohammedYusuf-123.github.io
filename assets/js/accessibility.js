(() => {
  'use strict';
  const key = 'ahe603-reading-preferences';
  const defaults = { textSize: '100', contrast: false, spacing: false, motion: false };
  const sizes = ['100', '125', '150', '175', '200'];
  const sanitize = value => ({
    textSize: sizes.includes(value?.textSize) ? value.textSize : '100',
    contrast: value?.contrast === true,
    spacing: value?.spacing === true,
    motion: value?.motion === true
  });
  let settings = { ...defaults };
  try { settings = sanitize(JSON.parse(localStorage.getItem(key))); } catch (_) { /* Browser storage is optional. */ }
  const apply = () => {
    const root = document.documentElement;
    root.style.setProperty('--text-scale', String(Number(settings.textSize) / 100));
    root.dataset.contrast = settings.contrast ? 'high' : 'default';
    root.dataset.readingSpacing = settings.spacing ? 'comfortable' : 'default';
    root.dataset.reduceMotion = String(settings.motion);
  };
  apply();
  const initialize = () => {
    const launcher = document.createElement('button');
    launcher.type = 'button'; launcher.className = 'accessibility-launch';
    launcher.textContent = 'Accessibility';
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
      <div class="preferences-field"><label for="reading-text-size">Text size</label><select id="reading-text-size"><option value="100">Default (100%)</option><option value="125">Larger (125%)</option><option value="150">Large (150%)</option><option value="175">Very large (175%)</option><option value="200">Largest (200%)</option></select></div>
      <label class="preferences-toggle"><input type="checkbox" id="reading-contrast"><span>Higher contrast</span></label>
      <label class="preferences-toggle"><input type="checkbox" id="reading-spacing"><span>Increased text spacing</span></label>
      <label class="preferences-toggle"><input type="checkbox" id="reading-motion"><span>Reduce motion</span></label>
      <p class="preferences-note">These settings apply to website text. Text inside slide images and PDF files is unchanged; use the readable text versions or your browser’s zoom for those materials.</p>
      <div class="preferences-actions"><button class="button button-light preferences-reset" type="button">Reset preferences</button><button class="button preferences-done" type="button">Done</button></div>
      <p class="preferences-status" role="status" aria-live="polite"></p>`;
    document.body.append(launcher, dialog);
    const size = dialog.querySelector('#reading-text-size');
    const contrast = dialog.querySelector('#reading-contrast');
    const spacing = dialog.querySelector('#reading-spacing');
    const motion = dialog.querySelector('#reading-motion');
    const status = dialog.querySelector('.preferences-status');
    const synchronize = () => {
      size.value = settings.textSize; contrast.checked = settings.contrast;
      spacing.checked = settings.spacing; motion.checked = settings.motion;
    };
    const save = () => { try { localStorage.setItem(key, JSON.stringify(settings)); } catch (_) { /* Preferences still work for this page. */ } };
    synchronize();
    launcher.addEventListener('click', () => {
      status.textContent = ''; dialog.showModal(); launcher.setAttribute('aria-expanded', 'true');
    });
    dialog.addEventListener('close', () => { launcher.setAttribute('aria-expanded', 'false'); launcher.focus(); });
    dialog.querySelector('.preferences-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.preferences-done').addEventListener('click', () => dialog.close());
    dialog.addEventListener('change', () => {
      settings = sanitize({ textSize: size.value, contrast: contrast.checked, spacing: spacing.checked, motion: motion.checked });
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
