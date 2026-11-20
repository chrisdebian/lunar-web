---
title: "Advanced Installation Methods"
description: "Alternative and advanced installation techniques for Lunar Linux"
category: "installation"
tags: ["installation", "advanced"]
order: 20
---

This section covers alternative installation methods and advanced configurations for Lunar Linux. These techniques are useful when standard installation methods won't work or when you need special configurations.

## When to Use Advanced Methods

Consider these advanced installation approaches when:

- You don't have a CD/DVD drive available
- You're installing on servers without physical access
- You need network-less installation
- You're setting up RAID configurations
- You want to customize device management
- Standard installation methods have failed

## Available Guides

### Installation Without Physical Media

- [Installing Without a CD Drive](/docs/installation/advanced/no-cd-installation)
  - Boot from USB drives
  - Boot from hard disk partitions
  - Chroot installation methods
  - Best for systems without optical drives

### Network-Free Installation

- [Installing Without Network Access](/docs/installation/advanced/no-network-installation)
  - Offline installation strategies
  - Pre-downloading sources
  - Managing local package caches
  - Best for systems with no internet or slow connections

### Storage Configuration

- [Software RAID Installation](/docs/installation/advanced/software-raid)
  - RAID 0, 1, 5, 6, and 10 configurations
  - Partition setup for RAID
  - Bootloader configuration for RAID
  - Best for redundancy and performance

### System Configuration

- [Kernel Command Line Parameters](/docs/installation/advanced/kernel-parameters)
  - Device management (devfs, udev, static)
  - Bootloader parameter configuration
  - LILO and GRUB examples
  - Best for controlling boot-time behavior

## Prerequisites

Before attempting advanced installations:

1. **Understand the basics:** Complete a standard installation first if possible
2. **Read carefully:** Advanced methods have more failure points
3. **Have backups:** Always backup important data
4. **Plan thoroughly:** Map out your installation strategy
5. **Have recovery options:** Keep a rescue disk or alternative boot method available

## General Tips

### Preparation

- Read the entire guide before starting
- Verify you have all required hardware/software
- Document your system configuration
- Test in a virtual machine if possible

### During Installation

- Work methodically through each step
- Don't skip verification steps
- Keep notes of any deviations from the guide
- Don't panic if something goes wrong

### Troubleshooting

- Check the FAQ for common issues
- Review system logs for error messages
- Ask for help in IRC (#lunar on Libera.Chat)
- Search for similar issues in forums

## Combining Methods

Some scenarios require combining multiple advanced techniques:

### Example: RAID Without CD Drive

1. Start with [Installing Without CD](/docs/installation/advanced/no-cd-installation)
2. Follow USB boot method
3. Then apply [Software RAID Installation](/docs/installation/advanced/software-raid)
4. Configure bootloader for both RAID and your boot method

### Example: Offline RAID Installation

1. Pre-download sources per [Network-Free Installation](/docs/installation/advanced/no-network-installation)
2. Boot from USB following [Installing Without CD](/docs/installation/advanced/no-cd-installation)
3. Set up RAID per [Software RAID Installation](/docs/installation/advanced/software-raid)
4. Install using cached sources

## Hardware Considerations

### Minimum Requirements

Advanced installations generally require:
- At least 512 MB RAM (1 GB+ recommended)
- 10 GB disk space minimum (20 GB+ recommended)
- Bootable USB port or network boot capability
- Compatible storage controller

### Recommended Hardware

For best experience with advanced installations:
- 2 GB+ RAM
- 40 GB+ disk space
- Multiple disks for RAID
- Modern CPU (2+ cores)
- Network adapter (even if not using during install)

## Recovery Strategies

### If Installation Fails

1. **Don't panic:** Most failures are recoverable
2. **Check logs:** Review /var/log/lunar/ for errors
3. **Boot rescue mode:** Use installation media to boot to recovery
4. **Ask for help:** IRC and forums are very responsive

### Common Failure Points

- **Bootloader:** Most common issue, usually fixable
- **RAID assembly:** Verify configuration syntax carefully
- **Missing sources:** Download missing files and retry
- **Hardware detection:** May need manual driver loading

## Testing Your Installation

Before relying on an advanced installation:

1. **Boot successfully:** Verify the system boots without media
2. **Test core functions:** Verify network, storage, etc.
3. **Install a few packages:** Ensure package management works
4. **Test failure modes:** Verify RAID rebuilding, etc.
5. **Document your setup:** Keep notes for future reference

## Additional Resources

### Official Documentation

- [Complete Installation Guide](/docs/installation/complete-install-guide)
- [FAQ](/docs/faq)
- [Desktop Environments](/docs/installation/desktop-environments)

### Community Support

- IRC: #lunar on irc.libera.chat
- Mailing lists: Check lunar-linux.org
- Forums: Community forums on lunar-linux.org

### External Documentation

- Linux RAID HOWTO
- Bootloader documentation (LILO/GRUB)
- Kernel documentation

## Contributing

If you've successfully completed an advanced installation not covered here, please consider contributing a guide:

1. Document your process step-by-step
2. Include hardware specifications
3. Note any issues and solutions
4. Submit via GitHub pull request

## See Also

- [Installation Overview](/docs/installation/)
- [System Administration](/docs/system-administration/)
- [FAQ](/docs/faq)
