---
title: "Understanding Build Times"
description: "How long Lunar takes to compile things, measured on our build server, and how to make it faster"
category: "guides"
tags: ["build", "compilation", "performance", "timing"]
order: 2
---

One of the most common questions from new Lunar users is: "How long does it take to compile X?" Since Lunar Linux is a source-based distribution, understanding build times helps you plan installations and system updates.

## Measured on our build server

Every module update sent to moonbase is compiled by our CI server before it's merged. These times come from real CI runs in November 2026:

| Module                     | What it is         | Compile time |
|----------------------------|--------------------|--------------|
| flex 2.6.15                | Small C tool       | 18 seconds   |
| pkgconf 3.0.11             | Small C tool       | 20 seconds   |
| atuin 18.25.1              | Rust program       | 6 min 38 s   |
| llvm, clang and lld 23.1.5 | Compiler toolchain | 27 min 23 s  |
| firefox 160.0              | Web browser        | 32 min 39 s  |

**The machine:** a virtual machine with 8 cores of an AMD Ryzen 9 7940HX (up to 4.8 GHz), 12 GB of memory for the build, an NVMe SSD, and 8 parallel make jobs.

Each time covers one module only, not the dependencies it pulled in. Installing Firefox from scratch built 23 other modules first (nss, pulseaudio, libvpx and friends), which added about six and a half minutes. The toolchain run built clang twice, so the toolchain alone is a bit faster than shown. Small tools finish in seconds, which is why most of a `lunar update` goes by quickly; a few big programs take nearly all the time.

## What makes a build faster

- **Cores, used in parallel.** Most modules split their build across every core you let them use (see [parallel make jobs](#use-every-core) below). This is the biggest single factor.
- **Memory.** C++ programs such as Firefox and LLVM need a lot of it, especially with many parallel jobs. When memory runs out, the build slows to a crawl or fails.
- **The disk.** Big builds unpack and write gigabytes of files, so a fast SSD helps.
- **Idle time.** Every second the machine spends on something else is a second it isn't compiling.
- **The module itself.** Two programs with the same amount of source code can take very different times to build. gcc, for example, builds itself several times over to check that it works.

## How long did it take on my machine?

Lunar keeps a log of every build, and the log starts and ends with a timestamp:

```bash
lvu compile nano
```

The first line reads `++ Mark Compile start` and the last `++ Mark Compile stop`, each with the date and time. The difference is how long the module took on your machine.

## Saving time

### Use every core

Open the `lunar` menu, go to **Optimize Architecture**, then **GNU make**, and enter the number of parallel make jobs. Your core count is a good start; `nproc` prints it.

### Cache compiler results

```bash
lin ccache
```

Once ccache is installed, Lunar uses it automatically. Rebuilding a module you've built before (after changing an option, say) reuses whatever hasn't changed. You can turn it off in the `lunar` menu under **Optimize Architecture**, **Compiler Cache**.

### Answer the questions and download first

```bash
lin -g firefox
```

`-g` (or `--download`) asks every configuration question, works out the dependencies and downloads all the sources, without compiling anything. Run the real `lin firefox` afterwards and it can work unattended.

### See what an update will rebuild

```bash
lvu expired
```

This lists every installed module with a newer version in moonbase: everything `lunar update` would rebuild.

### Run long builds in screen or tmux

Big builds take a while. Start them inside `screen` or `tmux` so they keep going if your terminal or SSH connection closes:

```bash
tmux
lin firefox
# Press Ctrl+B, then D to detach; tmux attach brings it back
```

## History: the 2005 numbers

The first version of this guide was the "How long" page on the old Lunar wiki, last edited in September 2010. Its numbers are kept here as they were, for perspective. ([Archived copy](https://web.archive.org/web/20101225105918/http://wiki.lunar-linux.org:80/index.php/How_long))

### A Pentium 4 from 2005

A Pentium 4 at 2.9 GHz with 1 GB of memory, rated at 5864 bogomips, "a fairly normal system back in 2005":

| Module | Source size | Installed size | Compile time |
|--------|-------------|----------------|--------------|
| gcc    | 61,540 KB   | 97,188 KB      | 80m 35s      |
| glibc  | 15,340 KB   | 138,268 KB     | 32m 47s      |
| gtk+-2 | 18,672 KB   | 64,884 KB      | 15m 56s      |
| perl   | 14,792 KB   | 56,844 KB      | 9m 43s       |

The glibc build included all possible locales, and gcc spends almost half its time in its bootstrap phase.

### Estimating from source size

Across the 400-odd modules installed on that machine, compile time loosely followed the size of the compressed source: about 20 KB of source per second, or 24.8 KB/s on average. The page also gave each module an "index", its own speed divided by the average:

- **gcc:** 0.51
- **glibc:** 0.31
- **gtk+-2:** 0.80
- **perl:** 1.02

Building everything in moonbase, then about 3,600 modules and 15 GB of source, would have taken more than 8 days at that speed.

### From ISO to desktop with Lunar 1.6.5

A "minimal" desktop installed from scratch on two machines: a then-new Acer AX5810 and a 9-year-old Vaio FX401. Times are hours and minutes:

| Step                                        | Acer AX5810                                  | Vaio FX401                                   |
|---------------------------------------------|----------------------------------------------|----------------------------------------------|
| Hardware                                    | 4 cores × 4988 bogomips, 6 GB, 129 MB/s disk | 1 core × 1600 bogomips, 512 MB, 17 MB/s disk |
| Install from the ISO                        | 0:11                                         | 0:18                                         |
| `lin gcc glibc gcc bash coreutils tar wget` | 1:01                                         | 11:26                                        |
| `lin linux-2.6`                             | 0:12                                         | 3:37                                         |
| `lunar update`                              | 0:20                                         | 2:44                                         |
| `lin XOrg7`                                 | 0:23                                         | 3:12                                         |
| `lin xfce4`                                 | 0:14                                         | 2:15                                         |
| **Total**                                   | **2:21**                                     | **23:32**                                    |

The wiki's verdict still holds: "you probably don't want to install Lunar on really old hardware, unless you have a lot of patience, or can use distcc."

## See Also

- [Package Management Basics](/docs/package-management/lin-basics)
- [FAQ: Optimizations](/docs/faq#optimizations)
- [Moonbase Overview](/docs/package-management/moonbase)
