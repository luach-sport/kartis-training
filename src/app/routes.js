// רשימת המסכים: כתובת, איזה קובץ מצייר אותו, ומי מורשה להיכנס.
//   auth: 'guest' — רק למי שלא מחובר | 'user' — רק למחוברים | 'any' — לכולם
//   tab: איזו לשונית בתחתית מסומנת | backTo: לאן "חזרה" מוביל | bare: בלי כותרת ולשוניות
import * as login from '../ui/screens/auth/login.js';
import * as register from '../ui/screens/auth/register.js';
import * as forgot from '../ui/screens/auth/forgot-password.js';
import * as verify from '../ui/screens/auth/verify-email.js';
import * as showsList from '../ui/screens/shows/shows-list.js';
import * as showDetails from '../ui/screens/shows/show-details.js';
import * as checkout from '../ui/screens/checkout/checkout.js';
import * as success from '../ui/screens/checkout/purchase-success.js';
import * as myTickets from '../ui/screens/tickets/my-tickets.js';
import * as ticketView from '../ui/screens/tickets/ticket-view.js';
import * as account from '../ui/screens/account/account.js';
import * as editProfile from '../ui/screens/account/edit-profile.js';
import * as devices from '../ui/screens/account/devices.js';
import * as security from '../ui/screens/account/security.js';
import * as deleteAccount from '../ui/screens/account/delete-account.js';
import * as admin from '../ui/screens/admin/admin.js';

export const ROUTES = [
  { path: '/', redirect: '/shows' },
  { path: '/login', screen: login, auth: 'guest', bare: true },
  { path: '/register', screen: register, auth: 'guest', bare: true, backTo: '/login' },
  { path: '/forgot', screen: forgot, auth: 'any', bare: true, backTo: '/login' },
  { path: '/verify', screen: verify, auth: 'user', title: 'אימות כתובת המייל', backTo: '/shows' },

  { path: '/shows', screen: showsList, auth: 'user', tab: 'shows', title: 'הופעות' },
  { path: '/show/:id', screen: showDetails, auth: 'user', tab: 'shows', title: 'פרטי ההופעה', backTo: '/shows' },
  { path: '/checkout/:id/:section/:qty', screen: checkout, auth: 'user', tab: 'shows', title: 'השלמת הזמנה', backTo: '/shows' },
  { path: '/success/:orderId', screen: success, auth: 'user', tab: 'tickets', title: 'ההזמנה הושלמה', backTo: '/tickets' },

  { path: '/tickets', screen: myTickets, auth: 'user', tab: 'tickets', title: 'הכרטיסים שלי' },
  { path: '/ticket/:id', screen: ticketView, auth: 'user', tab: 'tickets', title: 'כרטיס', backTo: '/tickets' },

  { path: '/account', screen: account, auth: 'user', tab: 'account', title: 'החשבון שלי' },
  { path: '/account/profile', screen: editProfile, auth: 'user', tab: 'account', title: 'פרטים אישיים', backTo: '/account' },
  { path: '/account/devices', screen: devices, auth: 'user', tab: 'account', title: 'המכשירים שלי', backTo: '/account' },
  { path: '/account/security', screen: security, auth: 'user', tab: 'account', title: 'אבטחה והתחברות', backTo: '/account' },
  { path: '/account/delete', screen: deleteAccount, auth: 'user', tab: 'account', title: 'מחיקת חשבון', backTo: '/account' },
  { path: '/admin', screen: admin, auth: 'user', admin: true, tab: 'account', title: 'ניהול הופעות', backTo: '/account' }
];
