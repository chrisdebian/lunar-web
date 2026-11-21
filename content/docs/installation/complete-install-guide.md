---
title: "Complete Installation Guide (1.6.5)"
description: "Comprehensive step-by-step guide for installing Lunar Linux 1.6.5 from ISO"
category: "installation"
tags: ["installation", "iso", "guide", "1.6.5"]
lastUpdated: 2025-11-02
order: 3
---

Lunar Linux is a revolutionary Linux distribution that is built entirely by compiling source code using your own custom optimizations. This guide will walk you through the complete installation process.

Essentially, it installs a complete bootstrap development system on your machine, and then you tell the Lunar package manager what tools you want, and it builds the entire system by downloading current source code and locally compiling an optimized system tailored toward your specific needs. The result is a leaner, meaner, refreshingly uncluttered, and strikingly faster operating system than most Linux distributions.

This installation guide assumes that you have some experience with Linux or another Unix variant, and have a general idea of what you are doing. If you are unfamiliar with such things as partitions, or have never used Linux before, Lunar may not be the best introduction for you into the world of open source.

## Warning: Here be Dragons!

The 1.6.5 ISO is now almost two years old, and there have been major updates of the kernel, gcc, glibc, and a host of other key modules. The development team is currently in the middle of the switch from sysvinit to systemd in preparation for the next ISO image.

If you can't wait for the new ISO and really do want to install 1.6.5, please connect to `#lunar` on [Libera.Chat](https://libera.chat/) and ask for the latest guide to installation. Be warned: you may break your box!

**Note:** Please read the "Jump to 3.X kernel + Tips" section in the Known Problems chapter. It will help you make Lunar Linux recognize the latest hardware.

## About This Installation Manual

Although this manual is not intended to be a complete overview of every situation you may be confronted with, given the wide diversity of hardware available these days, it is intended to be an introduction to the world of Lunar Linux. You will see examples that are not tailored towards your specific server or workstation setup.

The installer allows you to do pretty much everything you want to do with your system. There are really (almost) no limits.

## Getting the ISO

