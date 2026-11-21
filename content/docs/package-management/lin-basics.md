---
title: "Lin Basics"
description: "The everyday commands for installing, finding, updating and removing software on Lunar"
category: "package-management"
order: 1
lastUpdated: 2026-11-21
tags: [package-management, lin, lvu, lrm, lunar, commands]
---

Software on Lunar comes as **modules**: build recipes in the moonbase that are compiled from source on
your machine. Four commands cover everyday use:

| Command | What it does |
| --- | --- |
| `lin` | Downloads, compiles and installs modules |
| `lrm` | Removes installed modules |
| `lvu` | Shows information: searching, descriptions, what's installed, logs, dependencies |
| `lunar` | Updates the system, holds modules, optimization settings; run it alone for a menu |

## Find software

Search the module descriptions for a phrase:

```bash
lvu search "web browser"
```

Search module names for a keyword (shows each match with its section):

```bash
lvu apropos firefox
```

Read about a module before installing it:

```bash
lvu what firefox      # full description
lvu info firefox      # short summary
lvu version firefox   # version in the moonbase
lvu website firefox   # upstream website
```

## Install software

Give `lin` one or more module names:

```bash
lin nano
lin nano hdparm sudo
```

`lin` downloads the sources, asks about optional dependencies, resolves and builds dependencies, then
compiles and installs each module.

Useful options:

```bash
lin -r firefox   # reconfigure: choose the optional dependencies again
lin -c nano      # compile again even if a cached build exists
lin -p nano      # only install if it isn't installed already
```

## See what's installed

```bash
lvu installed          # every installed module and its version
lvu installed nano     # the installed version of one module
lvu expired            # installed modules with a newer version in the moonbase
```

## Update the system

```bash
lunar update
```

This fetches the latest moonbase, then rebuilds every installed module that has a newer version.
To rebuild outdated modules without fetching a new moonbase, use `lunar renew`.

## Remove software

```bash
lrm nano
```

Options:

```bash
lrm -k nano            # remove, but keep its configuration and dependencies
lrm -D nano 8.2        # downgrade to a version still in the install cache
```

Some modules, such as `bash` and `gcc`, are protected from removal because the system needs them.

## Hold a module at its current version

A held module is skipped by `lunar update`:

```bash
lunar hold firefox
lunar unhold firefox
lvu held               # list held modules
```

## Dependencies

```bash
lvu tree firefox       # what firefox depends on
lvu depends openssl    # installed modules that depend on openssl
lvu leafs              # installed modules nothing else depends on
```

## Logs

```bash
lvu compile nano       # the compile log
lvu install nano       # the list of installed files
lvu from /usr/bin/nano # which module installed a file
```

## Build optimization

`lin` compiles with your system's optimization settings (CPU type, compiler flags). Change them in
the menu:

```bash
lunar optimize
```

## Next steps

- [Moonbase](/docs/package-management/moonbase): how modules are organized
- Run `lin --help`, `lvu --help`, `lrm --help` or `lunar --help` for every option
