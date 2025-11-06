const { Adw, Gtk, Gio, GLib } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

function init() {
}

function fillPreferencesWindow(window) {
    const extension = ExtensionUtils.getCurrentExtension();
    const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quicklaunch');
    
    // === APPS PAGE (Visual Editor) ===
    const appsPage = new Adw.PreferencesPage({
        name: 'apps',
        title: 'Apps',
        icon_name: 'applications-system-symbolic',
    });
    window.add(appsPage);
    
    const appsGroup = new Adw.PreferencesGroup({
        title: 'Quick Launch Apps',
        description: 'Add and manage your quick launch buttons',
    });
    appsPage.add(appsGroup);
    
    // Container for app list
    const appListBox = new Gtk.ListBox({
        selection_mode: Gtk.SelectionMode.NONE,
        css_classes: ['boxed-list'],
    });
    
    const scrolled = new Gtk.ScrolledWindow({
        child: appListBox,
        vexpand: true,
        hexpand: true,
        min_content_height: 300,
    });
    
    // Function to refresh the app list display
    function refreshAppList() {
        // Clear existing rows
        let child = appListBox.get_first_child();
        while (child) {
            let next = child.get_next_sibling();
            appListBox.remove(child);
            child = next;
        }
        
        // Get current app list
        const appList = settings.get_strv('app-list');
        
        appList.forEach((appEntry, index) => {
            let [appId, iconName, label] = appEntry.split('|');
            
            const row = new Gtk.ListBoxRow();
            const hbox = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
                spacing: 12,
                margin_top: 6,
                margin_bottom: 6,
                margin_start: 6,
                margin_end: 6,
            });
            
            // Icon preview
            const icon = new Gtk.Image({
                icon_name: iconName || 'application-x-executable',
                pixel_size: 32,
            });
            hbox.append(icon);
            
            // Label box
            const labelBox = new Gtk.Box({
                orientation: Gtk.Orientation.VERTICAL,
                hexpand: true,
            });
            const titleLabel = new Gtk.Label({
                label: label,
                xalign: 0,
            });
            const subtitleLabel = new Gtk.Label({
                label: appId,
                xalign: 0,
                css_classes: ['dim-label'],
            });
            labelBox.append(titleLabel);
            labelBox.append(subtitleLabel);
            hbox.append(labelBox);
            
            // Edit icon button
            const editIconBtn = new Gtk.Button({
                icon_name: 'document-edit-symbolic',
                valign: Gtk.Align.CENTER,
            });
            editIconBtn.connect('clicked', () => {
                showIconPicker(appId, iconName, label, index);
            });
            hbox.append(editIconBtn);
            
            // Remove button
            const removeBtn = new Gtk.Button({
                icon_name: 'user-trash-symbolic',
                valign: Gtk.Align.CENTER,
            });
            removeBtn.get_style_context().add_class('destructive-action');
            removeBtn.connect('clicked', () => {
                let currentList = settings.get_strv('app-list');
                currentList.splice(index, 1);
                settings.set_strv('app-list', currentList);
                refreshAppList();
            });
            hbox.append(removeBtn);
            
            row.set_child(hbox);
            appListBox.append(row);
        });
    }
    
    // Function to show icon picker dialog
    function showIconPicker(appId, currentIcon, label, index) {
        const dialog = new Gtk.Dialog({
            title: 'Choose Icon',
            modal: true,
            transient_for: window,
            default_width: 400,
            default_height: 500,
        });
        
        const contentArea = dialog.get_content_area();
        contentArea.set_spacing(12);
        contentArea.set_margin_top(12);
        contentArea.set_margin_bottom(12);
        contentArea.set_margin_start(12);
        contentArea.set_margin_end(12);
        
        // Icon name entry
        const entry = new Gtk.Entry({
            text: currentIcon || 'application-x-executable',
            placeholder_text: 'Icon name (e.g., utilities-terminal)',
        });
        
        const iconPreview = new Gtk.Image({
            icon_name: currentIcon || 'application-x-executable',
            pixel_size: 48,
        });
        
        entry.connect('changed', () => {
            iconPreview.set_from_icon_name(entry.get_text() || 'application-x-executable');
        });
        
        const commonIcons = [
            'input-gaming-symbolic', 'firefox', 'web-browser', 'system-file-manager',
            'utilities-terminal', 'system-settings', 'accessories-calculator',
            'video-x-generic', 'audio-x-generic', 'image-x-generic', 'emblem-mail', 
            'applications-games', 'applications-graphics', 'emblem-default',
            'emblem-favorite', 'folder', 'emblem-documents', 'x-office-document',
            'x-office-spreadsheet', 'x-office-presentation',
        ];
        
        const systemIcons = [
            'network-wireless-symbolic', 'bluetooth-symbolic', 'battery-symbolic',
            'audio-volume-high-symbolic', 'mark-location', 'airplane-mode-symbolic',
            'display-brightness-symbolic', 'night-light-symbolic',
            'microphone-sensitivity-high-symbolic', 'microphone-sensitivity-muted-symbolic',
            'media-playback-start', 'media-seek-forward', 'media-playback-pause',
            'media-playback-stop', 'media-eject', 'go-home', 'go-previous', 'go-next',
            'go-up', 'go-down', 'edit-copy', 'edit-cut', 'edit-paste',
            'edit-undo', 'edit-redo', 'edit-select-all', 'edit-delete',
            'document-new', 'document-save', 'document-open-recent',
            'object-select', 'window-close', 'view-refresh', 'action-unavailable',
            'process-stop', 'starred', 'list-add', 'list-remove', 'send-to',
            'document-send', 'document-print', 'security-high', 'dialog-information',
            'view-list', 'view-grid'
        ];
        
        // Create tabbed icon selector
        const iconNotebook = new Gtk.Notebook();
        
        // Common icons tab
        const commonIconGrid = new Gtk.FlowBox({
            max_children_per_line: 5,
            selection_mode: Gtk.SelectionMode.NONE,
            homogeneous: true,
        });
        
        commonIcons.forEach(iconName => {
            const btn = new Gtk.Button();
            const img = new Gtk.Image({
                icon_name: iconName,
                pixel_size: 32,
            });
            btn.set_child(img);
            btn.connect('clicked', () => {
                entry.set_text(iconName);
            });
            commonIconGrid.append(btn);
        });
        
        const commonScrolled = new Gtk.ScrolledWindow({
            child: commonIconGrid,
            min_content_height: 150,
        });
        iconNotebook.append_page(commonScrolled, new Gtk.Label({ label: 'Common' }));
        
        // System icons tab
        const systemIconGrid = new Gtk.FlowBox({
            max_children_per_line: 5,
            selection_mode: Gtk.SelectionMode.NONE,
            homogeneous: true,
        });
        
        systemIcons.forEach(iconName => {
            const btn = new Gtk.Button();
            const img = new Gtk.Image({
                icon_name: iconName,
                pixel_size: 32,
            });
            btn.set_child(img);
            btn.connect('clicked', () => {
                entry.set_text(iconName);
            });
            systemIconGrid.append(btn);
        });
        
        const systemScrolled = new Gtk.ScrolledWindow({
            child: systemIconGrid,
            min_content_height: 150,
        });
        iconNotebook.append_page(systemScrolled, new Gtk.Label({ label: 'System' }));
        
        contentArea.append(new Gtk.Label({ label: 'Icon Preview:', xalign: 0 }));
        contentArea.append(iconPreview);
        contentArea.append(new Gtk.Label({ label: 'Icon Name:', xalign: 0 }));
        contentArea.append(entry);
        contentArea.append(new Gtk.Label({ label: 'Browse Icons\n(Run `gtk4-icon-browser` to view all)', xalign: 0 }));
        contentArea.append(iconNotebook);
        
        dialog.add_button('Cancel', Gtk.ResponseType.CANCEL);
        dialog.add_button('Apply', Gtk.ResponseType.OK);
        
        dialog.connect('response', (dialog, response) => {
            if (response === Gtk.ResponseType.OK) {
                let currentList = settings.get_strv('app-list');
                currentList[index] = `${appId}|${entry.get_text()}|${label}`;
                settings.set_strv('app-list', currentList);
                refreshAppList();
            }
            dialog.destroy();
        });
        
        dialog.show();
    }
    
    // Add app button
    const addButton = new Gtk.Button({
        label: 'Add App',
        halign: Gtk.Align.CENTER,
    });
    addButton.get_style_context().add_class('suggested-action');
    
    addButton.connect('clicked', () => {
        showAppPicker();
    });
    
    function showAppPicker() {
        const dialog = new Gtk.Dialog({
            title: 'Select Application',
            modal: true,
            transient_for: window,
            default_width: 500,
            default_height: 600,
        });
        
        const contentArea = dialog.get_content_area();
        contentArea.set_spacing(6);
        
        // Search entry
        const searchEntry = new Gtk.SearchEntry({
            placeholder_text: 'Search applications...',
        });
        contentArea.append(searchEntry);
        
        // App list
        const appListBox = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.SINGLE,
        });
        
        const scrolledApps = new Gtk.ScrolledWindow({
            child: appListBox,
            vexpand: true,
        });
        contentArea.append(scrolledApps);
        
        // Get all installed apps
        const allApps = Gio.AppInfo.get_all().filter(app => app.should_show());
        
        let filteredApps = allApps;
        
        function populateAppList(apps) {
            // Clear list
            let child = appListBox.get_first_child();
            while (child) {
                let next = child.get_next_sibling();
                appListBox.remove(child);
                child = next;
            }
            
            // Add apps
            apps.forEach(app => {
                const row = new Gtk.ListBoxRow();
                const hbox = new Gtk.Box({
                    orientation: Gtk.Orientation.HORIZONTAL,
                    spacing: 12,
                    margin_top: 6,
                    margin_bottom: 6,
                    margin_start: 6,
                    margin_end: 6,
                });
                
                const icon = new Gtk.Image({
                    gicon: app.get_icon(),
                    pixel_size: 32,
                });
                hbox.append(icon);
                
                const labelBox = new Gtk.Box({
                    orientation: Gtk.Orientation.VERTICAL,
                    hexpand: true,
                });
                const titleLabel = new Gtk.Label({
                    label: app.get_display_name(),
                    xalign: 0,
                });
                const subtitleLabel = new Gtk.Label({
                    label: app.get_id(),
                    xalign: 0,
                    css_classes: ['dim-label'],
                });
                labelBox.append(titleLabel);
                labelBox.append(subtitleLabel);
                hbox.append(labelBox);
                
                row.set_child(hbox);
                row._appInfo = app;
                appListBox.append(row);
            });
        }
        
        populateAppList(filteredApps);
        
        // Search functionality
        searchEntry.connect('search-changed', () => {
            const searchText = searchEntry.get_text().toLowerCase();
            if (searchText === '') {
                filteredApps = allApps;
            } else {
                filteredApps = allApps.filter(app => 
                    app.get_display_name().toLowerCase().includes(searchText) ||
                    app.get_id().toLowerCase().includes(searchText)
                );
            }
            populateAppList(filteredApps);
        });
        
        dialog.add_button('Cancel', Gtk.ResponseType.CANCEL);
        dialog.add_button('Add', Gtk.ResponseType.OK);
        
        dialog.connect('response', (dialog, response) => {
            if (response === Gtk.ResponseType.OK) {
                const selectedRow = appListBox.get_selected_row();
                if (selectedRow && selectedRow._appInfo) {
                    const app = selectedRow._appInfo;
                    const appId = app.get_id();
                    const label = app.get_display_name();
                    const icon = app.get_icon();
                    
                    // Try to get icon name
                    let iconName = 'application-x-executable';
                    if (icon) {
                        iconName = icon.to_string();
                        // Clean up icon name if it's a path
                        if (iconName.includes('/')) {
                            const parts = iconName.split('/');
                            iconName = parts[parts.length - 1].replace('.png', '').replace('.svg', '');
                        }
                    }
                    
                    // Add to settings
                    let currentList = settings.get_strv('app-list');
                    currentList.push(`${appId}|${iconName}|${label}`);
                    settings.set_strv('app-list', currentList);
                    refreshAppList();
                }
            }
            dialog.destroy();
        });
        
        dialog.show();
    }
    
    const appsBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 12,
        margin_top: 12,
        margin_bottom: 12,
        margin_start: 12,
        margin_end: 12,
    });
    
    appsBox.append(scrolled);
    appsBox.append(addButton);
    
    const appsRow = new Adw.PreferencesRow({child: appsBox});
    appsGroup.add(appsRow);
    
    // Initial load
    refreshAppList();
    
    // === ADVANCED PAGE ===
    const advancedPage = new Adw.PreferencesPage({
        name: 'advanced',
        title: 'Advanced',
        icon_name: 'preferences-other-symbolic',
    });
    window.add(advancedPage);
    
    const advancedGroup = new Adw.PreferencesGroup({
        title: 'Advanced Configuration',
        description: 'Manually edit app configurations',
    });
    advancedPage.add(advancedGroup);
    
    const instructionRow = new Adw.ActionRow({
        title: 'Configuration Format',
        subtitle: 'app-id.desktop|icon-name|Display Label (for apps)\nterminal-command|icon-name|Display Label (for commands)\nFind app IDs in /usr/share/applications/',
    });
    advancedGroup.add(instructionRow);
    
    const scrolledText = new Gtk.ScrolledWindow({
        vexpand: true,
        hexpand: true,
        min_content_height: 300,
    });
    
    const textView = new Gtk.TextView({
        wrap_mode: Gtk.WrapMode.WORD,
        monospace: true,
        top_margin: 10,
        bottom_margin: 10,
        left_margin: 10,
        right_margin: 10,
    });
    
    scrolledText.set_child(textView);
    const buffer = textView.get_buffer();
    
    function loadTextBuffer() {
        const appList = settings.get_strv('app-list');
        buffer.set_text(appList.join('\n'), -1);
    }
    
    loadTextBuffer();
    
    // Watch for changes from visual editor
    settings.connect('changed::app-list', () => {
        loadTextBuffer();
    });
    
    const saveButton = new Gtk.Button({
        label: 'Save Changes',
        halign: Gtk.Align.CENTER,
    });
    saveButton.get_style_context().add_class('suggested-action');
    
    saveButton.connect('clicked', () => {
        const [start, end] = buffer.get_bounds();
        const text = buffer.get_text(start, end, false);
        const newAppList = text.split('\n').filter(line => line.trim() !== '');
        settings.set_strv('app-list', newAppList);
        refreshAppList();
    });
    
    const advancedBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 10,
        margin_start: 10,
        margin_end: 10,
        margin_top: 10,
        margin_bottom: 10,
    });
    
    advancedBox.append(scrolledText);
    advancedBox.append(saveButton);
    
    const advancedRow = new Adw.PreferencesRow({child: advancedBox});
    advancedGroup.add(advancedRow);
}