The primary site for retrieving the ISO is [lunar-linux.org](https://www.lunar-linux.org/lunar/daily/).

As of this writing, the current version of the Lunar ISO is version 1.8.0, codename Mare Nubium (2025-2026). (Check the main site for the actual latest version!)

Locate and retrieve the file:
- `lunar-1.6.5-rc1-i686.iso.bz2` for 32-bit systems
- `lunar-1.6.5-rc1-x86_64.iso.bz2` for 64-bit systems

After downloading, you will need to unpack the ISO using bzip2:
- **Windows users:** Use WinZip, IZarc, WinRAR, PowerArchiver, or 7-Zip
- **Mac users:** The file should unzip automatically
- **Linux users:** Use `bunzip2` command

Then burn the ISO to a CD-ROM using your favorite burning program.

**Note:** The 1.6.5 ISO uses udev for device management. The devfs system and the "old-school" method of manually installing devices are no longer supported.

**Important:** We are assuming you are installing Lunar as your primary OS. Make sure you have a backup of any important data that you need to retain. The Lunar Linux Project and its developers are not responsible in any way for any loss of data on your system!

Lunar can also be installed without using a CD. See our FAQ for instructions on alternative installation methods.

## Booting the ISO

Upon booting the ISO, the first thing you will see are options for booting the ISO kernel, or for performing RAM tests (Note: MemTest is not available on x86_64). There is a safe mode which will disable DMA, MTRR, RAID, LVM, USB keyboards, NTFS, HPFS, Advanced Partitions, and Firewire.

Most users will be fine pressing Enter at the boot prompt and loading the default kernel.

### USB Keyboard Support

To boot the ISO with support for your USB keyboard:

```bash
linux uhci-hcd ehci-hcd
```

### Initial Boot Process

After loading the kernel, the first screen presents you with a few options:

- Load additional modules if needed
- Shell out (but if using for rescue purposes, continue booting and shell out in the next section)
- Continue booting (most common option)

The 1.6.5 ISO tries to autodetect some hardware (mostly SCSI drivers and network interfaces) during this stage. This will help you establish a network connection if desired. The programs `dhcpcd` and `ftp` are already available at this stage.

## Virtual Consoles

Once the ISO has booted into the installer, you can immediately shell out or switch to one of the other virtual consoles. These will have ready-to-go root shells and are available throughout the installer sequence.

With these you can:
- Start rescue actions
- Setup networking
- Double check the install progress
- Make manual adjustments

## Language and Keyboard Settings

After reading the introduction, you will be presented with options for choosing:

### Editor Selection

You will need to choose an editor for later configuration tasks:
- **nano** - Best choice if you've never used a Linux text editor
- **vi** - Traditional Unix editor
- **e3** or **e3/emacs** - Emacs-style editor
- **joe** - User-friendly editor
- **zile** - Small Emacs clone

If you skip the Native Language Support option, the system will install nano by default.

### Console Font

Less important for most people, but may help display some non-English characters.

### Language Variable

Set the system-default language variable for proper internationalization support.

### Keymap

The keymap table allows you to use AZERTY, Dvorak, and many other keyboard layouts. This is especially required for non-English keyboards which provide many accented characters.

**Warning:** The keymap entry appears to default to ANSI-Dvorak, so make sure you select what you want.

All these settings are unset by default, so make sure you configure them now. When finished, press Cancel to return to the main setup menu.

## Creating or Editing Partitions

The next step is to set up partitions on your hard drive. Upon selecting the "Partition Drive" option, you will be shown a list of all the discs the kernel has detected.

### Partitioning Tools

You are given the option of using one of three partitioning programs:

#### cfdisk
A menu-driven partitioner, very easy to use. If you are unfamiliar with various partitioning programs, this is the best option for you.

#### fdisk
Text-based partitioner that requires a little more know-how. More experienced users will probably use this program. New users should not be daunted, as it offers help at every step.

#### parted
Text-based partitioner good for advanced users. Excellent for resizing current partitions on your hard disk. **Warning:** Resizing partitions is an excellent way to damage your entire disc.

### Mount Style Configuration

Under the `<Settings>` option on the main menu, there is an option to configure the fstab mount style as DEV, LABEL, or UUID:
- **DEV** - Traditional Linux method, but can give problems if a kernel update causes the disk to be renamed
- **UUID** - Default, uses a unique marker on the partition to avoid naming problems

### Example Partition Layout

For our example, we have a 40GB IDE drive with six partitions:

| Partition | Mount Point | Size |
|-----------|-------------|------|
| 1 | /boot | 100MB |
| 2 | / | 4GB |
| 3 | swap | 1GB |
| 5 | /usr | 10GB |
| 6 | /var | 10GB |
| 7 | /home | 15GB |

**Note:** This is just an example. See the FAQ for real-world partitioning advice.

### Extended Partitions

Notice there is no fourth partition in the list. To have more than four partitions on a single drive, the fourth partition is made into an extended or logical partition in which the fifth, sixth, and seventh (etc.) partitions reside.

- **Using fdisk:** Make the fourth partition an extended/logical partition (35GB), then create partitions 5, 6, and 7 within it
- **Using cfdisk:** Just create six partitions, ensuring the first three are primary type and the last three are logical

Write down exactly what partitions you create - it can get confusing!

### Important Restrictions

You **cannot** mount these directories on separate partitions:
- `/etc`
- `/bin`
- `/sbin`
- `/dev`
- `/lib`
- `/proc`

These directories need to be contained within the root (`/`) directory. The installation program should block you from doing this.

### Swap Space

Lunar offers two choices for swap:
1. **Swap partition** (recommended) - Better performance
2. **Swapfile** - Can be setup after mounting other partitions

We recommend setting up a swap partition for better performance.

### /tmp Partition

You might also want to install a `/tmp` partition. By default, Lunar creates a tmpfs filesystem mounted on `/tmp` (tmpfs resides in volatile memory, minimizing filesystem fragmentation).

- **Lots of memory:** tmpfs on /tmp is a good choice
- **Tight memory:** Create a dedicated /tmp partition

## Selecting Partitions and Filesystems

After creating your partitions, you need to select them and assign file systems. Select "Select Filesystems" and verify that you are done creating partitions.

Partitions can be selected in random order. First select the partition, then assign a filesystem and mountpoint to it. The installer adds this to the job queue. Formatting and mounting takes place later, so you can edit your selection.

### Supported Filesystems

#### ext4 (Fourth Extended File System)
Version 4 of the Extended File System with advanced features and journaling.

#### ext3 (Third Extended File System)
Version 3 of the Extended File System, essentially the journaled version of ext2. Available with all kernels on the ISO.

#### ext2 (Second Extended File System)
Version 2 of the Extended File System, designed for Linux as a replacement for the Minix Filesystem. Not a journaled filesystem, requiring disc recovery operations after a system crash. Available with all kernels on the ISO.

#### reiserfs (Reiser Filesystem)
Journaled filesystem created by Hans Reiser, excellent for use with extremely small files. Available with all kernels on the ISO.

#### xfs
Created by SGI for IRIX and later ported to Linux under the GPL. A journaled filesystem that SGI claims is better than any other at handling extremely large files and sparse files. Only available with the lunar or grsec patched kernels.

#### jfs (Journaled File System)
Created by IBM for AIX and later ported to Linux by IBM under the GPL. A journaled filesystem that is very good at handling high throughput issues. Available with all kernels on the ISO.

#### swap
Virtual memory or paging filesystem for swap partitions only!

### Initialization Process

After selecting the filesystem type, you will be prompted through a series of steps to initialize the partition. The prompts are redundant to ensure you will not inadvertently erase crucial data.

If you have more than four partitions, don't select any file systems on the fourth partition, as it is the extended partition that houses the other partitions. (The installer tries to detect this and skip the extended partition.)

**Important:** During this step, no modifications are made to your filesystem yet!

### Swapfile Setup

The next option after selecting your filesystems is to set up a swapfile if you desire. If you've already set up a swap partition, you can skip this step. Otherwise, you can set up your swap file here by specifying the desired size.

Running without swap completely is also possible.

## Installing Lunar

Next, we format your partitions, mount them in the right place, create swap, and transfer the entire Lunar system to the partitions you created. This happens all in one single step.

Select "Install Lunar" and the system will proceed to transfer all necessary files. The installer displays progress as packages are transferred, giving you an idea of how long it will take. On normal machines, this should take about 5 minutes.

At the end of this step, the installer sets various system parameters like language, timezone, and vital package configuration files.

## Setting Up Compiler Optimizations

Compiler optimizations are crucial - what you choose will make your system fly! However, it is important that you do not overdo optimization settings, as certain selections can break code while compiling.

### Choosing Your Compiler

The first step is to choose your preferred compiler. There is only one version on the 1.6.5 ISO: **GCC 4.4**

Once the main system installation is complete, it is possible to install GCC 3.x or even the deprecated GCC 2.x. If you don't intend to install those, go to the GCC_4_4 submenu now and set GCC 4.4 as the default compiler.

### GCC 4.4 Options

#### safe
Allows you to turn off optimization safety. Leave this alone unless you really know what you are doing. Turning this off results in many more options appearing.

#### bopt (Base Optimization)
Choose the base compile-time optimization based on your needs:

- **-O2** - Wisest choice for most folks (recommended)
- **-O3** - More aggressive optimization, not for everyone
- **-Os** - Optimize for size, good if short on disk space
- **-O1** - Conservative setting for older/slower systems

For our example, we choose -O2.

#### cpu
Set your processor type. This may seem unimportant, but GCC 4.x has ways of optimizing code for certain processors. Check `/proc/cpuinfo` to see what your processor supports.

#### cc_opt
Set some limited C/C++ compiler settings. Very few people, if any, need to turn off the `-pipe` option.

### Unsafe Optimizations

These are available when safety is turned off:

- **xtra** - CPU extensions
- **spd** - Specialized optimizations
- **fpm** - Floating point optimizations
- **stack** - Stack optimizations

## Additional Compiler Toolchain Optimizations

**You can safely SKIP this entire step!**

### GNU_LD Menu

Shows linker options, where you'll find that "-s Strip" has already been checked off. Very few people will want to uncheck this option.

### GNU_MAKE Menu

Allows you to set the number of concurrent makes. You'll want to enter the number of CPUs your machine has. Unless you have a machine with more than one processor, leave this field blank.

### Checking Processor Capabilities

When you have your Lunar system up and running, you can always change and tweak GCC settings by typing `lunar` at the commandline and going to "Optimization Settings".

To see what your processor supports, shell out on the ISO and type:

```bash
cat /proc/cpuinfo
```

The system will show you all the optimizations that the processor reports it can handle.

## Configuring Your Bootloader

### Configuring LILO

If you chose to use LILO and said yes to automatically configuring and running it, most of the work is done for you. If you chose not to hand edit `lilo.conf`, be warned that the default configuration has the system set up to be password protected on boot.

You can change this by selecting "Reconfigure LILO" from the menu.

#### Removing Password Protection

To turn off password protection, comment out (with `#`) or delete two lines in your `lilo.conf` file:

1. `password=lunar` - Found in the top section
2. `restricted` - Found right below the name of your kernel in the second section

#### Boot Location

The other item of note is whether you want LILO to reside in your MBR (Master Boot Record) or on the first sector of your `/boot` partition.

The line in your `lilo.conf` file:

```bash
boot=/dev/sda1
```

- **First sector of /boot partition:** Leave as is
- **MBR (recommended):** Change to `boot=/dev/sda`

These examples are pertinent to our setup. Your actual `lilo.conf` file may be different.

### Configuring GRUB

If you chose GRUB as your bootloader, you will need to set up the configuration file entirely on your own. An example:

```bash
default 0
timeout 30
color white/blue white/black
title linux-2.4.25
root (hd0,0)
kernel /vmlinubz-2.4.25-r5.0.0 root=/dev/sda2 devfs=nomount
```

As mentioned earlier in the partitioning section, you would want to mark your `/boot` partition as active. With GRUB it is imperative that you mark your `/boot` partition as active, otherwise GRUB will not work when you reboot to your new system.

**NOTE:** The option to install GRUB is not available on the 1.6.5-rc1-x86_64 ISO because GRUB is not yet fully stable on 64-bit systems. If you really know what you are doing, the source tarball is saved to disk, so you can configure it manually once the main installation is complete.

## Installing Kernels

### Installing a Precompiled Kernel

The ISO comes with a selection of precompiled kernels and modules that should work for most people. If you have problems getting your kernel to compile, install, or getting the right drivers, or just want a quick start, we suggest using this option.

You can later compile as many kernels as you want. The first `lunar update` after the main installation might ask whether you want to update the kernel too.

#### Available Precompiled Kernels

- **2.6.34.1** - Normal kernel (SMP, 4GB memory max) - **RECOMMENDED**
- **2.6.34.1-safe** - Very safe non-optimized minimal kernel (no ACPI, DMA, SMP, 1GB)
- **2.6.34.1-server** - Server optimized (SELINUX, SMP, 64GB, no preempt)

### Building Your Customized Linux Kernel

We have now come to the most important part of the installation: the configuration of the kernel. The kernel is the heart of Linux, and without it, nothing would work.

Configuration is actually a rather simple process. All you need to remember is to not panic - Lunar is going to do most of the work for you.

#### Important Pointers

**Help is a click away!** The people working on creating and maintaining the Linux kernel have help placed throughout the entire configuration process. If you're not sure what something does, just look at the help file. Many help files end with "If you're not sure, it is safe to say N here", letting you know it is safe to leave that particular item out of the kernel.

**You can use the ISO kernel!** The configuration used to make the kernel for the ISO is the same configuration you'll see when you start your kernel customization. If you leave the configuration the way it is, the only thing you truly have to worry about is your network and sound (if you want it).

There are two additional default configurations available:
- `config.safe`
- `config.server`

These can be found in `/etc/lunar/local`.

**Never build filesystems or core components as modules!** Make sure that whatever filesystems you decided to use for your partitions earlier are built into the kernel, and are not separate modules. Likewise, make sure that IDE and SCSI drivers are not modules, as this will make your machine unbootable. (This rule doesn't apply to SCSI low-level drivers though; they can be modules.)

Modules are kernel drivers that can be manually activated and deactivated after the system has been booted, but not during boot time. The kernel from the ISO already has all the filesystems available during installation built into the kernel.

#### Configuration Process

You will be shown two screens of information before you actually begin kernel configuration, letting you know what you need built into the kernel for Lunar to run properly, and what options you have for boot loaders.

**Kernel Selection:**

On the 1.6.5-rc1-x86_64 ISO, there is only one kernel available:
- **linux-2.6** - Latest 2.6 kernel with minor patchlevel patches (2.6.x.Y)

For our example, we are using linux-2.6.

**Configuration Methods:**

Choose which type of configuration method you would like to use:

- **config** - The original way to configure the kernel. Completely text-based, assumes you know what everything is. Unless you've been using Linux since its inception, you probably don't want this.
- **menuconfig** - A menu-driven version of kernel configuration. This is the easiest and by far the most popular way of configuring your kernel.
- **xconfig** - If you have an X server running, you can use this option to configure your kernel using a GUI interface. You won't be able to use this on the ISO, but once your system is up and running with X, you can use this option. If you choose this option while installing from the ISO, the system will fall back to menuconfig.

For our example, we use menuconfig.

#### Loading Alternate Configurations

Once Lunar is finished applying the patches for the kernel (which can take a minute or two), you'll be brought to the configuration screen.

The configuration used to build the kernel for the ISO is the default. However, there are two alternate kernel configurations available:
- `/etc/lunar/local/.config.safe`
- `/etc/lunar/local/.config.server`

To load an alternate configuration:
1. Scroll to the bottom of the kernel menuconfig main page
2. Find "Load an Alternate Configuration File"
3. Give the absolute path to the alternate configuration file

Note: Configuration files are hidden files preceded with a `.`

#### Completing Configuration

Once you have completed configuring your kernel, you'll get one more prompt from the installer asking if you want to go back to the configuration in case you exited by mistake or forgot something. If everything is good to go, say no here and sit back for a few minutes while your kernel compiles.

## Setting Up Networking

The final step is to set up networking. When you select "Set Up Networking", you'll be prompted with a series of questions:

- What kind of card you have (only needed if you built your networking device as a module)
- If you need to set up wireless or not
- Whether you'll need to use DHCP or not

The questions are straightforward. You should be familiar enough with your network to set this up.

### Important Notes

- **If using DHCP:** You don't need to set up the default gateway or DNS because DHCP will take care of them for you
- **If using wireless with wpa_supplicant:** You might want to run `wpa_passphrase` to set up a simple `/etc/wpa_supplicant.conf` rather than try to edit the example file

## Other Settings

The installer will now prompt you for some more settings:
- Set a root password
- Generate SSH host keys to identify your box uniquely
- Administrate services on the newly installed machine

## Reboot!

Once you have completed setting up your networking, you are finished installing Lunar Linux! Congratulations!

Select the "Done" option and remove the CD from the drive when it ejects. Your Lunar system is now ready to go!

## Upgrade Moonbase

After the initial installation and reboot, please follow the instructions given in `man lfirsttime` to bring your system up-to-date.

Congratulations! You now have a minimal system as a foundation on which to build.

## Known Problems

### You need to run 'lin linux-2.6' explicitly before running 'lunar update'

**WARNING:** The pre-compiled 2.6.35.3 kernel on the ISO is now out-of-date compared to the linux-2.6 module in the moonbase, but you will need to build it explicitly using `lin linux-2.6` because it won't be rebuilt as part of the first lunar update.

If you didn't recompile the kernel as part of the ISO installation, or if you experience problems with ALSA or NVIDIA, you should run `lin linux-2.6` to rebuild the kernel explicitly.

After you have built the kernel once, `lunar update` should then detect and install newer versions of the kernel as they become available in the moonbase.

### configure: error: C compiler cannot create executables

**WARNING:** The ISO installs gcc-4.4 on your system, but gcc-4.6 will be installed as part of the `man lfirsttime` and `lunar update` process.

You will then need to:
1. Run `lunar`
2. Select the Options / Optimize Architecture menu
3. Set the gcc-4.5 options

Failure to do so may result in "configure: error: C compiler cannot create executables" messages when building modules later.

### Jump to 3.X kernel + Tips

These are some problems you'll encounter with the outdated 1.6.5 installation ISO:

**Network Hardware Recognition:**
- Lunar Linux doesn't recognize the most recent network hardware correctly
- It still recognizes a few USB tethering devices from smartphones (e.g., HTC Evo 4G+)
- The tricky part: `lin` (package installer) tries to connect via dial-up modem if it doesn't find any ethX

**Kernel 3.X Issues:**
- If you try to use Linux kernel 3.X, udev would not start
- The initscript treats it as a 2.4 kernel due to an initscript design pitfall from when there were no 3.X kernels

**Solutions:**

These issues are all resolved with current updates. The following modules should be updated:

- **linux** - Linux kernel, to support the most recent hardware (see [Moonbase](/docs/package-management/moonbase) for details)
- **lunar / theedge** - Lunar Linux utilities (including package managers), for `lin` to work in any network condition
- **lunar-init** - The initscript of Lunar Linux to correctly recognize and work with 3.X kernels
- **module-init-tools** - Though deprecated, works with 3.X kernels anyway. Or replace it with kmod

Alternatively, you can recompile the Linux kernel with built-in drivers so that you don't have to be concerned with kernel modules.

## Where to Go from Here

To install a desktop environment, check out the [Desktop Environments](/docs/installation/desktop-environments) guide.

Have Phun!!

---

*Copyleft 2004-2010 [The Lunar Penguin Team](http://lunar-linux.org/)*

*Lunar Installation Manual by Drew Swayze (drew AT lunar-linux DOT org)*

*Edits and Nitpicking by Suzanne Burns (sburns AT lunar-linux DOT org)*

*Initial update for the 1.6.5 ISO by Duncan Gibson (engelsman AT lunar-linux DOT org)*

*Update for "Jump to 3.X kernel + Tips" by Robert Teminian (individual contributor)*
