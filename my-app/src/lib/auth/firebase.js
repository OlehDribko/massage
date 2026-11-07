/*
 * The only place that talks to the Firebase SDK. Loaded with a dynamic
 * import after hydration, so the SDK is neither in the server render nor in
 * the first JS of public pages.
 */

let sdkPromise = null;

/**
 * Starts downloading the SDK (async, cached). Called as early as the browser
 * evaluates the auth provider, so the download overlaps hydration instead of
 * starting after it. Never blocks rendering.
 */
export function preloadFirebaseSdk() {
  sdkPromise ??= Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
  ]).catch((error) => {
    // Not cached: a manual retry downloads again.
    sdkPromise = null;
    throw error;
  });
  return sdkPromise;
}

export async function loadFirebase(options) {
  const [{ getApp, getApps, initializeApp }, authSdk] =
    await preloadFirebaseSdk();
  const {
    EmailAuthProvider,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    getAuth,
    linkWithCredential,
    linkWithPopup,
    onAuthStateChanged,
    reload,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInAnonymously,
    signInWithCredential,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    verifyBeforeUpdateEmail,
  } = authSdk;

  // One app per page, even if this module is evaluated again (HMR).
  const app = getApps().length ? getApp() : initializeApp(options);
  const auth = getAuth(app);
  // Firebase emails and the Google popup in French.
  auth.languageCode = 'fr';

  const google = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return provider;
  };

  return {
    currentUser: () => auth.currentUser,
    authStateReady: () => auth.authStateReady(),
    onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
    signInAnonymously: () => signInAnonymously(auth),
    signOut: () => signOut(auth),
    linkWithEmail: (user, email, password) =>
      linkWithCredential(user, EmailAuthProvider.credential(email, password)),
    signInWithEmail: (email, password) =>
      signInWithEmailAndPassword(auth, email, password),
    createUserWithEmail: (email, password) =>
      createUserWithEmailAndPassword(auth, email, password),
    linkWithGoogle: (user) => linkWithPopup(user, google()),
    signInWithGoogle: () => signInWithPopup(auth, google()),
    credentialFromError: (error) =>
      GoogleAuthProvider.credentialFromError(error),
    signInWithCredential: (credential) =>
      signInWithCredential(auth, credential),
    sendEmailVerification: (user) => sendEmailVerification(user),
    sendPasswordResetEmail: (email) => sendPasswordResetEmail(auth, email),
    reloadUser: (user) => reload(user),
    verifyBeforeUpdateEmail: (user, email) =>
      verifyBeforeUpdateEmail(user, email),
  };
}
