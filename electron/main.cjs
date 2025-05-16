const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

// Create a storage map to persist data
const storage = new Map();
const windows = new Set();

// Define all Supabase-related headers
const supabaseHeaders = [
    'authorization',
    'apikey',
    'x-client-info',
    'x-application-name',
    'content-profile',
    'content-type',
    'accept-profile',
    'prefer',
    'x-supabase-auth-token',
    'x-supabase-api-version',
    'x-supabase-client',
    'x-supabase-host',
    'x-upsert',
    'x-client-dnt',
    'content-length',
    'accept',
    'accept-language',
    'accept-encoding',
    'range'
];

// Handle storage operations
ipcMain.handle('storage:get', (_, key) => {
    return storage.get(key) || null;
});

ipcMain.handle('storage:set', (_, key, value) => {
    storage.set(key, value);
    windows.forEach(win => {
        if (!win.isDestroyed()) {
            win.webContents.send('storage:sync', { key, value });
        }
    });
});

ipcMain.handle('storage:remove', (_, key) => {
    storage.delete(key);
    windows.forEach(win => {
        if (!win.isDestroyed()) {
            win.webContents.send('storage:sync', { key, value: null });
        }
    });
});

// Handle storage change notifications
ipcMain.on('storage:changed', (event, data) => {
    // Sync to all windows except sender
    windows.forEach(win => {
        if (!win.isDestroyed() && win.webContents !== event.sender) {
            win.webContents.send('storage:sync', data);
        }
    });
});

function setupSupabaseHandlers() {
    const filter = {
        urls: ['https://*.supabase.co/*']
    };

    // Handle preflight OPTIONS requests
    session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
        if (details.method === 'OPTIONS') {
            callback({
                cancel: false,
                requestHeaders: {
                    'Access-Control-Request-Headers': supabaseHeaders.join(', ').toLowerCase()
                }
            });
        } else {
            callback({ cancel: false });
        }
    });

    // Modify request headers
    session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
        const requestHeaders = {
            ...details.requestHeaders,
            'Origin': 'http://localhost:5173'
        };

        // Preserve all Supabase headers
        for (const header of supabaseHeaders) {
            const headerKey = header.toLowerCase();
            if (details.requestHeaders[header] || details.requestHeaders[headerKey]) {
                requestHeaders[header] = details.requestHeaders[header] || details.requestHeaders[headerKey];
            }
        }

        callback({ requestHeaders });
    });

    // Modify response headers
    session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
        const responseHeaders = {
            ...details.responseHeaders,
            'access-control-allow-origin': ['http://localhost:5173'],
            'access-control-allow-methods': ['GET, PUT, POST, DELETE, PATCH, OPTIONS'],
            'access-control-allow-headers': [supabaseHeaders.join(', ').toLowerCase()],
            'access-control-allow-credentials': ['true'],
            'access-control-expose-headers': ['*'],
            'access-control-max-age': ['3600']
        };

        // Ensure all headers are arrays
        Object.keys(responseHeaders).forEach(key => {
            if (!Array.isArray(responseHeaders[key])) {
                responseHeaders[key] = [responseHeaders[key]];
            }
        });

        callback({ responseHeaders });
    });
}

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            preload: path.join(__dirname, 'preload.cjs')
        }
    });

    // Add window to set
    windows.add(mainWindow);

    // Remove window from set when closed
    mainWindow.on('closed', () => {
        windows.delete(mainWindow);
    });

    // Set up Supabase handlers regardless of environment
    setupSupabaseHandlers();

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    // Configure session handling
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        const requestHeaders = { ...details.requestHeaders };
        
        // Ensure cookies and auth headers are preserved for Supabase requests
        if (details.url.includes('supabase.co')) {
            // Add all necessary Supabase headers
            supabaseHeaders.forEach(header => {
                const headerKey = header.toLowerCase();
                if (details.requestHeaders[header] || details.requestHeaders[headerKey]) {
                    requestHeaders[header] = details.requestHeaders[header] || details.requestHeaders[headerKey];
                }
            });

            // Add cookies if available
            const cookies = session.defaultSession.cookies.get({});
            if (cookies.length > 0) {
                requestHeaders['Cookie'] = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
            }
        }
        
        callback({ requestHeaders });
    });

    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (windows.size === 0) {
        createWindow();
    }
}); 