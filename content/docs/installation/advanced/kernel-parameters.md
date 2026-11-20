---
title: "Kernel Command Line Parameters"
description: "Configuring device node handling via bootloader kernel parameters"
category: "installation"
tags: ["installation", "advanced", "kernel", "devfs", "udev", "bootloader"]
order: 4
---

This guide explains how to configure Lunar Linux's device node handling at boot time using kernel command line parameters passed through your bootloader.

## Background: Device Node Management

Every Linux system requires device nodes to communicate with hardware. There are two main approaches to creating these nodes:

### Static Device Nodes

- Device nodes exist permanently on a real filesystem (ext3, XFS, ReiserFS, etc.)
- All nodes are pre-created or manually created with `mknod`
- Nodes persist across reboots
- Managed with tools like `makedev`

### Dynamic Device Nodes

Nodes are created automatically from hotplug events as hardware is detected.

#### devfs (Deprecated)

- Device nodes created in kernel space
- Uses a virtual filesystem
- Part of the kernel tree
- Used primarily with 2.4 kernels
- **Status:** Removed from modern kernels

#### udev (Modern Standard)

- Device nodes created in userspace
- Created by a userland application
- Lives outside the kernel tree
- Can exist on any filesystem (typically tmpfs/ramfs)
- **Standard for 2.6+ kernels**

### Current Status

- **2.4 kernels:** Primarily use devfs
- **2.6+ kernels:** Use udev exclusively
- **Static nodes:** Still supported but less common

## The dev= Parameter

Lunar Linux uses the `dev=` kernel parameter to specify device node handling:

```bash
dev=static    # Use static device nodes
dev=devfs     # Use devfs (2.4 kernels only)
dev=udev      # Use udev (2.6+ kernels)
```

### Behavior on 2.4 Kernels

Valid options:
- `dev=devfs`
- `dev=static`

**Automatic fallback behavior:**

If no `dev=` parameter is specified or an invalid value is used:

1. Test for devfs and attempt to use it if available
2. Fall back to static device nodes if devfs is unavailable

**Note:** Using `dev=udev` on 2.4 kernels displays a warning and falls back to normal 2.4 behavior.

### Behavior on 2.6+ Kernels

Valid options (tested in this order):
- `dev=udev`
- `dev=devfs`
- `dev=static`

**Automatic detection:**

If no `dev=` parameter is specified, Lunar tests for udev, then devfs, then static nodes in that order.

## Configuring Bootloaders

### LILO Configuration

Add kernel parameters using the `append` directive in `/etc/lilo.conf`:

```conf
image=/boot/vmlinuz
    label=awesomekernel
    root=/dev/hda2
    append="dev=udev video=radeonfb:1152x864-16@60"
```

**Multiple parameters** can be space-separated within the quotes.

**Interactive mode:**

If you have `prompt` set in lilo.conf, you can type parameters at boot time:

```
boot: awesomekernel dev=udev
```

After modifying `/etc/lilo.conf`, always run:

```bash
lilo
```

### GRUB Configuration

Add parameters directly after the kernel path in `/boot/grub/grub.conf` or `/boot/grub/menu.lst`:

```conf
title Awesome Kernel
    root (hd0,1)
    kernel /boot/vmlinuz root=/dev/hda1 dev=udev video=radeonfb:1152x864-16@60
```

**Interactive mode:**

Press `e` to edit the kernel line at boot time, add your parameters, and press `b` to boot.

GRUB changes take effect immediately without running any additional commands.

### GRUB2 Configuration

For modern systems using GRUB2, edit `/etc/default/grub`:

```bash
GRUB_CMDLINE_LINUX="dev=udev"
```

Then regenerate the configuration:

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

## Common Use Cases

### Force Static Device Nodes

```bash
# LILO
append="dev=static"

# GRUB
kernel /boot/vmlinuz root=/dev/hda1 dev=static
```

### Specify udev Explicitly

```bash
# LILO
append="dev=udev"

# GRUB
kernel /boot/vmlinuz root=/dev/hda1 dev=udev
```

### Combine with Other Parameters

Device parameters can be combined with other kernel options:

```bash
# LILO
append="dev=udev quiet splash acpi=off"

# GRUB
kernel /boot/vmlinuz root=/dev/hda1 dev=udev quiet splash acpi=off
```

## Troubleshooting

### System Won't Boot with udev

**Symptoms:**
- Kernel panic about missing root device
- Unable to mount root filesystem

**Solutions:**

1. Boot with `dev=static` parameter temporarily
2. Verify udev is installed: `lin udev`
3. Check that udev is enabled in your kernel configuration
4. Verify `/etc/udev/` directory exists and is properly configured

### devfs Not Found

**Symptoms:**
- Warning messages about missing devfs
- System falls back to static nodes

**Solutions:**

1. Verify devfs is compiled into your kernel (2.4 only)
2. Use `dev=udev` instead (for 2.6+ kernels)
3. Use `dev=static` if you prefer static nodes

### Module Loading Issues

If hardware modules aren't loading automatically:

1. Ensure `udev` is installed and running
2. Check `/etc/udev/rules.d/` for custom rules
3. Verify hotplug support in kernel
4. Review `dmesg` output for errors

## Verifying Your Configuration

### Check Current Device System

```bash
# Check if udev is running
ps aux | grep udev

# Check mounted filesystems
mount | grep dev

# View device node creation method
ls -la /dev
```

### Test Different Configurations

You can test different device systems without permanently modifying your bootloader by using interactive mode at boot time.

## Additional Kernel Parameters

While this guide focuses on device management, other useful boot parameters include:

- `root=/dev/sda1` - Specify root filesystem
- `ro` / `rw` - Mount root read-only or read-write
- `quiet` - Reduce kernel messages during boot
- `splash` - Enable graphical boot splash
- `single` - Boot into single-user mode
- `init=/bin/bash` - Override init (useful for recovery)

## See Also

- [Complete Installation Guide](/docs/installation/complete-install-guide)
- [Software RAID Installation](/docs/installation/advanced/software-raid)
- [Building a Custom Kernel](/docs/installation/complete-install-guide#building-your-customized-linux-kernel)
- `man bootparam`
- [Linux Kernel Parameters List](https://www.kernel.org/doc/html/latest/admin-guide/kernel-parameters.html)

---

**Copyright:** Copyleft Jaime Buffery, 2004-2005
nestu AT lunar-linux DOT org
