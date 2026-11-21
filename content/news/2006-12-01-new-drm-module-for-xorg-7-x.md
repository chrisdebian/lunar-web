---
title: "New DRM module for XOrg 7.x"
description: "A new drm-git module replaces libdrm-cvs for 3D acceleration under XOrg 7."
date: 2006-12-01
author: "moe"
---

Hello community,

I just added a new module to the moonbase called 'drm-git'. It replaces the obsolete 'libdrm-cvs'. Both modules have the sole purpose of providing the kernel interface modules for the direct rendering manager X uses to enable your video card's 3D acceleration. So if you happen to have libdrm-cvs installed its going to get removed on the next run and you will have to install drm-git instead to get a fully accelerated X environment again.

ATTENTION: THIS DOES NOT APPLY IF YOU ARE USING THE NVIDIA OR FGLRX DRIVER! DO NOT lin mesa-lib! You don't need it as the binary drivers you use provide the kernel modules on their own.

Alongside with this update comes a libdrm (regular version) update and a slight mesa-lib modification (which shouldn't effect anyone actually). Although, if were using the mach64 or r300 driver provided by mesa-lib you will not be able to do that until the next mesa release since the drivers are temporarily disabled. I'm sorry for that inconvenience but they just do not compile.

Enjoy.

Moritz Heiber

Lunar Linux Development Team
