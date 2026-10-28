// נקודת הכניסה: טוען עיצוב, מפעיל את ההתחברות ואת הניתוב בין המסכים.
import '@fontsource-variable/rubik';
import './styles/index.css';

import { isFirebaseConfigured } from './config/firebase-config.js';
import { IS_MOCK } from './config/app-config.js';
import { defineRoutes, startRouter, navigate, resolve, getCurrent } from './core/router.js';
import { getState, subscribe } from './core/store.js';
import { watchNetwork } from './core/net-status.js';
import { setupBackButton } from './core/back-button.js';
import { ROUTES } from './app/routes.js';
import { startSession } from './app/session.js';
import { renderRoute, renderSplash } from './app/layout.js';
import { renderNotConfigured } from './app/not-configured.js';

const root = document.getElementById('app');

function onRoute(match) {
  const state = getState();
  if (!state.ready) {
    renderSplash(root);
    return;
  }
  const { route } = match;
  if (route.redirect) return navigate(route.redirect, { replace: true });
  if (route.auth === 'user' && !state.user) return navigate('/login', { replace: true });
  if (route.auth === 'guest' && state.user) return navigate('/shows', { replace: true });
  renderRoute(root, match);
}

// מציירים מחדש רק כשמשתנה מי מחובר או מצב האימות שלו — לא בכל עדכון של הפרופיל.
let lastKey = '';
function onStateChange(state) {
  const key = `${state.ready}|${state.user?.uid || ''}|${state.user?.emailVerified || false}`;
  if (key === lastKey) return;
  lastKey = key;
  if (getCurrent()) resolve();
}

function start() {
  watchNetwork();
  setupBackButton();
  defineRoutes(ROUTES);
  subscribe(onStateChange);
  startSession();
  startRouter(onRoute);
}

if (!IS_MOCK && !isFirebaseConfigured) renderNotConfigured(root);
else start();
