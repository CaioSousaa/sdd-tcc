const blacklist = new Set<string>();

export const addToBlacklist = (token: string): void => {
  blacklist.add(token);
};

export const isBlacklisted = (token: string): boolean => blacklist.has(token);
