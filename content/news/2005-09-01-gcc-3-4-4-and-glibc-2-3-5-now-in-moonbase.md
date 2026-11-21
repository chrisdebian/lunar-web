---
title: "gcc 3.4.4 and glibc 2.3.5 now in moonbase"
description: "gcc and glibc are updated in moonbase, with a list of modules worth recompiling afterwards."
date: 2005-09-01
author: "nestu"
---

As you can see by the lateral moonbase tracker, gcc and glibc have been updated. Gcc 4.0.X is still not an option, as it needs some quite heavy patching for now.

Though the change should be non-problematic, there are some soft recommendations: recompile some basic things like installwatch, binutils, coreutils, bzip2, gzip, tar, diffutils, findutils and make, being the most important of these soft recommendations binutils and coreutils.
