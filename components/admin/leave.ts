export function requestAuthorLeave(proceed: () => void) {
  const event = new CustomEvent<{ proceed: () => void }>(
    'noctiluz:author-leave',
    { cancelable: true, detail: { proceed } },
  );
  if (window.dispatchEvent(event)) proceed();
}
