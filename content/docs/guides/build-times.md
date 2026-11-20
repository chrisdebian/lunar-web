---
title: "Understanding Build Times"
description: "Guide to estimating compilation times for Lunar Linux packages"
category: "guides"
tags: ["build", "compilation", "performance", "timing"]
order: 2
---

One of the most common questions from new Lunar users is: "How long does it take to compile X?" Since Lunar Linux is a source-based distribution, understanding build times helps you plan installations and system updates.

## The Short Answer

Build times vary dramatically based on:
- Your hardware (CPU, RAM, disk speed)
- The package being compiled
- System load during compilation
- Compiler optimizations selected

A modern system might compile a complete desktop environment in 2-3 hours, while an older system could take 20+ hours for the same task.

## Factors Affecting Build Time

### CPU Speed

Double the CPU frequency, and you roughly double compilation speed. A 3 GHz processor compiles approximately twice as fast as a 1.5 GHz processor.

**CPU cores matter even more:** A quad-core system with parallel builds enabled can be 3-4x faster than a single-core system.

### Memory Size

Compilation, especially for C++ applications, requires substantial memory. Memory impact on build speed:

- **128 MB → 512 MB:** ~225% faster (2.25x)
- **512 MB → 1 GB:** ~50% faster (1.5x)
- **1 GB → 2 GB:** ~25% faster (1.25x)

**Recommendation:** 2 GB minimum for comfortable compilation; 4 GB+ for large packages like browsers and desktop environments.

### Disk Speed

I/O operations significantly impact build times, especially for large packages:

- **SATA SSD:** Fastest (500+ MB/s)
- **SATA HDD:** Good (100-150 MB/s)
- **ATA-133:** Moderate (50-100 MB/s)
- **ATA-33:** Slow (20-30 MB/s)

Modern NVMe SSDs can reduce build times by 20-30% compared to traditional HDDs.

### System Idle Time

Every second your system spends on other tasks reduces compilation throughput. For fastest builds:

- Compile on a dedicated system or during low-usage periods
- Minimize interactive applications during compilation
- Disable unnecessary background services

### Parallel Make Jobs

**Critical for multi-core systems:** Enable parallel builds in Lunar:

```bash
lunar
# Navigate to: Options → Optimize Architecture
# Set "Number of parallel makes" to your CPU core count
```

**Example impact on quad-core system:**
- 1 parallel job: 100% (baseline)
- 2 parallel jobs: ~170% faster
- 4 parallel jobs: ~250-300% faster

### Distributed Compilation (distcc)

If you have multiple computers, `distcc` can distribute compilation across machines, dramatically reducing build times.

## Benchmark Data

The following benchmarks are from a Pentium 4 system (circa 2005) running at 2.9 GHz with 1 GB RAM (5864 bogomips):

| Module  | Source Size | Installed Size | Compile Time |
|---------|------------|----------------|--------------|
| gcc     | 61,540 KB  | 97,188 KB      | 80m 35s      |
| glibc   | 15,340 KB  | 138,268 KB     | 32m 47s      |
| gtk+-2  | 18,672 KB  | 64,884 KB      | 15m 56s      |
| perl    | 14,792 KB  | 56,844 KB      | 9m 43s       |

**Note:** These are historical reference points. Modern equivalents compile faster on current hardware but may have grown in size and complexity.

## Estimating Compilation Time

### Rule of Thumb

Based on analysis of 400+ packages, there's a loose correlation between source size and compile time:

**Average compilation speed:** ~20-25 KB/s of compressed source code

**Formula:**
```
Estimated Time (seconds) = Source Size (KB) / 20
```

**Example:**
- 10 MB source tarball = 10,000 KB / 20 = 500 seconds = ~8 minutes
- 50 MB source tarball = 50,000 KB / 20 = 2,500 seconds = ~42 minutes

**Important:** This is a very rough estimate. Actual times can vary by 300% or more depending on the package.

### Module Complexity Index

