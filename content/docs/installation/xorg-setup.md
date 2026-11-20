---
title: "XOrg 7 Setup Guide"
description: "Installing and configuring XOrg 7.x on Lunar Linux"
category: "installation"
tags: ["xorg", "x11", "graphics", "nvidia", "installation"]
order: 10
---

This guide covers installing and configuring XOrg 7.x, the modular X Window System, on Lunar Linux. All commands require root privileges.

## Installing XOrg 7.x

XOrg 7.x uses a modular architecture, making it more flexible and maintainable than previous monolithic releases.

### Install the XOrg7 Module

```bash
lin XOrg7
```

This meta-module installs the complete XOrg 7.x modular tree.

### Input Device Support

Modern X servers require explicit input drivers. Install the evdev driver for keyboard and mouse support:

```bash
lin xf86-input-evdev
```

### Auto-Configuration

XOrg 7.x auto-configures at runtime, so you typically don't need to generate an `xorg.conf` file manually. The server will detect and configure hardware automatically on first run.

## Third-Party Drivers

### NVIDIA Proprietary Drivers

The NVIDIA binary driver provides optimal performance for NVIDIA graphics cards.

#### Installation

**Important:** X must not be running during installation. Stop any display managers (GDM, KDM, XDM, SLIM) before proceeding.

```bash
# Stop display manager (if running)
/etc/init.d/xdm stop    # or gdm, kdm, slim

# Install NVIDIA driver
lin NVIDIA
```

#### Configuration

Generate an NVIDIA-specific X configuration:

```bash
nvidia-xconfig
```

This creates `/etc/X11/xorg.conf` with optimal settings for your NVIDIA card.

#### Kernel Updates

**Important:** NVIDIA drivers include kernel modules that must be rebuilt after kernel updates.

After updating your kernel:

1. Reboot into the new kernel
2. Stop X and display managers
3. Rebuild the NVIDIA module:

```bash
lin NVIDIA
```

Failure to rebuild will result in X server failure or fallback to the nouveau driver.

## Installation Notes

### Installation Prefix

XOrg 7 installs to `/usr` by default, following the [Filesystem Hierarchy Standard](http://www.pathname.com/fhs). This aligns with major Linux distributions:

- [Debian](http://lists.debian.org/debian-devel-announce/2006/04/msg00010.html)
- [Arch Linux](http://wiki.archlinux.org/index.php/Xorg7)
- Gentoo: HOWTO Modular Xorg (gentoo-wiki.com, no longer available)

### Custom Installation Prefix

If you prefer a different location:

```bash
lunar set X11R7_PREFIX=/your/prefix/here
```

Then rebuild XOrg7:

```bash
lunar renew XOrg7
```

### Compatibility Symlinks

The XOrg7 profile creates compatibility symlinks:

- `/usr/X11` → `$MODULE_PREFIX` (default: `/usr`)
- `/usr/X11R6` → `$MODULE_PREFIX` (default: `/usr`)

The `/usr/X11R6` symlink maintains compatibility with older packages that have hardcoded paths to `/usr/X11R6`.

## Verifying Installation

### Start X Server

```bash
startx
```

### Check X Server Version

```bash
X -version
```

### Test Configuration

```bash
# Generate a test xorg.conf
X -configure

# Test the generated configuration
X -config /root/xorg.conf.new
```

## Troubleshooting

### X Won't Start

**Check logs:**

```bash
cat /var/log/Xorg.0.log
```

**Common issues:**

- Missing input drivers (install `xf86-input-evdev`)
- Incorrect video driver
- Permissions issues

### Keyboard/Mouse Not Working

Install input drivers:

```bash
lin xf86-input-evdev
lin xf86-input-mouse
lin xf86-input-keyboard
```

### NVIDIA Driver Issues

**Kernel module not loaded:**

```bash
# Check if module is loaded
lsmod | grep nvidia

# Load manually
modprobe nvidia
```

**Version mismatch:**

Ensure kernel module and X driver versions match:

```bash
cat /proc/driver/nvidia/version
nvidia-settings --version
```

If they differ, rebuild NVIDIA:

```bash
lin NVIDIA
```

## Missing Modules from XOrg 7.x Tree

Some XOrg modules are not yet packaged in Lunar. Contributions are welcome!

### Unpackaged x11-apps

- lbxproxy - Low Bandwidth X proxy
- mkcfm - CID font metric files
- oclock - Round X clock
- proxymngr - Proxy manager service
- scripts - Run X commands via rsh
- showfont - Font server information
- viewres - Resource browser for Xt
- xbiff - Mailbox watcher
- xclipboard - Clipboard manager
- xditview - Display ditroff output
- xfd - Display font characters
- xfindproxy - Locate proxy services
- xfontsel - Font name selector
- xfsinfo - X font server utility
- xfwp - X Firewall Proxy
- xgc - X graphics demo
- xlogo - X logo display
- xlsclients - List client applications
- xphelloworld - Xprint sample
- xprehashprinterlist - Xprint utilities
- xrx - Broadway
- xsetmode - Set input device mode
- xsetpointer - Set main pointer
- xsm - Session manager
- xstdcmap - Standard colormap utility
- xtrap - User emulation extension
- xvidtune - Video mode tuner

### Unpackaged x11-driver

- xf86-video-sunbw2 - Sun hardware
- xf86-video-suncg3 - Sun hardware
- xf86-video-suncg6 - Sun hardware
- xf86-video-suncg14 - Sun hardware
- xf86-video-sunffb - Sun hardware
- xf86-video-sunleo - Sun hardware
- xf86-video-suntcx - Sun hardware
- xf86-video-tdfx - 3dfx hardware
- xf86-video-tga - DEC hardware
- xf86-video-tseng - Tseng Labs hardware

### Unpackaged x11-lib

- libAppleWM - macOS specific
- libWindowsWM - Windows specific

### Unpackaged x11-proto

- windowswmproto - Windows specific

### Unpackaged x11-util

- lndir - Create shadow directory tree

**Note:** Sun, Apple, and Windows-specific modules are not needed on Linux x86/x64 systems.

## Advanced Configuration

### Manual xorg.conf

While auto-configuration usually works, you can create a manual configuration:

```bash
# Generate template
X -configure

# Copy to system location
cp ~/xorg.conf.new /etc/X11/xorg.conf

# Edit as needed
nano /etc/X11/xorg.conf
```

### Multi-Monitor Setup

For multi-monitor configurations with NVIDIA:

```bash
nvidia-settings
```

Use the graphical interface to configure displays, then save to `/etc/X11/xorg.conf`.

### Custom Resolutions

Add custom modelines to `/etc/X11/xorg.conf`:

```conf
Section "Monitor"
    Identifier  "Monitor0"
    Modeline "1920x1080_60.00"  173.00  1920 2048 2248 2576  1080 1083 1088 1120 -hsync +vsync
EndSection
```

## See Also

- [Complete Installation Guide](/docs/installation/complete-install-guide)
- [Desktop Environments](/docs/installation/desktop-environments)
- [Module Basics](/docs/package-management/lin-basics)
- XOrg Documentation: [https://www.x.org/wiki/](https://www.x.org/wiki/)
