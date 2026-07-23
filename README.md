# Host Explorer

Launches an application on the **client** machine from a VS Code window that is attached to a dev container.

Marked `"extensionKind": ["ui"]`, so it always runs in the local extension host
and `child_process.spawn` lands on the client OS rather than inside the container.

## Settings

All settings are machine-scoped and excluded from Settings Sync.

| Setting                   | Purpose                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| `hostrunExplorer.command` | Executable. Empty = platform default.                              |
| `hostrunExplorer.args`    | Argument list. `${path}` is substituted. Empty = platform default. |
| `hostrunExplorer.path`    | Value substituted into `${path}`.                                  |
| `hostrunExplorer.label`   | Status bar text.                                                   |

Platform defaults:
`explorer.exe ${path}` on Windows,
`xdg-open ${path}` on Linux,
`open ${path}` on macOS.
