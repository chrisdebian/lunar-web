---
title: "Lunar Linux ISO install guide"
description: "The update steps needed after installing from the outdated 1.6.2 (or older) ISO."
date: 2008-07-10
author: "moe"
---

## Note: This guide only applies to 1.6.2 or lower.

Since our ISO is pretty outdated right now (work has begun on a new release, yet, there is no release date in sight. Its going to be ready 'when its done' (tm)) it does require a special kind of way to install it properly. This guide is ment to help you through the pain.

First and foremost, once you hit your first command prompt telling you to read `man lfirsttime` you should still go ahead and read `man lfirsttime`.

However, once you're through reading `man lfirsttime` **DO NOT FOLLOW IT'S INSTRUCTIONS JUST YET!**

The following steps are **REQUIRED** before any other to get a working system:

1. Update your moonbase and coretools by running

   `$ lin moonbase`

   and

   `$ lin theedge` (or if you prefer lunar over theedge you should obviously `lin lunar`)

2. Now, update gcc **ONCE**.

   **DO NOT UPDATE GLIBC OR ANY OTHER MODULE RIGHT AFTER GCC!**

   `$ lin -cr gcc`
3. Reset your optimizations by running

   `$ lunar optimize`

   **This is the most crucial step right here**. Make sure `GCC_4_2` (gcc 4.2.x obviously) is your default compiler by selecting `GCC_4_2 -> default` and pressing ENTER. It should tell you that from now on gcc 4.2.x is going to be used as your default compiler. Also, don't forget to set the rest of the optimizations again. Don't overdo it. Chose a sane amount of compiler and ld flags.

   Without resetting your optimizations glibc is not going to compile and neither are a couple of other important modules. Basically, you are going to end up with a unusable system.
4. Update your kernel headers by issueing

   `$ lin kernel-headers-2.6`

   You need the newer headers installed in order for glibc to compile the right set of headers. Otherwise you're going to get in trouble sooner or later.

   **HINT:** If any of the modules you're going to compile past this point are failing because of missing SCSI headers files such as `scsi.h` you need to recompile `kernel-headers-2.6` and `glibc` again. The modules in question should be compiling normally afterwards.
5. Update glibc:

   `$ lin glibc`

6. Now, go on with the rest of modules mentioned inside `man lfirsttime`, notably (in this precise order) gcc, bash, coreutils, tar and wget:

   `$ lin -cr gcc bash coreutils tar wget`
7. Update `lunar-init` and `udev` .. otherwise your new system is not going to boot

   `$ lin -c lunar-init udev`

8. Once all of the above steps are completed I strongly recommend updating your kernel before going ahead with a full scale update or renew (for a reference see `man lunar`) since your currently installed header files are from a newer kernel than the one you're running right now. And honestly: Who doesn't like a fresh new kernel, right?

   `$ lin linux-2.6`

   Don't forget to reboot your system to get the newer kernel running!

I hope this guide is going to ease the pain of installing the outdated ISO a little bit. The whole team knows about this issue, however, time simply doesn't allow for a full scale ISO deployment right now. Once you're through with the general update procedure though your lunar install is going to be as good as any other.

If there are any further questions or comments don't hesitate to use the comment functionality of this lovely CMS, [drop by via IRC](irc://irc.freenode.org/#lunar) or even write an email to [our mailinglist](http://lists.lunar-linux.org/cgi-bin/mailman/listinfo/lunar) (registration required!). If you're desperate enough you may also [drop me a mail directly](mailto:moe@lunar-linux.org).

Cheers, Moritz
