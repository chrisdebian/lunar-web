---
title: "Updating old lunar installations: Getting rid of hal"
description: "How to remove the deprecated hal from an older installation and rebuild what depended on it."
date: 2011-07-29
author: "wdp"
---

As hal is deprecated now, most new-installations don’t have it anymore. My netbook still has it, so how do I get rid of it easily? Read on, if you want to know..

```
lrm hal-info hal
for i in `lsh list_installed_depending hal`; do lin -cr "$i"; done
lunar fixdepends
lunar fix
```

`lunar fixdepends` might not be needed; however. Basically I’m removing `hal-info` and `hal`. Then I’m going through all modules which have hal as dependency and I’m relinning them using `lin -cr` (which will ask me everything again so I can say no to hal). Right after doing so, I’m running `lunar fixdepends` to re-create the dependency stuff and `lunar fix` to resolve any other issues which might be there due to the removal of hal.

**lsh** is lunar’s internal .. well. let’s name it “lunar shell” which is just a shell with lunar functions. Those functions you’ll find in `/var/lib/lunar/functions/`. You can use them for quite useful stuff.

**Note** for correct “dependency” order it would be better to have the dependencies in “one” line instead of doing that “for”. I.e.:

```
MODULES=""; for i in `lsh list_installed_depending hal`; do   VAR=$(echo "$MODULES" | grep "$i"); if [ -z "$VAR" ]; then      MODULES="$MODULES $i";   fi; done
```
