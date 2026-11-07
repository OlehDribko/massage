/*
 * Header account label without a flash. Firebase restores the session only
 * in the browser, after hydration, so the server HTML cannot know whether
 * the visitor is signed in. The last known state ('guest' | 'member') is
 * kept in localStorage and copied to <html data-account> by a tiny inline
 * script before the first paint; CSS then shows the matching label
 * (globals.css, «account-hint»). It is only a display hint: nothing private
 * is shown and every page still waits for the real session.
 */

export const ACCOUNT_HINT_KEY = 'account-hint';

/** Inline script for <head>: runs before the page is painted. */
export const ACCOUNT_HINT_SCRIPT = `try{var h=localStorage.getItem('${ACCOUNT_HINT_KEY}');if(h==='member'||h==='guest')document.documentElement.dataset.account=h}catch(e){}`;

/** Remember the real state once it is known (browser only). */
export function rememberAccountHint(status) {
  const hint =
    status === 'member' || status === 'admin'
      ? 'member'
      : status === 'guest'
        ? 'guest'
        : null;
  if (!hint || typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNT_HINT_KEY, hint);
  } catch {
    // Private mode / storage disabled: the default label stays.
  }
  document.documentElement.dataset.account = hint;
}
