/* Netlify-backed authentication bridge. The server is the source of truth. */
(() => {
  const authEndpoint = (action) => `/api/auth/${action}`;

  async function callAuth(action, options = {}) {
    const response = await fetch(authEndpoint(action), {
      credentials: 'include',
      cache: 'no-store',
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.error || 'Authentication request failed');
      error.status = response.status;
      throw error;
    }
    return body;
  }

  function clearLegacyAuthStorage() {
    localStorage.removeItem('stockify_remembered_auth');
    localStorage.removeItem('stockify_auth_expiry');
  }

  function forceClientLogout(message = 'Your session has expired. Please sign in again.') {
    isAuthenticated = false;
    clearLegacyAuthStorage();
    showAuthModal();
    const keyInput = document.getElementById('key-input');
    if (keyInput) { keyInput.value = ''; keyInput.focus(); }
    showAuthError(message);
  }

  async function checkServerSession() {
    try {
      await callAuth('session', { method: 'GET', headers: {} });
      return true;
    } catch (error) {
      if (error.status === 401) forceClientLogout();
      return false;
    }
  }

  async function monitorServerSession() {
    if (!isAuthenticated) return;
    const valid = await checkServerSession();
    if (valid) setTimeout(monitorServerSession, 15000);
  }

  async function netlifyVerifyKey() {
    const password = String(enteredKey || '').trim();
    if (!password) { showAuthError(translate('key-incorrect')); return; }
    const submit = document.getElementById('key-submit-btn');
    if (submit) submit.disabled = true;
    try {
      await callAuth('login', { method: 'POST', body: JSON.stringify({ password }) });
      isAuthenticated = true;
      clearLegacyAuthStorage();
      hideAuthModal();
      clearAuthError();
      initializeApp();
      wireSecurityPanel();
      monitorServerSession();
    } catch (error) {
      showAuthError(error.status === 401 ? translate('key-incorrect') : 'Authentication service is unavailable.');
      setTimeout(clearAuthError, 3500);
    } finally {
      if (submit) submit.disabled = false;
    }
  }

  async function netlifyInitializeAuthentication() {
    loadLanguagePreference();
    setupAuthenticationEventListeners();
    const active = await checkServerSession();
    if (active) {
      isAuthenticated = true;
      hideAuthModal();
      initializeApp();
      wireSecurityPanel();
      monitorServerSession();
    } else {
      isAuthenticated = false;
      showAuthModal();
    }
  }

  async function logoutThisDevice() {
    try { await callAuth('logout', { method: 'POST', body: '{}' }); } catch (_) {}
    forceClientLogout('You have been logged out.');
  }

  function wireSecurityPanel() {
    const toggle = document.getElementById('admin-panel-toggle');
    const gate = document.getElementById('admin-panel-gate');
    const content = document.getElementById('admin-panel-content');
    const codeForm = document.getElementById('admin-code-form');
    const codeInput = document.getElementById('admin-code-input');
    const codeStatus = document.getElementById('admin-code-status');
    const form = document.getElementById('change-password-form');
    const logout = document.getElementById('logout-btn');
    const status = document.getElementById('password-change-status');

    if (toggle && !toggle.__netlifyWired) {
      toggle.addEventListener('click', () => {
        const opening = gate?.hasAttribute('hidden');
        if (gate) gate.toggleAttribute('hidden', !opening);
        if (opening) setTimeout(() => codeInput?.focus(), 50);
      });
      toggle.__netlifyWired = true;
    }

    if (codeForm && !codeForm.__netlifyWired) {
      codeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const adminCode = codeInput?.value.trim() || '';
        if (!adminCode) return;
        const button = document.getElementById('admin-code-btn');
        if (button) button.disabled = true;
        if (codeStatus) codeStatus.textContent = 'Checking administrator code…';
        try {
          await callAuth('verify-admin-code', {
            method: 'POST',
            body: JSON.stringify({ adminCode }),
          });
          if (codeStatus) codeStatus.textContent = '';
          if (content) content.removeAttribute('hidden');
          if (gate) gate.setAttribute('hidden', '');
          codeForm.setAttribute('hidden', '');
          document.getElementById('new-password-input')?.focus();
        } catch (error) {
          if (codeStatus) codeStatus.textContent = error.status === 403 ? 'Administrator code is incorrect.' : 'Could not verify administrator code.';
        } finally {
          if (button) button.disabled = false;
        }
      });
      codeForm.__netlifyWired = true;
    }

    if (form && !form.__netlifyWired) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const adminCode = codeInput?.value || '';
        const newPassword = document.getElementById('new-password-input')?.value || '';
        const confirmation = document.getElementById('confirm-password-input')?.value || '';
        if (!adminCode.trim()) { if (status) status.textContent = 'Unlock the Admin Panel first.'; return; }
        if (newPassword.length < 8) { if (status) status.textContent = 'The new password must be at least 8 characters.'; return; }
        if (newPassword !== confirmation) { if (status) status.textContent = 'The new passwords do not match.'; return; }
        const button = document.getElementById('change-password-btn');
        if (button) button.disabled = true;
        if (status) status.textContent = 'Changing password…';
        try {
          const result = await callAuth('change-password', {
            method: 'POST',
            body: JSON.stringify({ adminCode, newPassword, confirmation }),
          });
          form.reset();
          forceClientLogout(result.message || 'Password changed. Please sign in again.');
        } catch (error) {
          if (status) status.textContent = error.status === 403 ? 'Administrator code is incorrect.' : (error.message || 'Password change failed.');
        } finally {
          if (button) button.disabled = false;
        }
      });
      form.__netlifyWired = true;
    }
    if (logout && !logout.__netlifyWired) {
      logout.addEventListener('click', logoutThisDevice);
      logout.__netlifyWired = true;
    }
  }

  async function netlifyInitializeAppWithAuth() {
    await netlifyInitializeAuthentication();
    if (isAuthenticated) setupProtectedActions();
  }

  // These assignments happen before the original DOMContentLoaded handler runs.
  verifyKey = netlifyVerifyKey;
  initializeAuthentication = netlifyInitializeAuthentication;
  initializeAppWithAuth = netlifyInitializeAppWithAuth;
  window.stockifyNetlifyAuth = { checkServerSession, logoutThisDevice };
  document.addEventListener('DOMContentLoaded', wireSecurityPanel, { once: true });
})();
