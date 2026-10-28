// בזמן הרשמה, השם שהמשתמש הקליד נשמר כאן לרגע, עד שנוצר הפרופיל שלו בענן.
let pending = '';

export function setPendingName(name) {
  pending = String(name || '').trim();
}

export function takePendingName() {
  const name = pending;
  pending = '';
  return name;
}
