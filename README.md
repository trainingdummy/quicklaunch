# Quick Launch

Add easily accessible buttons for your favorite apps and commands directly to the GNOME Shell Quick Settings menu.

## Features

- **One-click app launching** - Launch any application with a single click from Quick Settings
- **Terminal command support** - Run any terminal command directly from Quick Settings buttons
- **Visual app picker** - Easy-to-use GUI for selecting apps from your installed applications
- **Icon customization** - Choose custom icons for each app button
- **Advanced CLI mode** - Manually edit app configurations for power users
- **Persistent settings** - Your app shortcuts are saved and restored across sessions

## Installation

### From extensions.gnome.org (Recommended)
1. Visit the extension page at https://extensions.gnome.org/extension/8776/quick-launch/
2. Toggle the switch to install
3. Configure your apps in the extension preferences

### Manual Installation
1. Download or clone this repository
2. Copy the extension folder to `~/.local/share/gnome-shell/extensions/quicklaunch@solotay/`
3. Compile the settings schema:
   ```bash
   cd ~/.local/share/gnome-shell/extensions/quicklaunch@solotay
   glib-compile-schemas schemas/
   ```
4. Restart GNOME Shell (Alt+F2, type 'r', press Enter on X11, or log out/in on Wayland)
5. Enable the extension:
   ```bash
   gnome-extensions enable quicklaunch@solotay
   ```

## Usage

1. Open the extension preferences: `gnome-extensions prefs quicklaunch@solotay`
2. Click "Add App" to open the app picker
3. Select an app from the list of installed applications
4. Optionally customize the icon by clicking the icon button
5. Your app buttons will appear in the Quick Settings menu

### Advanced Mode

Switch to the "Advanced" tab to manually edit app configurations. You can add:

**Desktop Applications:**
```
app-id.desktop|icon-name|Display Label
```

**Terminal Commands:**
```
terminal-command|icon-name|Display Label
```

Examples:
```
gnome-extensions prefs quicklaunch@solotay|input-gaming-symbolic|Quick Launch
org.gnome.Terminal.desktop|utilities-terminal|Terminal
firefox.desktop|firefox|Firefox
notify-send "Hello World"|dialog-information|Test Notification
xrandr -o normal|video-display|Reset Display
gnome-screenshot -a|applets-screenshooter|Screenshot
```

## Compatibility

- GNOME Shell 42, 43, 44, 45, 46
- Tested on Zorin OS 17.3 Core (GNOME 43.9)

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

This extension is released under the GPL-3.0 license.
