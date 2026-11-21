---
title: "New installation ISO development"
description: "The next installer ISO is in development, with a new build system, systemd and dracut."
date: 2013-09-19
author: "cavalier"
---

As people have started asking if Lunar-Linux were a dead project, we would like to inform you that it is not. Developers are working on improving the Lunar components and new/updated modules that hit the Moonbase every week.

The next installation ISO has been in development for some time now and there have been 4 development releases on the [lunar-dev](http://lists.lunar-linux.org/cgi-bin/mailman/listinfo/lunar-dev) mailing list.

_What is the current state?_

The ISO got a new build system which makes it more robust to future changes. As this is like starting from scratch, it takes some time to work out all the quirks.

It will install with systemd and using dracut as init ram disk .You can choose between grub2, lilo and grub as boot loader. The installation ISO is a hybrid, meaning, you can either burn it on an CD/DVD or flash it onto a USB pen drive. The installer will guide you trough the installation process. Setting up font, keyboard, language and time zone. Creating partitions, formatting, mounting and copying the Lunar-Linux system onto it. Configuring the network, adding users and configuring Lunar.

There are still some things to work out. The ISO doesn't automatically run the guided installer, in the last release the installer need a hot fix to work at all. The generated lilo configuration doesn't boot with dracut. Some files are copied, but shouldn't be there or need to be regenerated.

_What can I do?_

You can help us with the development by testing or giving us feedback. Just register on the [lunar-dev](http://lists.lunar-linux.org/cgi-bin/mailman/listinfo/lunar-dev) mailing list test the new ISO releases and report the problems you find.
