---
title: "udev update to 101"
description: "udev 101 arrives in moonbase with a new rules patchset, and may ask for a few missing groups."
date: 2006-10-08
author: "moe"
---

udev has been updated in moonbase yesterday. Its been tested extensively, features a new rules patchset that is ment to provide a wider range of compatibility and effectiveness considering the hotplug and coldplug stages of every Lunar installation.

Right now we don't expect any error to turn up but of course we are just human like everybody else. Yet, there can be some warnings popping up at boot time considering missing groups for device nodes (Yes, udev now actually checks wether groups that it assigns devices to are present or not), especially considering the groups "uucp", "dialout", "usb" and "cdrw". If you encouter any of those warnings just go ahead and create these groups. They provide a broader range of possibilities for administrators to adjust their machines access-rights.

Enjoy!

For the Lunar Linux Development Team,

Moritz Heiber
