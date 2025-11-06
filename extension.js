const { GObject, St, Gio, GLib } = imports.gi;
const Main = imports.ui.main;
const QuickSettings = imports.ui.quickSettings;
const ExtensionUtils = imports.misc.extensionUtils;

const QuickLaunchToggle = GObject.registerClass(
class QuickLaunchToggle extends QuickSettings.QuickToggle {
    _init(appId, iconName, label) {
        super._init({
            label: label,
            iconName: iconName,
            toggleMode: false,
        });
        
        this._appId = appId;
        
        // Connect to the clicked signal to launch the app
        this.connect('clicked', () => {
            this._launchApp();
        });
    }
    
    _launchApp() {
        try {
            // Check if this is a .desktop file or a terminal command
            if (this._appId.endsWith('.desktop')) {
                // Launch as desktop app
                let app = Gio.DesktopAppInfo.new(this._appId);
                if (app) {
                    app.launch([], null);
                } else {
                    log(`QuickLaunch: Could not find app: ${this._appId}`);
                }
            } else {
                // Launch as terminal command
                let [ok, pid] = GLib.spawn_command_line_async(this._appId);
                if (!ok) {
                    log(`QuickLaunch: Could not execute command: ${this._appId}`);
                }
            }
            // Close the quick settings menu after launching
            Main.panel.statusArea.quickSettings.menu.close();
        } catch (e) {
            log(`QuickLaunch: Error launching: ${e}`);
        }
    }
});

class Extension {
    constructor() {
        this._indicators = [];
    }
    
    enable() {
        this._settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quicklaunch');
        
        // Get the quick settings menu
        this._quickSettings = Main.panel.statusArea.quickSettings;
        
        // Load and add configured apps
        this._loadApps();
        
        // Watch for settings changes
        this._settingsChangedId = this._settings.connect('changed::app-list', () => {
            this._reloadApps();
        });
    }
    
    disable() {
        // Remove all indicators
        this._indicators.forEach(indicator => {
            indicator.quickSettingsItems.forEach(item => item.destroy());
            indicator.destroy();
        });
        this._indicators = [];
        
        // Disconnect settings signal
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }
        
        this._settings = null;
        this._quickSettings = null;
    }
    
    _loadApps() {
        // Get app list from settings
        let appList = this._settings.get_strv('app-list');
        
        appList.forEach(appEntry => {
            // Format: "app-id.desktop|Icon-Name|Display Label"
            let [appId, iconName, label] = appEntry.split('|');
            this._addAppButton(appId, iconName, label);
        });
    }
    
    _reloadApps() {
        // Remove existing indicators
        this._indicators.forEach(indicator => {
            indicator.quickSettingsItems.forEach(item => item.destroy());
            indicator.destroy();
        });
        this._indicators = [];
        
        // Reload apps
        this._loadApps();
    }
    
    _addAppButton(appId, iconName, label) {
        // Create an indicator (even though we won't show it in the panel)
        const indicator = new QuickSettings.SystemIndicator();
        
        // Create the toggle button
        const toggle = new QuickLaunchToggle(appId, iconName || 'application-x-executable', label);
        
        // Add the toggle to the quick settings menu
        indicator.quickSettingsItems.push(toggle);
        this._quickSettings._addItems(indicator.quickSettingsItems);
        
        // Store the indicator
        this._indicators.push(indicator);
    }
}

function init() {
    return new Extension();
}
