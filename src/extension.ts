import * as vscode from 'vscode';
import { SkillsViewProvider } from './view/SkillsViewProvider';

export function activate(context: vscode.ExtensionContext) {
  const provider = new SkillsViewProvider(context.extensionUri, context);

  // Register sidebar WebviewView provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('skillsView', provider)
  );

  // Command to open as standalone panel
  context.subscriptions.push(
    vscode.commands.registerCommand('skills.openPanel', async () => {
      const panel = vscode.window.createWebviewPanel(
        'skillsPanel',
        'Skills Manager',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [context.extensionUri]
        }
      );
      panel.webview.html = provider.getWebviewContentForPanel(panel.webview);
      panel.webview.onDidReceiveMessage((msg) => {
        if (msg.command === 'ping') {
          panel.webview.postMessage({ command: 'pong', text: 'pong from extension' });
        }
      });
    })
  );

  console.log('Skills Manager Template activated');
}

export function deactivate() {
  // cleanup if needed
}
