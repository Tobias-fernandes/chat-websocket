import { useRef, useLayoutEffect, DependencyList, RefObject } from "react";

interface UseChatScrollOptions {
  /**
   * How many pixels from the bottom to
   * still be considered "near the bottom".
   * @default 65
   */
  threshold?: number;
}

/**
 * Hook to automatically scroll a chat container.
 * It scrolls to the bottom on initial load and
 * on new messages, but only if the user
 * was already near the bottom.
 * @template T - The type of the HTML element (e.g., HTMLUListElement)
 * @param dependencies - Array of dependencies that trigger the effect (e.g., [messages])
 * @param options - Configuration options (e.g., threshold)
 * @returns A React Ref to be attached to the container element.
 */
export function useChatScroll<T extends HTMLElement>(
  dependencies: DependencyList,
  options: UseChatScrollOptions = {}
): RefObject<T | null> {
  const { threshold = 65 } = options;
  const chatContainerRef = useRef<T | null>(null);
  const prevScrollHeightRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainer;
    const newScrollHeight = scrollHeight;
    const oldScrollHeight = prevScrollHeightRef.current;

    // 1. Initial Scroll Case (first load)
    if (oldScrollHeight === null || oldScrollHeight === 0) {
      chatContainer.scrollTop = newScrollHeight;
    }
    // 2. New Message Case (height increased)
    else if (newScrollHeight > oldScrollHeight) {
      // Check if the user was near the bottom *before* the new message
      const wasNearBottom =
        oldScrollHeight - clientHeight - scrollTop < threshold;

      if (wasNearBottom) {
        chatContainer.scrollTop = newScrollHeight;
      }
    }

    // Always update the ref with the latest height
    prevScrollHeightRef.current = newScrollHeight;

    // We use ...dependencies to ensure the array is spread
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);

  return chatContainerRef;
}
