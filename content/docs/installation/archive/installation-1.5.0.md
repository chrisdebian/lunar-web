---
title: "Lunar Linux Installation Guide (Version 1.5.0)"
description: "Historical installation guide for Lunar Linux 1.5.0 ISO (Archived)"
category: "installation"
tags: ["installation", "archived", "historical", "1.5.0"]
archived: true
order: 1
---

**Status:** This document is archived and provided for historical reference only.

**Current users should refer to:** [Complete Installation Guide](/docs/installation/complete-install-guide)

---

## About This Installation Manual

This manual documents the installation process for Lunar Linux 1.5.0. While much of the information remains relevant, some details are outdated. This guide assumes you have some experience with Linux or Unix systems and understand basic concepts like partitioning.

For support, visit `#lunar` on `irc.libera.chat`.

## Getting the ISO

The primary site for retrieving ISOs is [lunar-linux.org](http://www.lunar-linux.org/). As of this writing, version 1.5.0 was the current release.

**Note:** This ISO uses devfs for device management. A static device version was also available at the time.

**Important:** Always maintain backups before installation. The Lunar Linux Project and its developers are not responsible for data loss.

## Booting the ISO

Upon booting, you'll see options for:
- Default kernel boot (press Enter)
- RAM tests
- Safe mode (disables DMA, MTRR, RAID, LVM, USB keyboards, etc.)

For USB keyboard support:
```bash
linux uhci-hcd ehci-hcd
```

## Virtual Consoles

Once booted, you can switch to virtual consoles for shell access. Use these for rescue operations, networking setup, or manual adjustments.

## Language and Keyboard Settings

Configure:
- Console font
- Keymap (essential for non-English keyboards)
- System language
- Text editor (vi, joe, or nano)

Nano is recommended for users new to Linux text editors.

## Partitioning

Use one of three partitioning tools:

- **cfdisk** - Menu-driven, easiest for beginners
- **fdisk** - Text-based, requires more knowledge
- **parted** - Advanced, supports resizing (use with caution)

### Example Partition Scheme (40GB Drive)

```
/dev/hda1   /boot   100MB   (mark as active/bootable)
/dev/hda2   /       4GB
/dev/hda3   swap    1GB
/dev/hda5   /usr    10GB
/dev/hda6   /var    10GB
/dev/hda7   /home   15GB
```

**Important directories that must remain in root partition:**
- `/etc`
- `/bin`
- `/sbin`
- `/dev`
- `/lib`
- `/proc`

### Swap Configuration

Options:
- Swap partition (recommended for better performance)
- Swap file in root directory

## Selecting Filesystems

Supported filesystems:

- **ext2** - Non-journaled, legacy
- **ext3** - Journaled ext2
- **reiserfs** - Excellent for small files
- **jfs** - IBM's journaled filesystem
- **xfs** - SGI's filesystem (requires lunar or grsec kernel)

Select filesystems for each partition. The installer will format and mount them during the installation phase.

## Installing Lunar

Select "Install Lunar" to:
- Format partitions
- Mount filesystems
- Create swap
- Transfer Lunar system files
- Configure system parameters

Installation typically takes ~5 minutes on normal hardware.

## GCC Architecture Optimizations

### Compiler Selection

GCC 3.x is recommended (default).

### Platform and Optimization Level

- Platform: x86
- Basic optimization options:
  - **-O2** - Recommended for most users
  - **-O3** - Advanced users (may break some code)
  - **-Os** - Optimize for size
  - **-O1** - Conservative

### Processor Type

Select your specific processor (e.g., Pentium 3, Pentium 4, i686) for optimized code generation.

### Additional Optimizations

Extra speed optimizations are available but should be used with caution. Some options (like `-ffast-math`) may break compilation or functionality.

Most users should skip this section entirely.

### Concurrent Makes

For multi-processor systems, enter the number of CPUs. Single-processor systems should leave blank.

## Bootloader Configuration

### LILO

If using automatic configuration, note that password protection is enabled by default:

```conf
password=lunar
restricted
```

Comment out or remove these lines to disable password protection.

**MBR vs. Boot Partition:**

```conf
# Install to boot partition
boot=/dev/hda1

# Install to MBR (recommended)
boot=/dev/hda
```

### GRUB

GRUB requires manual configuration. Example:

```conf
default 0
timeout 30
color white/blue white/black

title linux-2.4.20
    root (hd0,0)
    kernel /vmlinuz-2.4.25-r5.0.0 root=/dev/hda2 devfs=nomount
```

**Important:** Mark your boot partition as active when using GRUB.

## Kernel Installation

### Options

- **Precompiled kernel** - Quick start, recommended for beginners
- **Custom kernel** - Full configuration control

### Available Kernels (2.4 Series)

- **linux-2.4** - Default with useful patches (XFS, firewire, ext3)
- **linux-2.4-agr** - Aggressive (low latency, pre-emptive)
- **linux-2.4-grsec** - Security-focused (grsecurity, crypto support)
- **linux-2.4-stable** - Linus tree with minimal patches
- **linux-2.4-vanilla** - Completely unpatched
- **linux-2.4-om** - Clustering-specific

### Configuration Methods

- **config** - Original text-based (for experts)
- **menuconfig** - Menu-driven (recommended)
- **xconfig** - GUI (requires X server)

### Important Kernel Configuration Rules

1. **Never build filesystems as modules** - Include filesystem drivers (ext3, reiserfs, etc.) directly in kernel
2. **Keep core components built-in** - IDE/SCSI drivers should not be modules
3. **Use help** - Every configuration option has help text
4. **Start with defaults** - The ISO configuration is safe

## Networking Setup

The installer guides you through:
- Network card detection (if built as module)
- Wireless configuration (if needed)
- DHCP vs. static IP configuration

## Final Settings

- Set root password
- Generate SSH host keys
- Configure system services

## Installation Complete

Select "Done" and remove the CD when ejected. Your Lunar system is ready to boot!

## Post-Installation

### Upgrade Moonbase

After first boot, update your system:

**For 1.6.4+ ISOs:**
```bash
man lfirsttime
# Follow the instructions
```

**For older ISOs (1.6.2-beta1):**
Follow the special upgrade instructions in the 1.6.2-beta1 ISO Installation Guide (no longer available online).

**Recommendation:** Always install from the most recent ISO to avoid upgrade issues.

## Historical Context

This guide represents the state of Lunar Linux installation circa 2004-2005. Modern installations differ significantly:

- Kernel 2.6+ is now standard (2.4 is obsolete)
- udev has replaced devfs
- GCC 4.x+ is current (GCC 3.x is obsolete)
- More automated hardware detection
- Updated package management tools

## See Also

- [Current Installation Guide](/docs/installation/complete-install-guide)
- [Desktop Environments](/docs/installation/desktop-environments)
- [Advanced Installation Methods](/docs/installation/advanced/)

---

**Copyright:** Copyleft 2004 The Lunar Penguin Team

**Authors:**
- Installation Manual by Drew Swayze (drew AT lunar-linux DOT org)
- Edits by Suzanne Burns (sburns AT lunar-linux DOT org)
