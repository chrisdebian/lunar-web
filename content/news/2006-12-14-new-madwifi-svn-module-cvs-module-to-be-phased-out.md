---
title: "New Madwifi-svn module / CVS module to be phased out"
description: "A madwifi-svn module replaces madwifi-cvs, and a stable madwifi module is added."
date: 2006-12-14
author: "moe"
---

Hey everybody,

I added a `madwifi-svn` module to the moonbase. It is going to replace the `madwifi-cvs` module in a week (means the cvs modules is going to disappear and there's only going to be the svn module).

Also, the stable version of the madwifi wireless driver has been added as well named `madwifi`. It is supposed to provide people with a stable alternative to the bleeding edge svn driver. Unfortunately, the stable driver is semi-broken with the current kernel so if you are considering an upgrade please use the svn module for the time being. Once the stable driver recieves an update we're going to test and probably bump it so everyone can use it.

Everyone is strongly encouraged to update to the newer madwifi driver. It contains fixes of a whole year that the (dead) cvs version hasn't recieved (and probably never will).

Enjoy!

Moritz aka Moe
