---
title: "Lunar and network scripts"
description: "Weighing the options for networking: improve our own scripts, or switch to wicd, NetworkManager or connman."
date: 2012-01-11
author: "dveatch"
---

From the occasional IRC chats regarding the current state of our network scripts. Alternatives have been proposed such as;

1. Retain the basic concepts of the current scripts and improve them to handle additional network connection types. In general just make them better than their current state.
2. Switch to wicd.
3. Switch to NetworkManager
4. Switch to connman

Item one sounds the most appealing since another application would not need adding to the ISO. Well that would be true if only the very basic of network connectivity is desired out of the box such as Ethernet and WiFi. Anything more like VPN and PPPoE will of course need adding to the default ISO. Staying with our own scripts does allow us some flexibility. A good example was a thought by Ratler to move away from the use of ifconfig and friends to iputils.

Wicd has some possibilities. I have used it in the past and for the simple setups I needed, it worked fine. However compared to Item three and four I do not know how well it stacks up with more complicated networks. If their Home page is correct it still does not support PPPoE/DSL.

The NetworkManager has never given me a warm fuzzy. Why I cannot say especially since I have never used it; it is what it is. Perhaps it is in the past I have tried to compile it with the aim of adding it to moonbase. Well there is a show stopper. Color me a newb but I cannot get past this configure error;

**Your distribution (lunar linux) is not yet supported!  (patches welcome)**

Being the bright newb that I am the most obvious thing to try is this; --with-distro=none or some variant; nope. OK, what about --without-distro; nope. Now this confuses me since Mr. William claims it can be turned off; [NetworkManager and ConnMan](http://blogs.gnome.org/dcbw/2009/06/25/networkmanager-and-connman/). Perhaps I am being a dunderhead and not seeing the obvious. Let's suppose that is not the case and a distro name must be supplied. Let me say it is not like our networking scripts change that often (ahem) but would any dev want to fiddle with sending them patches?

An alternative to maintaining a patch set specifically for them to incorporate we could _, shudder_, make our  /etc directory structure to fit one of the distros they do support. Some of you should know my position about such things as I have responded to some in IRC. On occasion we get a visitor and in short thrift begins to comment/complain why Lunar does not do $SOMETHING like $DISTRO. I need not comment further.

Now on to connman. Compared to NetworkManager it is less distro dependent and we do not need deal with restructuring /etc to fit some $DISTRO. AFAICT it does support more different types of network connections than wicd.

It seems to me we only have two real choices; rewrite our scripts or connman. On the former it could well be that we would need to restructure /etc in some fashion. That would tend to reduce (though not a lot) the negative I see with NetworkManager.
