---
title: "Attention! Huge update"
description: "A new lunar-init module takes over the core init scripts, and the switch needs a few manual steps."
date: 2007-04-05
author: "moe"
---

I just commited a huge update to the way Lunar Linux handles its most vital init scripts. From now on, a module named '`lunar-init`' is going to hold some of the more system-bound init scripts like '`mount`' (which has been with e2fsprogs before) and '`network`' (which has been a part of net-tools). **This update is by no means automatic and requires your attention**:

1. Run lunar update as usual. lunar-init is a dependency of lunar/theedge and thus will get installed before anything else.

   However, it is meant to fail on the first run since the old init scripts are still installed in `/etc/init.d`. DO NOT PANIC. This is the intended behaviour and saves us from dozens of lines of migration code.

2. Let your update continue as planned. e2fsprogs and net-tools have both been "updated" (their UPDATED field has been set to today) in order for them to complete a compilation without installing any init scripts. This step has to be taken to asure that none of the init scripts are tracked via any other installation logs than that of '`lunar-init`'.
3. Check whether one of the following files is still present in `/etc/init.d/`:

   - `hostname`
   - `network`
   - `netmount`
   - `mount`

   If that is the case (and you do not employ your own version of these scripts) remove them on your own. If you don't remove them on your own '`lunar-init`' is NOT going to install or overwrite any files present and will throw an error again.

4. Reinstall '`lunar-init`'. It should now go smooth and without an error. If that is not the case DO NOT REBOOT your machine but report the problem to our bugtracker.
5. Check whether you now have existing copies in `/etc/init.d` of the files mentioned earlier.

And we're done. Congratulations! Its now safe to reboot your box (not mandatory).

## FAQ

**Q:** Any updates on the init scripts?

**A:** Absolutely. The network script has been refactored to support WEP/WPA/ifplugd out of box. Now you will be able to configure your wpa\_supplicant and just let it run at boottime. Combined with ifplugd it lets you run dhcp clients on requests or network connectivity. Roaming and network priorities etc .. you name it.

The other scripts have been tweaked to work with chkconfig.

**Q:** Are there any other init scripts going to be intregrated with this module?

**A:** Most likely.

**Q:** Why go through all this trouble?

**A:** It makes the init scripts maintainable. Before that we always had to bump individual versions of modules that weren't related to any of the actions these scripts invoked.

**Q:** No seriously, why?

**A:** Because sofar said so.

Any further questions or bugs can be directed either to this list, the IRC channel or our beloved bugtracker.

Enjoy!

Moritz Heiber for the Lunar Linux Development Team
