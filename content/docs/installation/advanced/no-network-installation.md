---
title: "Installing Without Network Access"
description: "How to install and update Lunar Linux without a fast or available network connection"
category: "installation"
tags: ["installation", "advanced", "offline", "network"]
order: 2
---

This guide explains how to install and maintain Lunar Linux when you don't have access to a fast network connection or any network at all. While more complex than a standard network-based installation, it's entirely feasible with proper planning.

## Overview

The basic strategy involves:

1. Download all necessary files when you have network access
2. Transfer files to your target system via CD-ROM or USB
3. Install Lunar from the ISO normally
4. Install the pre-downloaded sources and moonbase
5. Build your system from the cached sources

## Prerequisites

Before starting, you'll need access to a system with good internet connectivity to download:

- The Lunar ISO
- A moonbase tarball snapshot
- The complete list of source URLs
- All source packages listed in the URL file

## Step 1: Download Required Files

When you have network access, download these files at the same time:

1. **Lunar ISO:** Get the latest installation ISO
2. **Moonbase tarball:** Download from [http://lunar-linux.org/lunar/moonbase.tar.bz2](http://lunar-linux.org/lunar/moonbase.tar.bz2)
3. **Source URL list:** Download from [http://download.lunar-linux.org/lunar/mirror-urls.txt](http://download.lunar-linux.org/lunar/mirror-urls.txt)

**Important:** Download the moonbase tarball and mirror-urls.txt at the same time to ensure they're synchronized. If these files are out of sync, some packages may fail to build.

## Step 2: Download All Source Packages

After downloading the URL list, download all sources referenced in `mirror-urls.txt`. This will require approximately 5-8 CD-ROMs or a large USB drive.

**Using wget to download all sources:**

```bash
for URL in $(cat mirror-urls.txt); do
    wget -c $URL
done
```

The `-c` flag allows wget to resume interrupted downloads, which is helpful for large downloads.

**Optional: Customize your selection**

You can edit `mirror-urls.txt` to exclude packages you won't need (e.g., KDE if you're using a different desktop environment). This can significantly reduce download time and storage requirements.

## Step 3: Burn to Media

Burn the source packages and moonbase tarball to CD-ROMs or copy them to USB drives. Organize them logically for easier retrieval during installation.

## Step 4: Install Lunar from ISO

Boot from the Lunar ISO and perform a standard installation:

1. Boot the ISO
2. Follow the installation wizard
3. Configure partitions and filesystems
4. Install the base system
5. Configure your bootloader
6. Reboot into your new Lunar system

At this point, you'll have a minimal but bootable Lunar Linux installation.

## Step 5: Copy Sources to Cache Directory

After booting into your new Lunar system, copy all downloaded sources to Lunar's cache directory:

```bash
# Mount your CD-ROM or USB drive
mount /dev/cdrom /mnt/cdrom

# Copy sources to Lunar's cache
cp /mnt/cdrom/* /var/spool/lunar

# Repeat for each CD or drive containing sources
umount /mnt/cdrom
```

The `/var/spool/lunar` directory is where Lunar looks for cached source files during package installation.

## Step 6: Install the Moonbase

Extract the moonbase tarball, preserving your local module customizations (zlocal):

```bash
cd /var/lib/lunar

# Backup your local module directory (if it exists)
mv moonbase/zlocal .zlocal

# Remove old moonbase
rm -rf moonbase

# Extract new moonbase
tar xjf /var/spool/lunar/moonbase.tar.bz2

# Restore local modules
mv .zlocal moonbase/zlocal
```

## Step 7: Initialize the Moonbase

Initialize the new moonbase to build the module index:

```bash
lsh
check_module_index
```

### Modern Alternative (theedge 20041126 and newer)

On newer versions of Lunar, you can install the moonbase with a single command:

```bash
lget moonbase --url file:///path/to/moonbase.tar.bz2
```

This method automatically handles backup and restoration of local customizations.

## Step 8: Install Packages

You can now install any module from the moonbase without needing a network connection:

```bash
lin module-name
```

Lunar will use the sources from `/var/spool/lunar` instead of downloading them.

## Important Considerations

### Incomplete or Outdated URL Lists

The mirror-urls.txt file may be incomplete or contain outdated URLs. Some files might:

- Be missing from the list
- No longer be available at the listed URLs
- Have been updated since the list was generated

**Be prepared to make multiple trips to update your source cache** or have a backup method to download individual packages.

### Modules That Always Download

**Never install these modules without network access:**

- `moonbase` - Always attempts to download
- `lunar` - Always attempts to download
- `theedge` - Always attempts to download

These modules bypass the source cache and always try to fetch the latest version from the network. If you must update them offline, use the manual moonbase installation method described above.

### Holding Packages

To prevent accidental updates of critical packages, use the `lunar hold` command:

```bash
lunar hold moonbase
lunar hold lunar
lunar hold theedge
```

This prevents these packages from being updated during system updates.

## Updating Your System Offline

To keep your offline system updated:

1. Periodically download a fresh moonbase tarball and mirror-urls.txt
2. Download any new or updated sources
3. Transfer them to your offline system
4. Replace the moonbase using the method described above
5. Copy new sources to `/var/spool/lunar`

## Tips for Success

- **Storage space:** Ensure you have adequate disk space for sources (5-10 GB)
- **Organization:** Label your media clearly to find packages quickly
- **Documentation:** Keep a copy of this guide offline for reference
- **Testing:** Verify critical packages compile successfully before disconnecting from the network
- **Prioritization:** Install and test essential packages first

## Troubleshooting

### Missing Source Files

If a package fails to build due to missing sources:

```bash
# Check if the source is in the cache
ls /var/spool/lunar/package-name*

# If missing, download it when you have network access
# Then copy it to /var/spool/lunar
```

### Checksum Mismatches

If checksums don't match, your moonbase and sources may be out of sync. Ensure you download both at the same time.

### Build Failures

Build failures offline are the same as online. Check:

- Build logs in `/var/log/lunar/compile`
- Missing dependencies
- Incorrect optimizations

## See Also

- [Complete Installation Guide](/docs/installation/complete-install-guide)
- [Installing Without CD](/docs/installation/advanced/no-cd-installation)
- [Package Management Basics](/docs/package-management/lin-basics)
- [Moonbase Overview](/docs/package-management/moonbase)
