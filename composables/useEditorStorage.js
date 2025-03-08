import { openDB } from 'idb';

export default function useEditorStorage() {
  // Initialize IndexedDB
  const dbPromise = openDB('elsalon', 1, {
    upgrade(db) {
      // Create a store for editor content
      if (!db.objectStoreNames.contains('drafts')) {
        const store = db.createObjectStore('drafts', { keyPath: 'id' });
      }
    },
  });

  /**
   * Save editor content to IndexedDB
   * @param {Object} options
   * @param {string} options.draftId - ID of the draft 
   * @param {string} options.html - HTML content from editor
   * @param {Array} options.attachedImages - Images attached to the content
   * @param {Array} options.attachedFiles - Files attached to the content
   */
  const saveDraft = async ({ draftId, html, attachedImages, attachedFiles }) => {
    if (!import.meta.client || !draftId) return;

    const timestamp = new Date().getTime();

    try {
      const db = await dbPromise;
      await db.put('drafts', {
        id: draftId,
        html,
        attachedImages,
        attachedFiles,
        timestamp
      });
      console.log('Draft saved:', draftId);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  /**
   * Load a draft from IndexedDB
   * @param {string} draftId - ID of the draft 
   * @returns {Object|null} - The draft content or null if not found
   */
  const loadDraft = async (draftId) => {
    if (!import.meta.client || !draftId) return null;
    
    try {
      const db = await dbPromise;
      const draft = await db.get('drafts', draftId);
      console.log('Draft loaded:', draft);
      return draft;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  };

  /**
   * Remove a draft from IndexedDB
   * @param {string} draftId - ID of the draft
   */
  const removeDraft = async (draftId) => {
    if (!import.meta.client || !draftId) return;
    
    try {
      const db = await dbPromise;
      await db.delete('drafts', draftId);
      console.log('Draft removed:', draftId);
    } catch (error) {
      console.error('Error removing draft:', error);
    }
  };

  /**
   * Get all drafts from IndexedDB
   * @returns {Array} - All drafts
   */
  const getAllDrafts = async () => {
    if (!import.meta.client) return [];
    
    try {
      const db = await dbPromise;
      return await db.getAll('drafts');
    } catch (error) {
      console.error('Error getting all drafts:', error);
      return [];
    }
  };

  /**
   * Clear drafts older than a specified time
   * @param {number} ageInHours - Maximum age of drafts to keep in hours
   */
  const clearOldDrafts = async (ageInHours = 72) => {
    if (!import.meta.client) return;
    
    const cutoffTimestamp = new Date().getTime() - (ageInHours * 60 * 60 * 1000);
    
    try {
      const db = await dbPromise;
      const drafts = await db.getAll('drafts');
      
      const txn = db.transaction('drafts', 'readwrite');
      const store = txn.objectStore('drafts');
      
      for (const draft of drafts) {
        if (draft.timestamp < cutoffTimestamp) {
          await store.delete(draft.id);
          console.log('Removed old draft:', draft.id);
        }
      }
      
      await txn.done;
    } catch (error) {
      console.error('Error clearing old drafts:', error);
    }
  };

  return {
    saveDraft,
    loadDraft,
    removeDraft,
    getAllDrafts,
    clearOldDrafts
  };
}