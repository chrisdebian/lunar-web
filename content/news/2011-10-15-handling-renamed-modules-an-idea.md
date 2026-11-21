---
title: "Handling renamed modules - An idea"
description: "A proposal for a SUPERSEEDED field in DETAILS, so updates can follow renamed modules."
date: 2011-10-15
author: "wdp"
---

A few days ago we had a little discussion on IRC how to handle renamed modules (once again). Due to the renamed KDE modules a few users had a broken Box because Lunar Linux isn’t keeping track of renamed modules – So, if a module gets renamed it looks like the module got removed and nobody knows how the new module might be called, except he’s searching for that. That leads to a lot of missing modules after an update.

zbiggy suggested the use of a table to keep track of such modules, his idea got rejected, tho. To read more about his initial idea/implementation [take a look at this mail](http://lists.lunar-linux.org/pipermail/lunar-dev/2011-August/007323.html).

However, we still need a solution to handle renamed modules better than we do currently, so I came up with the following snippets:

**Patch 1 to /var/lib/lunar/functions/modules.lunar**

```
368a369,381
> # function : module_superseeded
> # usage    : module_superseeded $MODULE
> # purpose  : checks if $MODULE is superseeded by another MODULE
> # return   : returns 0 if superseeded, 255 else
> module_superseeded() {
>   if run_details $1 &>/dev/null ; then
>     if [ ! -z "$SUPERSEEDED" ]; then
>       return 0;
>     fi
>   fi
>   return 255
> }
>
546a560,572
>       fi
>     else
>       # run_details $MODULE worked; thus the module is installed
>       # let's check if it got renamed.
>       if module_superseeded $MODULE ; then
>         message
> "${MODULE_COLOR}$MODULE${DEFAULT_COLOR}${MESSAGE_COLOR} got renamed to
> ${MODULE_COLOR}$SUPERSEEDED${DEFAULT_COLOR}";
>         if query "Do you want to switch to
> ${MODULE_COLOR}$SUPERSEEDED${DEFAULT_COLOR}${MESSAGE_COLOR} ?" y ; then
>           lrm $MODULE
>           lin $SUPERSEEDED
>           continue
>         else
>           message
> "${MODULE_COLOR}$MODULE${DEFAULT_COLOR}${MESSAGE_COLOR} is kept and can
> be renamed manually later${DEFAULT_COLOR}";
>         fi
```

**Patch 2 to /sbin/lin**

```
142a143,146
>           elif module_superseeded $MODULE ; then
>             error_message
> "${LRM_COLOR}Notice:${DEFAULT_COLOR}${MESSAGE_COLOR} The module is
> superseeded by
> ${MODULE_COLOR}$SUPERSEEDED${DEFAULT_COLOR}${MESSAGE_COLOR}";
>             error_message "please lin that one
> instead.${DEFAULT_COLOR}"
>             continue
```

Remember, the goal was to keep it very simple. The above code changes the way, developers have to handle modules (if they rename them) a little bit. They have to set the SUPERSEEDED flag in DETAILS file to get it working. The devs I talked to have been okay with this approach.

**Example:**  
renamed gcc to wdp-rulez

```
[lunar] root@lunar /var/lib/lunar/moonbase/compilers # purge_modules
+ Discovering modules that were removed from moonbase
flash-plugin-10 was removed from /var/lib/lunar/moonbase
flash-plugin-10: Do you want to remove flash-plugin-10 ? [y] n
flash-plugin-10 is kept and can be removed manually later
gcc got renamed to wdp-rulez
gcc: Do you want to switch to wdp-rulez ? [y] n
gcc is kept and can be renamed manually later
[lunar] root@lunar /var/lib/lunar/moonbase/compilers #
```

For devs handling of modules changes to this:

The proper way to handle renamed modules is now:

1. Copy the module to it’s new place and rename the copy.  
   _e.g: cp -rva compilers/gcc compilers/newgcc_
2. Move the old one to zdeprecated  
   _e.g: mv compilers/gcc zdeprecated/gcc_
3. Remove everything \_except\_ DETAILS from zdeprecated/gcc/\*
4. Add: SUPERSEEDED=newgcc to DETAILS  
   _e.g: echo “SUPERSEEDED=newgcc” >> zdeprecated/gcc/DETAILS_

El\_Angelo suggested that we make sure that people can’t lin/get  
the new module if they “lin” the old one.

Example:

```
root@lunar ~ # lin gcc
+ Spawning download manager
+ download queue:   gcc
Notice: The module is superseeded by  wdp-rulez
please lin that one instead.
root@lunar ~ #
```

That way we’re making sure, that nobody installs a package which  
is superseeded by another.

Let’s see whether this will go into Lunar :)
