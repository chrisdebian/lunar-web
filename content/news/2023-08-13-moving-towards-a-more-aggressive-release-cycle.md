---
title: "Moving towards a more aggressive release cycle"
description: "Daily ISO builds are now a reliable installer, so new installs start close to current."
date: 2023-08-13
author: "dagbrown"
---

[Lunar Linux's new _daily_ releases.](https://download.lunar-linux.org/lunar/daily/)

One of the great things about Lunar Linux is that it's a rolling-release distro. Which is to say, once you've installed it, bringing it all up to date is a simple matter of using the `lunar update` facility, which updates the moonbase--the software metadata repository--and then updates all of the software on your system to the current latest version. However, the latest official ISO release was a while ago. Which means that if you download Lunar Linux from the download page, you will have quite a long adventure ahead of you as everything needs to be updated.

That's why I've started making daily ISO releases. They started out as a way for me to incorporate new software into the Lunar Linux installer, then they turned into a way to test pull requests in the core moonbase, and now they're a reliable, safe, Lunar Linux installer. They work as USB media or if you burn them to a DVD--unfortunately they've grown too big for CD media over the years. If you want to install headless, they have serial-port installation support (think `virsh console` if you're wondering why anyone needs serial ports in 2023).

So if you want to try Lunar Linux, please try the daily ISO.
