---
title: "Software RAID Installation"
description: "Installing Lunar Linux on software RAID for improved performance and redundancy"
category: "installation"
tags: ["installation", "advanced", "raid", "redundancy"]
order: 3
---

Software RAID provides improved performance and/or reliability through redundancy. While Lunar Linux doesn't yet have an automated RAID setup in the installer, configuring RAID manually is straightforward.

## Overview

Software RAID allows you to combine multiple physical disks into logical arrays that provide:

- **RAID 0:** Striping for improved performance
- **RAID 1:** Mirroring for redundancy
- **RAID 5/6:** Striping with parity for both performance and redundancy
- **RAID 10:** Combination of mirroring and striping

This guide focuses on RAID 1 (mirroring) as an example, but the principles apply to other RAID levels.

## Step 1: Boot the ISO

1. Boot from the Lunar ISO
2. Complete initial setup (language, locale, keyboard)
3. Switch to virtual console 2 (VC/2) using `Ctrl+Alt+F2`
4. Begin manual RAID configuration

## Step 2: Partition Your Disks

The easiest approach for partition-based RAID is to partition one disk, then copy the layout to the others.

### Partition the First Disk

```bash
cfdisk /dev/hda
```

**Important:** Set your partition type to **Linux raid autodetect (0xfd)**. This is essential for the system to recognize and boot from RAID partitions.

### Replicate Partition Layout

Copy the partition table to your second disk using `sfdisk`:

```bash
cd /tmp
sfdisk -d /dev/hda > dump
sfdisk /dev/hdb < dump
```

This creates an identical partition layout on `/dev/hdb`, which is especially useful for RAID 1 setups.

**For RAID arrays with more disks:**

```bash
sfdisk /dev/hdc < dump
sfdisk /dev/hdd < dump
```

## Step 3: Create RAID Configuration

Create a RAID configuration file in `/tmp/raidtab`:

### Example: RAID 1 Configuration

```conf
raiddev         /dev/md0
raid-level      1
nr-raid-disks   2
nr-spare-disks  0
persistent-superblock 1
chunk-size      32
device          /dev/hda1
raid-disk       0
device          /dev/hdb1
raid-disk       1
```

### Configuration Parameters Explained

- **raiddev:** The RAID device name (e.g., `/dev/md0`)
- **raid-level:** RAID level (0=stripe, 1=mirror, 5=stripe with parity)
- **nr-raid-disks:** Number of active disks in the array
- **nr-spare-disks:** Number of hot spare disks
- **persistent-superblock:** Enables storing RAID metadata on disks
- **chunk-size:** Size of data chunks in KB (affects performance)
- **device:** Physical partition to include in the array
- **raid-disk:** Position of this disk in the array

### Multiple RAID Devices

You can create multiple RAID arrays for different partitions. For example:

```conf
# Boot partition
raiddev         /dev/md0
raid-level      1
nr-raid-disks   2
nr-spare-disks  0
persistent-superblock 1
chunk-size      32
device          /dev/hda1
raid-disk       0
device          /dev/hdb1
raid-disk       1

# Root partition
raiddev         /dev/md1
raid-level      1
nr-raid-disks   2
nr-spare-disks  0
persistent-superblock 1
chunk-size      32
device          /dev/hda2
raid-disk       0
device          /dev/hdb2
raid-disk       1
```

## Step 4: Initialize the RAID Device

Create and start the RAID array:

```bash
mkraid --really-force --configfile /tmp/raidtab /dev/md0
```

The `--really-force` flag bypasses safety checks. Use with caution.

### Monitor Sync Progress

RAID 1 and higher levels need to synchronize data across disks:

```bash
cat /proc/mdstat
```

**Example output:**

```
Personalities : [raid1]
md0 : active raid1 hdb1[1] hda1[0]
      104320 blocks [2/2] [UU]
      [====>................]  resync = 23.4% (24448/104320) finish=0.5min speed=2444K/sec
```

## Step 5: Format the RAID Filesystem

You can format and work with RAID devices while they're syncing, though performance may be reduced:

```bash
mkfs.ext3 /dev/md0
mkfs.ext3 /dev/md1
mkfs.ext3 /dev/md2
```

