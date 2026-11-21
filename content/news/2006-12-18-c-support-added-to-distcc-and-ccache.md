---
title: "C++ support added to distcc and ccache"
description: "distcc and ccache can now cache and distribute C++ builds too."
date: 2006-12-18
author: "jannis"
---

Dear Lunar users,

I'm glad to announce that C++ support has been added to **distcc** and **ccache**. This means that you can now benefit from C++ compile results being cached as well as C++ builds being distributed among your machines.

These features can be enabled by running **lunar optimize** and switching on distcc, ccache and setting up parallel makes. Should be pretty self-explanatory once you're in the optimization menu.

 If you hit any problems just let me know. There are still a lot of modules out there which do not work with parallel makes but are not marked according.

Kind regards,

Jannis
