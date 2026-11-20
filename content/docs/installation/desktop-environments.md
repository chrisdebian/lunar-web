---
title: "Desktop Environments"
description: "Installing and configuring desktop environments and window managers on Lunar Linux"
category: "installation"
tags: ["desktop", "xfce", "kde", "gnome", "window-manager", "gui"]
lastUpdated: 2025-11-02
order: 3
---

Once you have successfully completed the installation of the ISO and the post-install tasks described in `man lfirsttime`, what you are left with is a pretty minimal installation - this is deliberate!

Lunar Linux now gives you the power and the freedom to customize your system to your own specific needs.

## Minimal Installation

After completing the base installation:

- **For a lean, mean server:** You don't have to uninstall lots of things and hope you have closed potential security holes. You have a secure system on which to build. You probably don't need to read the rest of this article either.

- **For a desktop environment or lightweight window manager:** You still have a little work to do.

## Tips for New Users

If you have a "standard" hardware configuration and stick to the defaults, the installation of Lunar Linux should be straightforward and therefore appears deceptively simple. There are some things you can do to keep things running smoothly:

- **Keep it simple**
- **Take it one step at a time**
- **Build a working system first**
- **Add the bells and whistles later**

### How Dependencies Work

In Lunar, modules have explicit dependencies on things that are really needed, so installing 'a' will first install 'b' and 'c' for you. Some modules have explicit optional dependencies on nice-to-have features, so if 'd' isn't already installed you will be asked whether you want to install it too. Saying yes could mean installing all of those modules that 'd' depends on as well.

In addition, each module's own configuration process may detect what is and isn't installed, and adapt itself accordingly.

**Note:** You can preview what will be built and pre-answer the installation questions by using `lin -r --deps` before running the real `lin`.

### When Things Go Wrong

Usually all of this Just Works™, but sometimes a module fails to build. Sometimes dependencies have changed, or are missing, and you may need to install the missing module explicitly before trying again.

**Troubleshooting steps:**

1. **If it's an optional dependency:** Re-run with `lin -rc` and this time say yes, or maybe even no
2. **If it can't download the source file:** Go to the website for that package and see if you can download it manually, then save it in `/var/spool/lunar`
3. **If you have persistent download problems:** Run `lunar` and check whether changing the mirror site helps

### Getting Help

The ISO comes with:
- `screen` for switching between virtual terminals
- `lynx` - ASCII-based web browser
- `irssi` and `ircii` - IRC clients

You may be able to find sources and additional help yourself. If you have problems, please join the #lunar channel on IRC:

```bash
irssi -c irc.libera.chat     # /join #lunar
```

Maybe someone will be available in your timezone who can help you.

## First Install X Explicitly

Even though Lunar Linux isn't aimed at new Linux users and assumes that you have some idea what you are doing, many people installing for the first time forget to install X first.

### Wait! Isn't X installed automatically? No? Why not?

The reason is simple:
- Adding the dependency tracking to all modules that might need to use X would be an awful lot of work
- Would lead to a very dense dependency tree that would be hard to manage
- Would affect all users, even if they wanted to run a lean, mean, headless server
- As Lunar users are supposed to know what they are doing, you should also know that if you want to run graphical applications, you should first install the graphical environment

### Installing X

You don't need to install all of the X components one by one, although you are free to do so if you really want. Lunar Linux provides a profile module called **XOrg7** that is a sort of dummy module that doesn't do anything itself, but it depends on a lot of other modules. Installing a profile module therefore installs all of the modules that it depends on.

To install a "standard" X environment:

```bash
lin XOrg7
lin additional_drivers...
```

You can find the additional drivers under `/var/lib/lunar/moonbase/xorg7/drivers`, or run:

```bash
lvu section xorg7/drivers
```

However, this doesn't install all possible X applications. There are some, like `xterm`, `xhost`, and the desktop environments that you will need to install separately.

### Testing X

At this point you can run `startx` to have a very basic session in the 'twm' window manager. You might now want to install an X-based web browser and IRC client before going further.

## XFCE

