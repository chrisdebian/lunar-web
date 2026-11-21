---
title: "Moonbase Workflow"
description: "One developer's git workflow for moonbase, with a branch for upstream work and one for local patches."
date: 2012-06-03
author: "v4hn"
---

As every developer has his own way of using git and developing lunar modules, I think, it's an appropriate first post to describe my basic workflow.

First of all my systems moonbase is the git-repository, instead of the default one. So `lunar set MOONBASE` prints `MOONBASE=/var/lib/lunar/git-moonbase`

While this allows instant integration of bug fixes instead of waiting for the moonbase to rebuild every half an hour, it also results in foobar from time to time when doing updates and bumping modules in parallel.

Now my git repository contains three major branches:

- **master** obviously
- **v4hn**
- **local**

v4hn lives on top of master and contains changes that are to be applied to master in near future, local again stays on top of v4hn and keeps changes that are for this machine only and not intended to be merged into master ever(e.g. patches in `zlocal/_patches`).

Whenever there are some commits on the mailinglist I run an update-script which does the following:

```
git checkout master && git pull --rebase &&
  git checkout v4hn && git rebase master &&
  git checkout local && git rebase v4hn &&
  lsh create_module_index && lsh create_depends_cache
```

When I make changes that are intended to be pushed, I switch to v4hn and commit them there. The next update makes sure, local still stays on top of v4hn.

After committing all related updates to v4hn and testing them locally (i.e. removing `/var/spool/lunar/<module>*`, running `lin -rc <module>` with all and with none options selected) I finally run update again and afterwards do

```
git checkout master &&
  git merge --ff-only v4hn &&
  git push lunar master
```

If everything went smooth the changes are now online and everyone is happy.
