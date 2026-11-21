---
title: "Update to coreutils"
description: "Update the core tools before coreutils, so chown and chmod survive the upgrade."
date: 2006-12-17
author: "moe"
---

Hello community,

to let you know: For the recent updates to 'coreutils' you HAVE TO update your coretools (lunar/theedge) first in order for the update not fail because of chmod and chown being lost in the process.

chown and chmod have recently been added to the so called 'protected' list thus they are now preserved throughout upgrades and your machines should not be rendered useless incase your coreutils are being updated.

If that is the case please extract chown and chmod from a working cache copy (located in /var/cache/lunar/) or grab them directly from /usr/src/coreutils-$VERSION and put them into /bin. Once that is accomplished please update your coretools first and relin coreutils afterwards.

We are sorry for inconvenience and hope that this hasn't caused too much agony for all of you.

Regards,

Moritz aka Moe