[Xfce](http://www.xfce.org) is a lightweight desktop environment for various *NIX systems.

In the past, many of the Lunar developers were also Xfce developers, so Xfce has traditionally been the best integrated into Lunar Linux. You can install all of the components one by one, or you can install the "standard" environment in one go using the xfce4 profile module:

```bash
lin xfce4
```

### Why Choose XFCE?

- Lightweight and fast
- Traditional desktop paradigm
- Highly configurable
- Good hardware support
- Well-maintained in Lunar
- Modular architecture

### Starting XFCE

After installation, you can start XFCE by adding to your `~/.xinitrc`:

```bash
exec startxfce4
```

Then run:

```bash
startx
```

## KDE

[KDE](http://www.kde.org) has one Lunar developer who is actively following the official releases, and therefore updates to the KDE modules in Lunar usually occur within a few days of the official release.

You can install the "standard" environment using the kde4 profile module:

```bash
lin kde4
```

### Why Choose KDE?

- Full-featured desktop environment
- Integrated applications
- Modern interface
- Extensive configuration options
- Active development
- Well-supported in Lunar

### Starting KDE

After installation, you can start KDE by adding to your `~/.xinitrc`:

```bash
exec startkde
```

Then run:

```bash
startx
```

## GNOME

[GNOME](http://www.gnome.org) is not so popular with the Lunar developers and as a result it is not as up-to-date as Xfce and KDE. In fact, we could really use some help!

You can install the "standard" environment using the gnome2 profile module but be prepared to give it a helping hand:

```bash
lin gnome2
```

### Why Choose GNOME?

- Modern interface design
- Good accessibility features
- Integrated with many Linux applications
- Simple and clean design philosophy

**Note:** GNOME support in Lunar could use community contributions. If you're interested in helping maintain GNOME modules, please reach out to the development team.

### Starting GNOME

After installation, you can start GNOME by adding to your `~/.xinitrc`:

```bash
exec gnome-session
```

Then run:

```bash
startx
```

## Lightweight Window Managers

As well as the "big three" above, Lunar Linux also provides modules for several lightweight window managers, although these are not guaranteed to be up-to-date.

You can find many of them under `/var/lib/lunar/moonbase/x11-wm` or by using:

```bash
lvu section x11-wm
```

### Popular Lightweight Window Managers

Some popular choices include:

- **fluxbox** - Lightweight and highly configurable
- **openbox** - Minimalist and standards-compliant
- **i3** - Tiling window manager
- **awesome** - Dynamic tiling window manager
- **dwm** - Dynamic window manager from suckless.org
- **windowmaker** - NeXTSTEP-like window manager

### Why Choose a Lightweight Window Manager?

- **Performance** - Minimal resource usage
- **Simplicity** - No bloat, just window management
- **Customization** - Complete control over behavior
- **Learning** - Better understanding of X11
- **Older hardware** - Works great on limited resources

### Community Contributions

Some of these come from module submissions by Lunar users. If you have a favorite window manager that's not in the moonbase, consider contributing it!

### Cutting-Edge Developments

Note that some cutting-edge developments can also be found in the **zbeta** section of the Moonbase but are not guaranteed to be stable.

## Display Managers

You may also want to install a display manager (login screen):

### GDM (GNOME Display Manager)

```bash
lin gdm
```

### KDM (KDE Display Manager)

```bash
lin kdm
```

### LightDM

```bash
lin lightdm
```

### Starting with Display Manager

To start your display manager at boot, you'll need to configure your init system to run it automatically. Consult the documentation for your specific display manager.

## Additional Applications

After installing your desktop environment, you'll likely want to install additional applications:

### Web Browsers

```bash
lin firefox    # Mozilla Firefox
lin chromium   # Chromium browser
lin opera      # Opera browser
```

### Office Applications

```bash
lin libreoffice    # Full office suite
```

### Media Players

```bash
lin vlc            # VLC media player
lin mplayer        # MPlayer
```

### Image Editors

```bash
lin gimp           # GNU Image Manipulation Program
lin inkscape       # Vector graphics editor
```

## Configuration Tips

### .xinitrc File

Create a `~/.xinitrc` file to customize your X session:

```bash
#!/bin/sh

# Start some common applications
xterm &
xclock &

# Start your window manager or desktop environment
exec startxfce4
```

Make it executable:

```bash
chmod +x ~/.xinitrc
```

### Session Management

For more complex session management, consider using:
- `~/.xsession` for display manager sessions
- `~/.config/autostart/` for XDG-compliant autostart

### Multiple Desktop Environments

You can install multiple desktop environments and choose between them at the display manager login screen, or by changing your `~/.xinitrc` file.

## Troubleshooting

### X Won't Start

1. Check `/var/log/Xorg.0.log` for errors
2. Verify video drivers are installed: `lin xorg-video-<your-card>`
3. Try running `X -configure` to generate a basic config

### Missing Fonts

```bash
lin dejavu-fonts-ttf
lin liberation-fonts-ttf
```

### No Sound

```bash
lin alsa-utils
alsaconf    # Configure ALSA
alsamixer   # Adjust volumes
```

### Hardware Acceleration Not Working

Install appropriate drivers for your GPU:

```bash
# For NVIDIA
lin nvidia

# For AMD
lin xorg-video-ati

# For Intel
lin xorg-video-intel
```

## Next Steps

Once you have your desktop environment up and running:

1. Configure your system preferences
2. Install your favorite applications
3. Customize themes and appearance
4. Set up your development environment
5. Explore the moonbase for more software

## Getting Help

If you run into problems:
- Check the [FAQ](/docs/faq)
- Join #lunar on irc.libera.chat
- Search the mailing list archives
- Read the documentation for your specific desktop environment

Have Phun!!
