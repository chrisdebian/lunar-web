---
title: "Lin Basics"
description: "Essential commands and concepts for Lunar's package manager"
category: "package-management"
order: 2
lastUpdated: 2025-11-02
tags: [package-management, lin, commands]
---

Learn the essential commands for managing packages with Lunar's `lin` tool.

## What is Lin?

Lin is Lunar Linux's package management tool. It handles:
- Installing packages from source
- Updating packages
- Managing dependencies
- Optimizing builds for your system

## Basic Commands

### Search for Packages

Search for available packages:

```bash
lin search package-name
```

Example:
```bash
lin search firefox
```

### Install Packages

Install a package:

```bash
lin install package-name
```

Example:
```bash
lin install vim
```

### Update System

Update all installed packages:

```bash
lin update
```

### Remove Packages

Remove an installed package:

```bash
lin remove package-name
```

### List Installed Packages

See all installed packages:

```bash
lin list
```

## Package Information

Get detailed information about a package:

```bash
lin info package-name
```

This shows:
- Description
- Version
- Dependencies
- Build options

## Build Optimization

Lin compiles packages optimized for your system.

### Compiler Flags

View current compiler flags:

```bash
lin flags
```

### CPU Optimization

Lin automatically detects and uses optimal CPU flags for your processor.

## Dependencies

Lin automatically handles dependencies:

```bash
lin install package-name
```

This installs the package and all required dependencies.

## Advanced Usage

### Hold Packages

Prevent a package from being updated:

```bash
lin hold package-name
```

### Unhold Packages

Allow updates again:

```bash
lin unhold package-name
```

## Next Steps

- Explore advanced package management techniques
- Learn about managing system services
