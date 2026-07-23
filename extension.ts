import * as os from 'os';
import { spawn } from 'child_process';
import * as vscode from 'vscode';

// Per-platform fallbacks, used when hostrunExplorer.command / .args are unset.
const DEFAULTS: Record<string, { command: string; args: string[] }> = {
  win32: { command: 'explorer.exe', args: ['${path}'] },
  linux: { command: 'xdg-open', args: ['${path}'] },
  darwin: { command: 'open', args: ['${path}'] }
};

function resolve(cfg: vscode.WorkspaceConfiguration) {
  const fallback = DEFAULTS[process.platform];
  if (!fallback) {
    throw new Error(`Unsupported client platform: ${process.platform}`);
  }

  const command = cfg.get<string>('command') || fallback.command;

  const configured = cfg.get<string[]>('args');
  const args = configured && configured.length ? configured : fallback.args;

  const target = cfg.get<string>('path') || os.homedir();
  if (args.some((a: string) => a.includes('${path}')) && !target) {
    throw new Error('hostrunExplorer.path is not set on this machine.');
  }

  return {
    command,
    args: args.map((a: string) => a.split('${path}').join(target))
  };
}

export function activate(context: vscode.ExtensionContext) {
  const cfgOf = () => vscode.workspace.getConfiguration('hostrunExplorer');

  const status = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  status.command = 'hostExplorer.open';
  status.tooltip = 'Launch the configured host application';

  const refresh = () => {
    status.text = cfgOf().get<string>('label') || '$(folder-opened) Host';
    status.show();
  };
  refresh();

  context.subscriptions.push(
    status,
    vscode.workspace.onDidChangeConfiguration(
      (e: vscode.ConfigurationChangeEvent) => {
        if (e.affectsConfiguration('hostrunExplorer.label')) {
          refresh();
        }
      }
    ),
    vscode.commands.registerCommand('hostExplorer.open', () => {
      let plan: { command: string; args: string[] };
      try {
        plan = resolve(cfgOf());
      } catch (err) {
        vscode.window.showErrorMessage(
          `Host Explorer: ${err instanceof Error ? err.message : String(err)}`
        );
        return;
      }

      const child = spawn(plan.command, plan.args, {
        detached: true,
        stdio: 'ignore'
      });

      child.on('error', (err: Error) => {
        vscode.window.showErrorMessage(
          `Host Explorer: failed to launch "${plan.command}" - ${err.message}`
        );
      });

      child.unref();
    })
  );
}

export function deactivate() {}