Some packages compile faster or slower than their size suggests. Here are "complexity indices" for common packages (relative to average 1.0):

- **gcc:** 0.51 (slower than average - bootstrap complexity)
- **glibc:** 0.31 (slower than average - extensive testing)
- **gtk+-2:** 0.80 (close to average)
- **perl:** 1.02 (average)

Multiply your estimate by the complexity index for better accuracy.

### Large Package Examples

Modern large packages and estimated times (4-core 3.0 GHz system, 8GB RAM):

- **Firefox/Chromium:** 30-60 minutes
- **LibreOffice:** 1-2 hours
- **LLVM/Clang:** 45-90 minutes
- **Qt5:** 1-2 hours
- **KDE Plasma:** 2-4 hours (full desktop)
- **GNOME:** 2-4 hours (full desktop)

## Real-World Installation Times

Time to install a minimal desktop system from Lunar 1.6.5 ISO:

### Modern System (2009)
**Hardware:**
- CPU: 4 cores × 4988 bogomips
- RAM: 6 GB
- Disk: 1681 / 129 MB/s

**Installation breakdown:**
- ISO install: 11 minutes
- `lin gcc glibc gcc bash coreutils tar wget`: 1 hour 1 minute
- `lin linux-2.6` (kernel): 12 minutes
- `lunar update`: 20 minutes
- `lin XOrg7`: 23 minutes
- `lin xfce4`: 14 minutes
- **Total:** 2 hours 21 minutes

### Legacy System (2000)
**Hardware:**
- CPU: 1 core × 1600 bogomips
- RAM: 512 MB
- Disk: 179 / 17 MB/s

**Installation breakdown:**
- ISO install: 18 minutes
- Core system rebuild: 11 hours 26 minutes
- Kernel compilation: 3 hours 37 minutes
- System update: 2 hours 44 minutes
- X11 installation: 3 hours 12 minutes
- Desktop environment: 2 hours 15 minutes
- **Total:** 23 hours 32 minutes

**Conclusion:** Avoid installing Lunar on very old hardware unless you have patience or can use `distcc`.

## Optimizing Build Times

### Enable Parallel Builds

```bash
lunar
# Options → Optimize Architecture → Number of parallel makes
# Set to your CPU core count (check with: nproc)
```

### Use Compiler Cache (ccache)

```bash
lin ccache
lunar set CCACHE_DIR=/var/cache/ccache
```

Ccache can reduce rebuild times by 50-90% for previously compiled code.

### Optimize Compilation Flags

Balance speed vs. build time:
- `-O2`: Best balance (recommended)
- `-O3`: Slightly faster binaries, 10-20% longer compile
- `-Os`: Smaller binaries, faster compile

### Pre-download Sources

Before starting a large build session:

```bash
# Download all sources first
lin --download-only package-name

# Or for complete dependency tree
lin --download-only --deps package-name
```

This prevents build interruptions from slow downloads.

## Tips for Patience

### Work Estimation

Before a major system update:

```bash
# See what will be rebuilt
lunar update --dry-run

# Check source sizes
ls -lh /var/spool/lunar/
```

### Background Compilation

Run long compilations in `screen` or `tmux` so you can disconnect:

```bash
screen
lin large-package
# Press Ctrl+A, then D to detach
```

### Overnight Builds

Schedule large compilations for overnight:

```bash
# In a screen session
lin kde-full && lin libreoffice && shutdown -h now
```

## Monitoring Build Progress

### Watch Compilation

```bash
# In another terminal
tail -f /var/log/lunar/compile/module-name*.log
```

### Check System Load

```bash
# Monitor CPU and memory
htop

# Check I/O
iotop
```

### Estimated Time Remaining

Unfortunately, Lunar doesn't provide real-time build time estimates. Use the formulas above for rough predictions.

## See Also

- [Package Management Basics](/docs/package-management/lin-basics)
- [FAQ: Optimizations](/docs/faq#optimizations)
- [Moonbase Overview](/docs/package-management/moonbase)
