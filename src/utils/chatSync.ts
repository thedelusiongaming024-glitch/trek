export interface ChatMessageToSync {
  id?: string;
  sender: 'user' | 'bot';
  text: string;
  source?: string;
  time?: string;
  createdAt?: string;
}

export const GUEST_CHAT_CACHE_PREFIX = 'ama_guest_chat_';

export const getGuestMessagesFromStorage = (sessionId?: string): ChatMessageToSync[] => {
  try {
    if (sessionId) {
      const raw = localStorage.getItem(`${GUEST_CHAT_CACHE_PREFIX}${sessionId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
    // Also check active stored session
    const activeSession = localStorage.getItem('ama_chat_session');
    if (activeSession && activeSession !== sessionId) {
      const rawActive = localStorage.getItem(`${GUEST_CHAT_CACHE_PREFIX}${activeSession}`);
      if (rawActive) {
        const parsedActive = JSON.parse(rawActive);
        if (Array.isArray(parsedActive) && parsedActive.length > 0) return parsedActive;
      }
    }
    // Fallback: check all keys starting with ama_guest_chat_
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(GUEST_CHAT_CACHE_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Failed to read guest chat cache:', err);
  }
  return [];
};

export const saveGuestMessagesToStorage = (sessionId: string, messages: ChatMessageToSync[]): void => {
  try {
    localStorage.setItem(`${GUEST_CHAT_CACHE_PREFIX}${sessionId}`, JSON.stringify(messages));
  } catch (err) {
    console.error('Failed to save guest chat cache:', err);
  }
};

export const clearGuestMessagesFromStorage = (sessionId?: string): void => {
  try {
    if (sessionId) {
      localStorage.removeItem(`${GUEST_CHAT_CACHE_PREFIX}${sessionId}`);
    }
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(GUEST_CHAT_CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error('Failed to clear guest chat cache:', err);
  }
};

export const syncGuestConversationToDb = async (
  userEmail: string,
  userId?: string,
  explicitSessionId?: string,
  overrideMessages?: ChatMessageToSync[]
): Promise<{ success: boolean; syncedCount: number }> => {
  try {
    const sessionId = explicitSessionId || localStorage.getItem('ama_chat_session') || 'default';
    const messages = overrideMessages || getGuestMessagesFromStorage(sessionId);

    // Filter meaningful messages
    const meaningfulMessages = messages.filter((m) => {
      const txt = (m.text || '').trim();
      return txt.length > 0;
    });

    if (meaningfulMessages.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    const res = await fetch('/api/support/sync-conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        userEmail,
        userId,
        messages: meaningfulMessages
      })
    });

    if (res.ok) {
      const data = await res.json();
      clearGuestMessagesFromStorage(sessionId);
      return { success: true, syncedCount: data.syncedCount || meaningfulMessages.length };
    }
  } catch (err) {
    console.warn('Could not sync guest conversation to database on auth:', err);
  }
  return { success: false, syncedCount: 0 };
};