**Recommendation:** Wait for the sync to complete before proceeding. This ensures no bad sectors exist and the array is functioning correctly.

## Step 6: Save Your Configuration

Save the RAID configuration to the array itself for future use:

```bash
# Mount the root RAID device
mount /dev/md0 /mnt

# Create etc directory
mkdir /mnt/etc

# Copy configuration
cp /tmp/raidtab /mnt/etc/raidtab

# Unmount
umount /mnt
```

**Important:** Since `/tmp` is in RAM, your configuration will be lost on reboot if you don't save it.

## Step 7: Install Lunar

Now use the Lunar installer to complete the installation:

1. Return to the installer interface
2. In the partition selection menu, choose **Add device**
3. Enter your RAID device manually (e.g., `/dev/md0`)
4. **Do NOT format** if you already formatted in Step 5
5. Select the correct filesystem type
6. Assign mount points (e.g., `/`, `/boot`, `/home`)
7. Continue with the normal installation process

## Step 8: Configure Bootloader

### LILO Configuration

LILO can boot directly from software RAID. Configure `/etc/lilo.conf`:

```conf
# Boot from the physical drive
boot = /dev/hda

# Root filesystem on RAID
root = /dev/md2
```

**Important:** The `boot` parameter should point to a physical drive (`/dev/hda`), not the RAID device, while `root` points to your RAID root partition.

### Enhanced LILO Configuration (Recommended)

For better reliability, install LILO to multiple drive MBRs:

```conf
raid-extra-boot=/dev/hda,/dev/hdb
boot = /dev/md0
root = /dev/md1
```

This writes the bootloader to both hard drive MBRs, ensuring you can boot even if one drive fails.

### GRUB Configuration

GRUB can read from underlying RAID partitions (but not stripe-based RAID):

```conf
default 0
timeout 30
color white/blue white/black

title Lunar Linux
root (hd0,0)
kernel /vmlinuz root=/dev/md1
```

**Note:** GRUB reads from one physical partition, so this won't work with RAID 0 (striping).

### Legacy BIOS Considerations

Older BIOSes may require physical disk parameters. See the [Software RAID HOWTO](https://tldp.org/HOWTO/Boot+Root+Raid+LILO-3.html#ss3.1) for details.

## Verifying Your RAID Array

After installation and reboot, verify your RAID array:

```bash
# Check array status
cat /proc/mdstat

# Detailed information
mdadm --detail /dev/md0
```

## Managing Your RAID Array

### Adding a Spare Disk

```bash
mdadm --add /dev/md0 /dev/hdc1
```

### Removing a Failed Disk

```bash
mdadm --fail /dev/md0 /dev/hdb1
mdadm --remove /dev/md0 /dev/hdb1
```

### Stopping an Array

```bash
mdadm --stop /dev/md0
```

### Starting an Array

```bash
mdadm --assemble /dev/md0 /dev/hda1 /dev/hdb1
```

## Troubleshooting

### Array Won't Assemble at Boot

Ensure `/etc/mdadm.conf` exists and contains your array configuration:

```bash
mdadm --detail --scan > /etc/mdadm.conf
```

### Bootloader Won't Install

Verify:
- Partition type is set to 0xfd (Linux raid autodetect)
- Boot partition is marked as bootable/active
- LILO configuration uses correct device names

### Poor Performance

- Increase chunk-size in raidtab (typical values: 32KB-256KB)
- Enable write-behind for RAID 1 to improve write performance
- Consider RAID 10 instead of RAID 5 for better write performance

## Additional Resources

- [Software RAID HOWTO](http://www.ibiblio.org/pub/Linux/docs/HOWTO/other-formats/html_single/Software-RAID-HOWTO.html)
- [Boot+Root+RAID LILO HOWTO](https://tldp.org/HOWTO/Boot+Root+Raid+LILO.html)
- `man mdadm`
- `man md`

## See Also

- [Complete Installation Guide](/docs/installation/complete-install-guide)
- [Installing Without CD](/docs/installation/advanced/no-cd-installation)
- [Kernel Parameters](/docs/installation/advanced/kernel-parameters)
