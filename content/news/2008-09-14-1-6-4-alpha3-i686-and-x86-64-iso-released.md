---
title: "1.6.4-alpha3 (i686 & x86-64) ISO released"
description: "1.6.4-alpha3 \"Lacus Autumni\" is out for testing, with RAID, language menu and Grub fixes."
date: 2008-09-14
author: "Ratler"
---

Dear users,

We are happy to announce that Lunar Linux 1.6.4 is coming closer to a release, 1.6.4-alpha3 codename 'Lacus Autumni' is available for testing.

It has been a long wait, but finally a new release is in the works that will correct all the issues installing Lunar using the old ISO's. We have also decided to remove XOrg and XFCE that was available on the 1.6.2-beta2 release to shrink the ISO size a bit.

### Summary of changes:

- Fixes for the RAID MD configuration.
- Improved language menu selection.
- Installation from a USB stick or another media (more information about this later).
- Grub fixes.
- Other minor bugs.

Do you feel daring? If so, please try the new ISO and give us feedback through the bugtracker. You can also inform us directly on [IRC](irc://irc.freenode.net/lunar) and via our [mailing lists](http://lists.lunar-linux.org/cgi-bin/mailman/listinfo), though the bug tracker is preferred.

### Known issues:

- Adding primary group for a user during installation fails. You must instead run:
  - `groupadd -g _GID name_`
- Booting from software raid is currently broken in this release with no workaround yet.

### Download here:

#### Mirror(s)

- `http://lunar-linux.org/lunar/testing/lunar-1.6.4-alpha3-i686.iso.bz2`
- `http://lunar-linux.org/lunar/testing/lunar-1.6.4-alpha3-x86_64.iso.bz2`

#### MD5sums

- `http://lunar-linux.org/lunar/testing/lunar-1.6.4-alpha3-i686.iso.bz2.md5`
- `http://lunar-linux.org/lunar/testing/lunar-1.6.4-alpha3-i686.iso.md5`
- `http://lunar-linux.org/lunar/testing/lunar-1.6.4-alpha3-x86_64.iso.bz2.md5`
- `http://lunar-linux.org/lunar/testing/lunar-1.6.4-alpha3-x86_64.iso.md5`
