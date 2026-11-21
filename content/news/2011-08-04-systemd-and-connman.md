---
title: "Systemd & Connman"
description: "A walkthrough of replacing the init system with systemd, and the network scripts with connman."
date: 2011-08-04
author: "wdp"
---

I wrote about a possible switch of the init-system in Lunar Linux some time ago. Today I’ll  show you how to replace your init-system with systemd and connman in Lunar Linux.

First of all, systemd needs some kernel-options which you should enable. Some of them are optional, however, most of them are recommended. So I’m starting with `lin -cr linux-2.6` and I’m configuring the Kernel. You should make sure you have the following things enabled:

```
CONFIG_DEVTMPFS=y
CONFIG_CGROUPS=y
CONFIG_AUTOFS4_FS=[y|m]
CONFIG_IPV6=[y|m]
CONFIG_RTC_DRV_CMOS=y
CONFIG_FANOTIFY=y
CONFIG_AUDIT=y
```

AUDIT is not a requirenment. IPV6 is not a requirenment i.e. it’s recommended to have them, not needed though.

Now we can continue by installing systemd using the following command:

```
lin systemd
```

The installer will ask you, whether you want sysv-compatibility, for now you should say “yes”, because of a few reasons. For example networking wouldn’t work correctly without it, as of writing this article. If it asks you whether you want cryptsetup keep in mind that this will install lvm2, which is not what I want, because I use device-mapper which would conflict with lvm2. So I’ll say “no”.

**Suggestion**: If compilation fails because of some error get it compiled by saying “no” to libnotify.

The next step in our list is removing everything not-needed from `/etc/fstab`. `/etc/fstab` should ONLY contain your real drives. That means, comment `/dev/pts` comment `/proc` comment `/var*` and tmp.. My fstab looks like this:

```
#UUID=83f6bd55-9686-46e2-b793-74a3e13332cd
/dev/sda1               /       ext4            defaults,noatime        0 1
#UUID=e66bbf62-783b-4276-b2f8-5bd05bbfd542
/dev/sda5               /home   ext4            defaults,relatime       0 2
/dev/sda2               swap    swap            defaults                0 0
```

There’s NOTHING ELSE in `/etc/fstab`. Now you need to add a symlink from `/proc/self/mounts` to `/etc/mtab`. If you don’t, you’ll get:

```
Aug  4 14:07:24 localhost kernel: systemd[1]: /etc/mtab is not a symlink or not pointing to /proc/self/mounts. This is not supported anymore. Please make sure to replace this file by a symlink to avoid incorrect or misleading mount(8) output.
```

so just do:

```
rm /etc/mtab && ln -s /proc/self/mounts /etc/mtab
```

## The stuff below, is already integrated into lunar linux

That means, you don’t need to do this. This is just here, so you can see what I had to do when I initially tried to integrate it. However; Skip to "Migrating Services" below :)

You can try systemd now by adding `init=/sbin/systemd` to your bootloader. I hope it’s starting as fine for you as for me. However. Let’s configure systemd now. First we should set a nice hostname, in case you haven’t set one yet.

```
echo "yourhostname" > /etc/hostname
```

Now let’s configure console font and such stuff. Open `/etc/vconsole.conf` with your favorite editor and write something like this to it:

```
KEYMAP=de
FONT=sun12x22
FONT_MAP=8859-15_to_uni
```

As a little hint: You can check available keymaps in `/usr/share/kbd/keymaps/`. DE is german. You can check for available fonts in: `/usr/share/kbd/consolefonts`. I love this font. And the font maps are located in: `/usr/share/kbd/consoletrans`. 8859-15 is euro charset.

You can add the following to `/etc/os-release`:

```
NAME=Lunarlinux
ID=lunar
PRETTY_NAME=Lunar Linux
ANSI_COLOR=1;34
```

Usually you shouldn’t touch this, but as it doesn’t exist yet… Now add the locales:

```
LANG=en_US.utf8
LC_COLLATE=C
```

to `/etc/locale.conf` – I dislike german locales.. if you like them, replace `en_US` with `de_DE`. Basically this was it. You could play around with module blacklisting and loading now but that’ll be explained by me another time.

## Migrating services

I hope you’re willing to improve Lunar Linux also – Issue:

```
systemctl
```

and scroll down. You’ll see some lines with “failed”. Please report them or try to find out, why they failed, try to fix them and let us know on IRC or by mail.

Also take a look at those lines containing SYSV. Those are the compatibility-sysv-services which needs to be replaced i.e. we need to write a service for them. I’ll show you one example. You can help us to improve Lunar by mailing such services to us or by giving them to us on irc (using pastebin or something).

Anyway. Let’s imagine we want to write a service for “slim” my favorite graphical login manager. First let’s go into `/etc/systemd/system` as it’s a system-service and not a user-service. Now open `slim.service` in your favorite text editor.

```
[Unit]
Description=slim - simple login manager
Requires=dev-tty7.device
After=dev-tty7.device systemd-user-sessions.service

[Service]
ExecStart=/usr/bin/slim -nodaemon
Restart=always
StandardOutput=syslog

[Install]
WantedBy=graphical.target
```

I guess, the stuff is pretty self-explaining. Now issue:

```
systemctl enable slim.service
```

And you’re done. That was all about it.

## Connman

Currently we’re using some bash scripts and lnet to setup networking. Using connman this can be simplified a lot. El\_Angelo and me are working on some GUI for connman right now, will take some time till it’s in moonbase. However, if you got a dhcp router connman should easily configure your wired network automatically – wireless lan should work also. If you have any trouble with connman ask us on IRC and we’ll try to help.

```
lin -cr connman
mv /etc/init.d/network /etc/init.d/network.old
/etc/init.d/network.old stop
systemctl enable connman.service
systemctl start connman.service
```

This will install connman, make a backup of your network init script i.e. if networking fails with connman just do `/etc/init.d/network.old start`, enable the service and start connman.

Check if `/etc/resolv.conf` is correct, check if `ifconfig` is correct, check if internet connectivity/network works. If yes – Try a reboot and check if your network comes up automatically.

For wlan, unpack the source (`/var/spool/lunar/connman*`) to `/usr/src`, switch into that directory, and there switch into the directory `test` within that folder, you’ll find a few test-tools which are handy to configure connman:

```
./list-services
```

find out your service (the part after /service/ starting with `wifi_`)

```
./test-connman enable service
```

(replace service with `wifi_yourservice`)

to enable the stuff. Now you can set the Passphrase:

```
./test-connman passphrase service the-phrase
```

(replace service again, and put in your phrase at the-phrase)

and you can try to enable autoconnect:

```
./test-connman passphrase service
```

**hint #1**  
dveatch reported that he dislikes iptables and that connman moaned because of some xtable thingy. A simple lin of iptables solved that issue for him.

**hint #2**  
we did some work on the `wpa_supplicant` module, it might well be that you have to relin it, so that it uses the new dbus interface and so that it has the nl80bla-driver enabled. even if you just use wired networking, connman might moan that it wants wpa_supplicant - So just install it using `lin -cr wpa_supplicant`.

## Switching to non-sysv-compat systemd

Basically you just had to do the following: install systemd. boot with systemd. Migrate your services to systemd (at least the important ones), get connman working (thus our old network init script is not used anymore and your network works without sysvinit), reboot and check for any errors, solve them if possible and if there are any, recompile systemd without sysv-compatibility, reboot - done.
