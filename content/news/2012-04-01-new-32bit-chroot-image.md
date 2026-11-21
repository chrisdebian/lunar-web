---
title: "new 32bit chroot image"
description: "A fresh 32-bit chroot image for running 32-bit programs on a 64-bit installation."
date: 2012-04-01
author: "wdp"
---

Just updated and uploaded a new image for use as a 32bit chroot - This is especially for those interesting, who want to use Lunar Linux in 64bit and need to run 32bit apps as well. Lunar Linux is not multilib and will, as it looks like, never be multilib (but never say never, so).

The image is Os, i686, mmx, sse and sse2 optimized, which means you'll need an sse(2) capable CPU to use this image (it's very likely that you have one if you plan on using such a chroot and if you're running 64bit, however, you can check using cat /proc/cpuinfo)

[The guide and download location is here](https://web.archive.org/web/20130316194757/http://wiki.lunar-linux.org/Miscellaneous:32BitChroot)

My aim for this image was to keep a low amount of pre-installed modules. The image comes with 101 modules:

```
acl                flex               libtool            psmisc
attr               gawk               libusb             Python
autoconf           gcc                libusb-compat      readline
automake           gccmakedep         Linux-PAM          rsync
bash               gettext            linux-stable       sed
bash_static        glib-2             lunar-init         shadow
bin86              glibc              lunar-tools        sysfsutils
binutils           gmp                m4                 sysvinit
bison              gperf              make               tar
bzip2              grep               modutils-wrappers  texinfo
ccache             gzip               moonbase           theedge
check              installwatch       mpfr               TimeDate
chkconfig          iproute2           nasm               timezone-data
coreutils          iputils            ncurses            udev
cpio               kbd                net-tools          unzip
cracklib           kernel-headers     openssl            usbutils
dialog             kernel-reqs        patch              util-linux
diffutils          kmod               pbzip2             vim
discover           lard               pciutils           wget
discover-data      less               pcre               which
distcc             lftp               perl               wipe
e2fsprogs          libcap             pkgconfig          xz
ethtool            libffi             polylib            zlib
expat              libidn             popt               
file               libmpc             ppl                
findutils          libtirpc           procps
```

If you're using the guide or my image, please let me know, some feedback is always welcome. Have fun!
