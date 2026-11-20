---
title: "Installing Without a CD Drive"
description: "Alternative methods for installing Lunar Linux without using a CD-ROM drive"
category: "installation"
tags: ["installation", "advanced", "no-cd", "usb", "chroot"]
order: 1
---

Installing Lunar Linux without a CD drive or other removable media is entirely possible. There are several methods available, ranging from straightforward to more complex approaches. This guide covers the most reliable techniques.

**Disclaimer:** The methods described below may destroy data if executed incorrectly. Always maintain current backups of important data. You are solely responsible for your own data and system integrity.

## Method 1: Booting the ISO from a Hard Disk Partition

This is one of the easiest methods. The concept is simple: write the ISO directly to a partition and configure your bootloader to boot from that partition.

**Requirements:**

- Sufficient free disk space plus a partition large enough for the ISO image (approximately 350-400MB)
- Any installed operating system with tools that allow direct partition writing
- A working bootloader (LILO, GRUB, or Windows bootloader)

**Steps:**

1. Free some space at the end of your disk and create a partition larger than the Lunar ISO
2. Write the ISO contents directly to the partition:

```bash
cat lunar-1.5.1-i686.iso > /dev/hda15
```

3. Configure your bootloader to boot from the ISO partition

**LILO configuration example:**

```conf
other = /dev/hda15
    label = lunar-1.5.1
```

4. Reboot and select the Lunar entry from your bootloader menu

The Lunar installer should start normally, functioning just as if you had booted from a physical CD.

## Method 2: USB Bootable Lunar

### Modern Method (ISO 1.6.5 and Later)

Starting with Lunar 1.6.5, the ISO supports hybrid mode, making USB installation extremely simple.

**Write the ISO directly to your USB device:**

```bash
dd if=lunar.iso of=/dev/sdb bs=8192k
```

**Alternative using cat:**

```bash
cat lunar.iso > /dev/sdb
```

**Important:** Ensure you specify the device (`/dev/sdb`) and not a partition (`/dev/sdb1`). Replace `sdb` with the actual device identifier for your USB stick. This will destroy all existing data on the USB device.

### Legacy Method (Pre-1.6.5)

For older ISOs that don't support hybrid mode:

```bash
# Format the USB stick
mkdosfs -F 16 /dev/sda1

# Create mount points
mkdir /mnt/stick /mnt/iso

# Mount the ISO
modprobe loop
mount lunar-1.6.4-beta1-i686.iso -o loop /mnt/iso

# Mount the USB stick
mount /dev/sda1 /mnt/stick

# Copy isolinux to syslinux
cp -R /mnt/iso/isolinux /mnt/stick/syslinux
rename isolinux syslinux /mnt/stick/syslinux/isolinux*

# Copy the ISO to the stick
cp lunar-1.6.4-beta1-i686.iso /mnt/stick/

# Install syslinux
syslinux /dev/sda1

# Mark partition as bootable using fdisk
fdisk /dev/sda
# Use 'a' command to toggle bootable flag on partition 1

# Install MBR
dd if=/usr/share/syslinux/mbr.bin of=/dev/sda
```

**Note:** Pay attention to use the device (`/dev/sda`) for the MBR, not the partition.

## Method 3: Chrooting into the ISO

This method requires an existing Linux installation and is more complex, but provides flexibility when other methods fail.

### From 2.4 Kernels with devfs Support

**Requirements:**

- A running Linux installation with a 2.4 kernel that has devfs support
- Root access and ability to use chroot

**Important considerations:**

- Install a small Linux installation near the end of your disk
- Pre-partition the beginning of your disk for Lunar installation
- Reboot after partitioning so the kernel recognizes the new partition table
- Only modify/mount partitions that are NOT currently active

**Steps:**

1. Set up your temporary Linux installation and reboot
2. Mount the ISO using loop device:

```bash
losetup /dev/loop0 lunar-1.5.1-i686.iso
mount /dev/loop0 /mnt -o ro
```

3. Chroot into the mounted ISO and start the installer:

```bash
chroot /mnt /sbin/lunar-install
```

The installer will run normally, allowing you to install Lunar to the prepared partitions. Be careful not to overwrite your temporary Linux installation during the process, as you may need it for troubleshooting or recovery.

### From 2.6 Kernels with udev Support

This method was outlined for modern systems (e.g., installing from Debian or rescue environments):

```bash
# Download and extract the ISO
wget http://download.lunar-linux.org/lunar/lunar-1.6.1-i686.iso.bz2
bunzip2 lunar-1.6.1-i686.iso.bz2

# Mount the ISO
mkdir tmp
mount lunar-1.6.1-i686.iso -o loop -t iso9660 tmp

# Copy ISO contents to tmpfs
cp -R tmp/* /tmp/
cp -R tmp/.packages /tmp/
cp -R tmp/.lunar-cd /tmp/
cd /tmp/

# Set up proc, dev, and pts
mkdir -p proc && mount -t proc proc ./proc
mkdir -p dev && mount -o bind /dev ./dev
mkdir -p dev/pts && mount -t devpts devpts ./dev/pts

# Create standard device symlinks
cd dev
ln -sf /proc/self/fd
ln -sf fd/0 stdin
ln -sf fd/1 stdout
ln -sf fd/2 stderr

# Recreate null device
rm null
mknod null c 1 3
cd

# Chroot and start installer
chroot /tmp /sbin/lunar-install
```

**Note:** Version numbers may vary. Check for the latest ISO version before beginning.

## Recommendations

- **Easiest:** USB bootable method (for ISOs 1.6.5+)
- **Most flexible:** Hard disk partition method
- **Most complex:** Chroot method (use only when other methods fail)

Always verify your downloaded ISO using checksums before attempting installation.

## See Also

- [Complete Installation Guide](/docs/installation/complete-install-guide)
- [Installation Without Network](/docs/installation/advanced/no-network-installation)
- [Software RAID Setup](/docs/installation/advanced/software-raid)
