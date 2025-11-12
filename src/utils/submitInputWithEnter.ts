import { KeyboardEvent } from "react";

/**
 * Creates a onKeyDown handler that triggers a callback
 * when the "Enter" key is pressed (and "Shift" is not held).
 *
 * @param callback The function to be called on Enter.
 * @returns An onKeyDown event handler.
 */
export function onEnterPress<T extends HTMLElement>(
  callback: (event: KeyboardEvent<T>) => void
) {
  /**
   * This is the actual event handler that will be
   * attached to your element (input, textarea, etc.).
   */
  return (event: KeyboardEvent<T>) => {
    // 1. Only triggers if it's "Enter"
    // 2. And if "Shift" is NOT held down (allows Shift+Enter for new line)
    if (event.key === "Enter" && !event.shiftKey) {
      // Prevents default behavior (like new line or form submit)
      event.preventDefault();
      // Calls your submit function
      callback(event);
    }
  };
}
