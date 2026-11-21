---
title: "XOrg updated to 7.3"
description: "XOrg in moonbase is updated to X11R7.3, with two caveats for mouse and NVIDIA users."
date: 2007-09-10
author: "elangelo"
---

XOrg has been updated in moonbase to version X11R7.3

Updating from the previous version in moonbase should be handled automatically by lunar update.

However, there are 2 caveats:

1. If, after updating, your mouse is not working, please recompile xf86-input-mouse via `lin xf86-input-mouse`. Restart X afterwards.
2. The current NVIDIA driver (100.14.11) does not support XOrg 7.3
   - To bypass this problem you can add the `-ignoreABI` argument to the `startx` command, or have your login manager pass it to X.
   - NOTE: It may be a good idea to disable the composite extension until the next release.

Samuel

### Update

As of today (19/09/2007) the NVIDIA driver (version 100.14.19) is compatible with XOrg 7.3, the `-ignoreABI` is no longer needed
