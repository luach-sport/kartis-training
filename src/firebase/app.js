// אתחול Firebase — נעשה פעם אחת, וכל השאר מקבלים את אותו מופע.
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../config/firebase-config.js';
import { useEmulators, EMULATOR } from './emulator.js';

const config = useEmulators
  ? { apiKey: 'demo-key', projectId: EMULATOR.projectId, authDomain: `${EMULATOR.projectId}.firebaseapp.com`, appId: 'demo' }
  : firebaseConfig;

export const app = initializeApp(config);
