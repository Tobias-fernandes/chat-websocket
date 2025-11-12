export function getOrCreateUserId(): string | null {
  // Verifies if running in a browser environment
  if (typeof window === "undefined") return null;

  let userId = localStorage.getItem("user_id");
  if (!userId) {
    userId = crypto.randomUUID(); // Generates a unique ID
    localStorage.setItem("user_id", userId);
  }

  return userId;
}
