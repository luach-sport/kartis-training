// מריץ פעולה ומראה על הכפתור שהיא בעבודה, כדי שלא ילחצו פעמיים.
export async function withBusy(button, action, busyText) {
  if (button.disabled) return undefined;
  const original = button.innerHTML;
  button.disabled = true;
  button.classList.add('is-busy');
  if (busyText) button.textContent = busyText;
  try {
    return await action();
  } finally {
    if (button.isConnected) {
      button.disabled = false;
      button.classList.remove('is-busy');
      button.innerHTML = original;
    }
  }
}
