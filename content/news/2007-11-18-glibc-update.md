---
title: "glibc update"
description: "A new glibc brings UTF-8 locales and ends support for the Linux 2.4 kernel."
date: 2007-11-18
author: "moe"
---

Hello dear community,

as of right now lunar is shipping the latest available glibc with its moonbase. It tooks some time, yet .. we managed to make it count. From now on, glibc comes bundled with a new language choser giving you the opportunity to chose from all currently supported languages including UTF-8 based locales (which has been missing from lunar ever since).

Along with it we're rolling out updates to several key core components like binutils, udev and hal .. some of them are being patched to work with the latest glibc. Others had to have the newer glibc ready in order to work correctly.

Also shipping is a brand-new kernel-headers-2.6 module including the latest headers from 2.6.23. It comes in both flavours, x86 and x86\_64.

This update also marks the end of the linux-2.4 kernels in moonbase. The newer glibc does not work with the old 2.4.x based kernel series. So **IF YOU'RE RUNNING LINUX 2.4.X PLEASE PUT GLIBC _ON HOLD_!** In the end you're not going to get around migrating to 2.6.x .. but its going to buy you some time.

All updates have been tested back and forth .. yet, I'm pretty sure there are bugs going to pop up here and there. Please make use of our bugtracker if you think you encoutered one.

All in all this has been a great team effort and I'd like to thank each and every member of our team for putting his/her spare time into it.

Thank you and have fun with the new glibc!

Cheers,

For the Lunar Linux Development Team, Moritz 'Moe' Heiber
