---
title: "cache database for moonbase"
description: "An experiment that syncs moonbase into an SQLite database to speed up lunar's tools."
date: 2011-02-06
author: "wdp"
---

We've had a few talks regarding the use of a database to speed up some processing/end-user-tools. Let's say `lvu search`, the module searching when issuing `lunar renew` (which should be `module_expired()` and `run_details()`). Also things like `lvu depends`.

However. Lunar's package management is as good as it is, because it's easy. All you need to know is Bash (and not even that correctly). The moonbase (the heart of our package management) resides in `/var/lib/lunar/moonbase` and contains categories, modules and bash scripts like `DETAILS`, `DEPENDS`, `PRE_INSTALL` just to name a few. Placing all this into a database would make it more difficult to play around with the package management and thats why some people would dislike a database and others would prefer one. And as a result we only talk about it, without doing anything.

A year ago (April 2010) I started to work on a cached variant of moonbase, it works by syncing moonbase into a sqlite3 database and optionally using this database instead of the slow file-operations. Yesterday (February 2011) Ratler and I were improving the script I made a lot.

The original script (version 0.1) took 15 minutes to do the initial sync and every other sync of moonbase with the db. Currently we’re at version 0.3 and the script takes around 18 seconds per sync on our test-environment. So this is a somewhat big improvement. However – The question which remains is: Is using sqlite really faster than using lunar's tools (which use file-operations)? Let’s see:

sqlite

```
time sqlite3 cache.db " select t1.id, t1.name, t2.category from lunar_modules t1 join lunar_modules_categories t2 on t1.category_id = t2.id where t2.category = 'shells';"

real    0m0.010s
```

lunar’s tools

```
time lvu section shells

real    0m0.093s
```

Looks like sqlite is 9 times faster than the lunar-tools. That’s not bad at all. However, these are just some pseudo numbers, we’re working on a patch so that everyone can test that. There’s a todo list with this db:

1. Implement dependency tracking
2. Write functions to do usual tasks (`lvu depends`, `lvu where`, `lvu search`, `lvu website`, `lvu depends`, `get_all_modules`, `lvu expired`, etc)
3. Write an entry in lunar features where users can enable this cached db optionally
4. Enhance the lunar tools (`lvu`, `lin`, `lunar`, etc) to use this database and the file-operations as fallback

The good thing about this solution is: It’s just a starting point. We can enhance this as much as we want. While just using it to improve some simple things now, we can use it also for complex things in the future. Also: Any changes made is non intrusive to the old behavior, they would co-exist and sqlite would be optional if implemented.
