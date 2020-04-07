import { app, BrowserWindow, ipcMain, Notification } from 'electron';
const path = require('path');

const isDev = process.env.ENV === 'development';

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
}

// 监听渲染程序发来的事件
ipcMain.on('ScreenCapture:Open', () => {
  console.log('Main get ScreenCapture:Open');
})

app.whenReady().then(createWindow)