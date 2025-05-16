const { contextBridge, ipcRenderer } = require('electron');

// Create a storage map to hold data in memory
const storage = new Map();

// Create storage implementation
const electronStorage = {
  getFromStorage: (key) => {
    try {
      // First try to get from memory
      if (storage.has(key)) {
        return storage.get(key);
      }
      // If not in memory, try to get from main process
      return ipcRenderer.invoke('storage:get', key);
    } catch (error) {
      console.error('Error getting from storage:', error);
      return null;
    }
  },

  setInStorage: (key, value) => {
    try {
      // Store in memory
      storage.set(key, value);
      // Also persist to main process
      ipcRenderer.invoke('storage:set', key, value);
      // Notify other windows
      ipcRenderer.send('storage:changed', { key, value });
    } catch (error) {
      console.error('Error setting in storage:', error);
    }
  },

  removeFromStorage: (key) => {
    try {
      // Remove from memory
      storage.delete(key);
      // Also remove from main process
      ipcRenderer.invoke('storage:remove', key);
      // Notify other windows
      ipcRenderer.send('storage:changed', { key, value: null });
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }
};

// Listen for storage sync events from main process
ipcRenderer.on('storage:sync', (_, data) => {
  try {
    const { key, value } = data;
    if (value === null) {
      storage.delete(key);
    } else {
      storage.set(key, value);
    }
  } catch (error) {
    console.error('Error syncing storage:', error);
  }
});

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    getFromStorage: (key) => ipcRenderer.invoke('storage:get', key),
    setInStorage: (key, value) => ipcRenderer.invoke('storage:set', key, value),
    removeFromStorage: (key) => ipcRenderer.invoke('storage:remove', key),
    // Add version info for debugging
    versions: {
      node: () => process.versions.node,
      chrome: () => process.versions.chrome,
      electron: () => process.versions.electron,
    },
  }
); 