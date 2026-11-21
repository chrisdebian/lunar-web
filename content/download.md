---
title: Download Lunar Linux
description: Installer images, older releases and the source behind them.
featured:
  version: 1.8.0
  channel: Daily build
  arch: x86_64
  built: 2026-11-13
  # The daily file name carries its build date, so link the folder: it always holds the newest build.
  href: https://download.lunar-linux.org/lunar/daily/
  checksum: SHA-256
---

## Install in three steps

1. **Download the ISO** and write it to a USB drive.
2. **Boot it and run the installer.** The [installation guide](/docs/installation/installation-guide) walks you through disks, the kernel and the base system. Check the [system requirements](/docs/installation/requirements) first.
3. **Build your first package** with `lin nano`. [Package management](/docs/package-management) explains the rest.

## Verify the download

Every ISO has a checksum file next to it in the same folder. Download both, then run this in that folder:

```bash
sha256sum -c lunar-1.8.0-daily-*-x86_64.iso.sha256
```

`OK` means the ISO arrived intact. Older releases ship SHA-1 or MD5 files instead; check them the same way with `sha1sum -c` or `md5sum -c`.

## Development builds

The daily build is a snapshot of the upcoming 1.8.0 release. Each new build replaces the previous one in the [daily folder](https://download.lunar-linux.org/lunar/daily/).

- [1.8.0 release candidate 1](https://download.lunar-linux.org/lunar/testing/): an earlier test build from July 2019, kept in the testing folder. The daily build is newer.

## Older releases

1.7.0, from October 2014, is the last numbered release. Its images are xz-compressed; unpack one with `xz -d` before writing it to a USB drive.

- [1.7.0 for x86_64](https://download.lunar-linux.org/lunar/lunar-1.7.0-x86_64.iso.xz): 64-bit PCs, 361 MB ([SHA-1](https://download.lunar-linux.org/lunar/lunar-1.7.0-x86_64.iso.xz.sha1))
- [1.7.0 for i686](https://download.lunar-linux.org/lunar/lunar-1.7.0-i686.iso.xz): 32-bit PCs, 338 MB ([SHA-1](https://download.lunar-linux.org/lunar/lunar-1.7.0-i686.iso.xz.sha1))
- [1.5.1 to 1.6.5](https://download.lunar-linux.org/lunar/): bzip2-compressed images with MD5 or SHA-1 checksums, in the main download folder
- [1.4.0 and 1.5.0](https://download.lunar-linux.org/lunar/iso-archive/): the oldest images, in the ISO archive

## Source code

Lunar is developed in the open on [GitHub](https://github.com/lunar-linux).

- [lunar](https://github.com/lunar-linux/lunar): the package manager, with `lin`, `lunar` and friends
- [moonbase-core](https://github.com/lunar-linux/moonbase-core): the modules for the base system
- [moonbase-other](https://github.com/lunar-linux/moonbase-other): the wider collection of modules
- [moonbase-xorg](https://github.com/lunar-linux/moonbase-xorg): the X.Org display server
- [moonbase-kde](https://github.com/lunar-linux/moonbase-kde), [moonbase-gnome](https://github.com/lunar-linux/moonbase-gnome), [moonbase-gnome3](https://github.com/lunar-linux/moonbase-gnome3), [moonbase-xfce](https://github.com/lunar-linux/moonbase-xfce), [moonbase-efl](https://github.com/lunar-linux/moonbase-efl): desktop environments
- [lunar-tools](https://github.com/lunar-linux/lunar-tools): system administration tools such as `lnet` and `clad`
- [lunar-iso](https://github.com/lunar-linux/lunar-iso): the scripts that build these ISO images

The download server also carries a [moonbase snapshot](https://download.lunar-linux.org/lunar/moonbase.tar.bz2) as a single archive and a [source mirror](https://download.lunar-linux.org/lunar/mirrors/) with copies of upstream source tarballs.
