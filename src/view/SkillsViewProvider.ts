import * as vscode from 'vscode';

export class SkillsViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  constructor(private readonly extensionUri: vscode.Uri, private readonly context: vscode.ExtensionContext) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    webviewView.webview.html = this.getWebviewContent(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'sayHello':
          vscode.window.showInformationMessage('Hello from Skills Manager!');
          break;
        case 'requestList':
          // Example: return an empty skills list (replace with real logic)
          webviewView.webview.postMessage({ command: 'skillsList', skills: [] });
          break;
      }
    });
  }

  public getWebviewContent(webview: vscode.Webview): string {
    return this._getHtml(webview);
  }

  public getWebviewContentForPanel(webview: vscode.Webview): string {
    return this._getHtml(webview);
  }

  private _getHtml(webview: vscode.Webview): string {
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'webview', 'styles.css'));
    const nonce = getNonce();
    return `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8"/>\n  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>\n  <title>Skills Manager</title>\n  <link rel="stylesheet" href="${styleUri}" />\n  <style>\n    /* fallback basic styles if styles.css not provided */\n    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 12px; }\n    h2 { margin-top: 0; }\n    button { margin-right: 8px; }\n    pre { background:#f5f5f5; padding:8px; border-radius:4px; }\n  </style>\n</head>\n<body>\n  <div id="root">\n    <h2>Skills Manager</h2>\n    <p>This is a minimal management page for skills. Add UI here.</p>\n    <button id="btnHello">Say Hello</button>\n    <button id="btnList">Request Skills List</button>\n    <div id="list" style="margin-top:12px;"></div>\n  </div>\n\n  <script nonce="${nonce}">\n    const vscode = acquireVsCodeApi();\n    document.getElementById('btnHello').addEventListener('click', () => {\n      vscode.postMessage({ command: 'sayHello' });\n    });\n    document.getElementById('btnList').addEventListener('click', () => {\n      vscode.postMessage({ command: 'requestList' });\n    });\n\n    window.addEventListener('message', (event) => {\n      const msg = event.data;\n      if (msg.command === 'skillsList') {\n        const container = document.getElementById('list');\n        container.innerHTML = '<pre>' + JSON.stringify(msg.skills, null, 2) + '</pre>';\n      }\n      if (msg.command === 'pong') {\n        vscode.postMessage({ command: 'requestList' });\n      }\n    });\n  </script>\n</body>\n</html>`;\n  }\n}\n\nfunction getNonce() {\n  let text = '';\n  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';\n  for (let i = 0; i < 32; i++) {\n    text += possible.charAt(Math.floor(Math.random() * possible.length));\n  }\n  return text;\n}