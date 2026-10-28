import { db, delay } from './mock-db.js';
import { deleteCurrentUser } from './auth-service.js';

export async function deleteAccountEverywhere(uid) {
  await delay(400);
  delete db.orders[uid];
  delete db.devices[uid];
  delete db.profiles[uid];
  await deleteCurrentUser();
}
