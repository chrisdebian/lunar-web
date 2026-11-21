---
title: "A `lunar update` trick"
description: "Add -rc to a line in the lunar update list to reconfigure that module's optional dependencies."
date: 2012-01-06
author: "dveatch"
---

There are many things I love about Lunar and here is a little trick that might save you some time.

When `lunar update` is run it will of course sort through the modules installed on your system and present you with an editable list. As a Lunar developer, often times I know a module in that list will fail its build because an optional dependency has changed. Sometimes I forget this until staring at the list and think "Oh poo, I know that one will fail".

My first option might be to let the update run and tidy things up later. My second option might be; do a Ctrl C, then `lin -rc $MODULE` and rerun the update.  Yes, we are aware Lunar can do a better job of figuring out when a modules optional dependencies have been changed (it is on our ToDo list).

To say the least, interrupting an update is a bit annoying. So if you want to reconfigure the optional depends of a module while in edit mode, just add "-rc" to the beginning of that modules line. Using phonon as an example, just make it look like this;

**\-rc phonon**

And that's it. Once the list is saved, Lunar will ask you again which optional depends it should use.
