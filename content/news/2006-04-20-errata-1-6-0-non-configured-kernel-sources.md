---
title: "ERRATA: 1.6.0 - non-configured kernel sources"
description: "The 1.6.0 ISO leaves the kernel sources unconfigured; one command fixes it."
date: 2006-04-20
author: "moe"
---

Hi,

The 1.6.0 ISO has a minor flaw in the installation procedure that doesn't correctly configure the kernel sources in /usr/src/linux.

People who wish to compile XOrg or any other module that requires kernel sources will be unable to with out doing the following:

_$ make -C /usr/src/linux prepare_

this correctly creates /usr/src/linux/include/version.h, and should fix this problem.

Cheers,

Auke
