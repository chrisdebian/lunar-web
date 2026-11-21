---
title: "1.6.4-beta1 (i686 & x86-64) ISO released"
description: "1.6.4-beta1 \"Lacus Autumni\" ships kernel 2.6.27, working software RAID and USB installs."
date: 2008-10-14
author: "Ratler"
---

Dear users,

HEAR, HEAR! Lunar Linux 1.6.4-beta1 codename 'Lacus Autumni' just became available, so grab it while it's hot!

We encourage everyone to give the latest ISO a test spin, your feedback is invaluable to us. With your help we will make Lunar even better!

We know it has been a long wait for a new ISO to become available that fixes all the problems using the old ISO's, so wait no further! The 1.6.4 stable release is just around the corner and we hope it will please everyone. As mentioned in our previous announcement XOrg and Xfce4 had to be removed from the ISO, as it was just not worth the effort to maintain them. Instead we can put that effort into further improving our installer and ISO quality.

### New features in 1.6.4

- Working software raid configuration
- Improved language selection
- Installation from a USB stick or other media
- Ships with kernel 2.6.27!
- ReiserFS, XFS and JFS are now also built-in with the precompiled kernels

Please try the new ISO and give us feedback through the bugtracker. You can also inform us directly on [IRC](irc://irc.freenode.net/lunar) and via our [mailing lists](http://lists.lunar-linux.org/cgi-bin/mailman/listinfo), though the bug tracker is preferred.

### Summary of changes since 1.6.4-alpha3:

- Fixed an issue with swap partitions showing up twice in fstab if more than one was added
- Added a feature to list what filesystem type you chose for the assigned partition
- We now disable /tmp on tmpfs if the user add a /tmp partition
- Precompiled kernels will now get registered as installed
- As mentioned the default kernel config now includes xfs, jfs and reiserfs as built-in
- Software raid fixes
- All modules refreshed
- Kernel 2.6.27 added
- Module freetype2 removed
- A few 'luser' bugs were fixed that caused various issues creating groups for a new user
- A 'lservices' bug fixed, it's now again possible to enable/disable services

### Known issues:

No known issues at this time

### Download here:

#### Mirror(s)

- `http://lunar-linux.org/lunar/testing/lunar-1.6.4-beta1-i686.iso.bz2`
- `http://lunar-linux.org/lunar/testing/lunar-1.6.4-beta1-x86_64.iso.bz2`

#### MD5sums

- `http://lunar-linux.org/lunar/testing/lunar-1.6.4-beta1-i686.iso.bz2.md5`
- `http://lunar-linux.org/lunar/testing/lunar-1.6.4-beta1-i686.iso.md5`
- `http://lunar-linux.org/lunar/testing/lunar-1.6.4-beta1-x86_64.iso.bz2.md5`
- `http://lunar-linux.org/lunar/testing/lunar-1.6.4-beta1-x86_64.iso.md5`
