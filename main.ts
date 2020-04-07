import {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  globalShortcut,
  screen
} from 'electron';

const path = require('path');
const os = require('os')
const url = require('url')

let captureWins: any[] = [];

const isDev = process.env.ENV === 'development';

const openWindow = (window: Electron.BrowserWindow, page: string, query?: any) => {
  if (isDev) {
    const u = url.format({
      query,
      pathname: `localhost:3000/${page}.html`,
      protocol: 'http:',
      slashes: true
    });
    window.loadURL(u);
  } else {
    const u = url.format({
      query,
      pathname: path.join(__dirname, `${page}.html`),
      protocol: 'file:',
      slashes: true
    });
    window.loadURL(u);
  }
};

const captureScreen = () => {
  if (captureWins.length) return;
  // let displays = screen.getAllDisplays()
  let displays = [screen.getPrimaryDisplay()]
  captureWins = displays.map((display: any) => {
    let captureWin = new BrowserWindow({
      // window 使用 fullscreen,  mac 设置为 undefined, 不可为 false
      fullscreen: os.platform() === 'win32' || undefined,
      width: display.bounds.width,
      height: display.bounds.height,
      x: display.bounds.x,
      y: display.bounds.y,
      // transparent: true,
      frame: false,
      movable: false,
      resizable: false,
      enableLargerThanScreen: true,
      hasShadow: false,
      webPreferences: {
        devTools: true,
        nodeIntegration: true,
      },
    })
    // captureWin.webContents.openDevTools();
    captureWin.setAlwaysOnTop(true, 'screen-saver')
    captureWin.setVisibleOnAllWorkspaces(true)
    captureWin.setFullScreenable(false)
    openWindow(captureWin, 'screenCapture');

    let { x, y } = screen.getCursorScreenPoint()

    if (x >= display.bounds.x &&
      x <= display.bounds.x + display.bounds.width &&
      y >= display.bounds.y &&
      y <= display.bounds.y + display.bounds.height) {
      captureWin.focus()
    } else {
      captureWin.blur()
    }

    captureWin.on('closed', () => {
      captureWins.forEach(win => win.close())
    })

    return captureWin;
  })

}

function createWindow() {
  // 创建浏览器窗口
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  if (isDev) {
    win.loadURL(`http://localhost:3000`);
  } else {
    win.loadFile(path.resolve(__dirname, './dist/index.html'));
  }

  globalShortcut.register('Esc', () => {
    if (captureWins) {
      captureWins.forEach(win => win.close())
      captureWins = []
    }
  })
}

// 监听渲染程序发来的事件
ipcMain.on('ScreenCapture:Open', () => {
  console.log('Main get ScreenCapture:Open');
  captureScreen();
})

app.whenReady().then(createWindow)