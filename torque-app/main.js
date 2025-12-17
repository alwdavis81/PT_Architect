const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const http = require('http');
const handler = require('serve-handler');

let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "Powertrain Architect",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#09090b',
            symbolColor: '#ffffff',
            height: 35
        },
        frame: false
    });

    const isDev = !app.isPackaged;

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        const server = http.createServer((request, response) => {
            return handler(request, response, {
                public: path.join(__dirname, 'out'),
                rewrites: [
                    { source: '**', destination: '/index.html' }
                ]
            });
        });

        server.listen(0, () => {
            const port = server.address().port;
            console.log(`Running on http://localhost:${port}`);
            mainWindow.loadURL(`http://localhost:${port}`);
        });
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', () => {
    createMainWindow();

    // Auto Update Check
    if (app.isPackaged) {
        autoUpdater.checkForUpdatesAndNotify();
    }
});

// Auto-update logging & events
autoUpdater.on('error', (err) => {
    console.error('Error during update:', err);
});

autoUpdater.on('update-available', () => {
    console.log('Update available.');
});

autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded; will install now');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});
