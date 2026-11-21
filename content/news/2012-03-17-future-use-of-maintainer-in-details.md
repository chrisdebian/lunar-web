---
title: "Future use of MAINTAINER= in DETAILS"
description: "The MAINTAINER field in DETAILS starts to matter: ask a module's maintainer before changing it."
date: 2012-03-17
author: "wdp"
---

Currently we aren't using the MAINTAINER= flag correctly in Lunar. I'd even go that far and say, we don't care about that flag and we simply ignore it. With the new separation (stable / unstable) this will change:

The maintainer-flag is usually set by developers or people for a specific module; that means such people or developer have a special need or knowledge about that module and should be asked whenever there's an update or modification to this specific module.

For example:  
El\_Angelo is set as maintainer for xorg-server, that's because he's reading the maillinglists, checking their bugtracker and he knows what he's doing regarding xorg (At least, thats my impression) - If someone else wants to update xorg-server he/she should ask El\_Angelo first why he didn't update it, yet. Because El\_Angelo might have a good reason for not doing so.

That means from now on we will care for the MAINTAINER flag and everytime a module needs a modification or update the MAINTAINER has to be contacted first. If a Maintainer doesn't respond within two weeks, you can update or modify the module yourself. If it's \_really\_ important to update something (bugfix, security patch) you might wait less time; However: Please always try to contact the maintainer, you can assume, that the Maintainer knows better about the module than you do.

We've started some sort of mass-mailing to all set MAINTAINER's in Lunar Linux with a list of the modules they've set themselves as MAINTAINER and hope to get a lot of feedback. We will remove all MAINTAINER flags from users who didn't respond within two weeks.
