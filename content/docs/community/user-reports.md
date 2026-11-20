---
title: "User Reports and Success Stories"
description: "Real-world experiences installing and running Lunar Linux on various hardware"
category: "community"
tags: ["community", "hardware", "compatibility", "success-stories"]
order: 1
---

This page collects reports from Lunar Linux users about their installation experiences, hardware compatibility, and system configurations. These real-world accounts provide valuable insights for new users considering Lunar and help the community understand which hardware works well.

## About User Reports

We encourage all users to share their experiences with Lunar Linux. Your report helps others understand:

- What hardware works well with Lunar
- Common challenges and solutions
- Realistic installation timeframes
- Practical optimization strategies
- Real-world performance characteristics

Whether your installation was smooth or challenging, your experience is valuable to the community.

## Featured Reports

### Skinwalker: Installing Lunar on an Eee PC

**Date:** February 25, 2009
**Author:** Skinwalker / The_Deliberator

**Background:**

I'm a Doctoral student from the University of Stuttgart, Germany, with a background in Chemical Engineering. While not a Linux expert, I've been using Unix systems for about eight years, starting with Sun Solaris on SPARC for mathematical modeling and simulation work.

My first personal Linux installation was on an ancient computer from a friend. Since then, I've never looked back. When I got an Asus Eee PC, I immediately wanted to run Lunar Linux on it.

**System Specifications:**

- **Device:** Asus Eee PC
- **Purpose:** Portable development and research system
- **Special Considerations:** Limited storage, lightweight system requirements

**Experience:**

The Eee PC presented unique challenges due to its compact design and limited storage. However, Lunar's source-based approach allowed me to build a lean system optimized specifically for the hardware constraints.

**Key Takeaways:**

- Lunar works excellent on resource-constrained systems when properly optimized
- The ability to compile only needed features saved significant disk space
- Build times were longer than on desktop systems but manageable

**Read the full report:** [User Talk: Skinwalker](http://wiki.lunar-linux.org/User_talk:Skinwalker) on the Lunar Linux wiki

### Moe: Reinstalling Lunar on New Hardware

**Date:** April 30, 2006
**Author:** moe@lunar-linux.org

**Background:**

After several years of running Lunar (last fresh installation was version 1.3.x), I built a new computer and decided to do a complete fresh installation rather than migrating my existing system.

**System Specifications:**

- **CPU:** AMD Athlon 64 3200+
- **RAM:** 512 GB
- **Graphics:** GeForce 3 Ti (from eBay)
- **Motherboard:** ASRock with ULi 1695 939-socket chipset

**Experience:**

Coming back to a fresh installation after years of updates-only, I encountered both familiar and new challenges. The installer had evolved significantly since version 1.3, and the process was much smoother than I remembered.

**Key Takeaways:**

- Fresh installations give you a clean start and are worth doing periodically
- Hardware detection had improved significantly since earlier versions
- The AMD64 architecture was well-supported

**Read the full report:** [User Reports: Moe](http://wiki.lunar-linux.org/User_Reports:Moe) on the Lunar Linux wiki

### Engelsman: A Newbie's Experience Installing Lunar

**Date:** September 3, 2005
**Author:** Engelsman

**Background:**

I started using Unix V7 on a PDP-11/70 back in 1983, modifying kernel drivers for the Cambridge Ring local area network. After years of system administration on Sun, Apollo, and HP boxes, I found myself out of touch with modern Linux when we switched to Lunar at work.

My previous home Linux experience was a failed RedHat installation on a 90MHz PC without network connectivity. Now, with new hardware and a modem, I wanted to set up a proper development environment using Lunar.

**System Specifications:**

- **Previous System:** 90MHz PC (too slow, abandoned)
- **New System:** Modern desktop (2005 era) with modem connection
- **Purpose:** Personal development workstation for FLTK interface development

**Experience:**

As someone with deep Unix experience but rusty on modern Linux, Lunar presented both challenges and opportunities. The source-based approach felt familiar from my BSD and Solaris days, but the tooling and automation were impressive.

**Key Takeaways:**

- Lunar is accessible to Unix veterans coming back to Linux
- The learning curve is steep but rewarding
- Compilation-from-source makes more sense on modern hardware than old 90MHz systems
- Good documentation and IRC support are essential

**Read the full report:** [User Reports: Engelsman](http://wiki.lunar-linux.org/User_Reports:Engelsman) on the Lunar Linux wiki

## Contributing Your Report

We'd love to hear about your Lunar Linux experience! Your report helps the community and potential users understand what to expect.

### What to Include

A good user report typically contains:

#### 1. Background Information

- Your technical experience level
- Previous Linux/Unix experience
- Why you chose Lunar Linux
- What you're using Lunar for (desktop, server, development, etc.)

#### 2. Hardware Specifications

- CPU (model, speed, cores)
- RAM (amount)
- Storage (type, size, speed)
- Graphics card
- Motherboard/chipset
- Any special hardware (RAID, USB devices, etc.)
- Network interfaces

#### 3. Installation Experience

- Which ISO version you used
- Installation method (CD, USB, network, etc.)
- Time required for installation
- Any issues encountered during installation
- How you resolved those issues

#### 4. Post-Installation

- Desktop environment chosen
- Time required for full system setup
- Optimization settings used
- Performance observations
- Any hardware compatibility issues

#### 5. Key Takeaways

- What worked well
- What was challenging
- Tips for others with similar hardware
- Overall impressions

### Formatting Guidelines

- **Be specific:** Include exact model numbers and version numbers
- **Be honest:** Both successes and failures are valuable
- **Be constructive:** Focus on solutions, not complaints
- **Be detailed:** Others will reference your report for years

### How to Submit

1. **Write your report** in markdown format
2. **Include all relevant hardware details**
3. **Document your process** with commands and configurations
4. **Submit via:**
   - GitHub pull request to the documentation repository
   - Email to the Lunar mailing list
   - Post in the Lunar forums

## Hardware Compatibility Database

Based on user reports, here's a summary of well-supported hardware:

### CPUs

- **Intel:** Excellent support for all modern and legacy Intel processors
- **AMD:** Full support for AMD processors, including Athlon and Ryzen
- **ARM:** Growing support, check for specific board compatibility

### Graphics

- **Intel:** Well-supported with open-source drivers
- **NVIDIA:** Excellent support with proprietary drivers, good with nouveau
- **AMD:** Good support with open-source radeon/amdgpu drivers

### Chipsets

Most modern chipsets are well-supported. Legacy hardware (10+ years old) typically works but may require specific kernel configuration.

### Special Hardware

User reports document success with:
- Software RAID configurations
- USB peripherals (keyboards, mice, cameras)
- Various network adapters
- Wireless devices
- Bluetooth adapters

## Tips from the Community

Based on collective user experiences:

### For New Hardware

- Check user reports for similar hardware before installing
- Have a backup plan if hardware detection fails
- Keep driver documentation handy during installation

### For Old Hardware

- Expect longer build times (see [Build Times Guide](/docs/guides/build-times))
- Consider using distcc if you have a faster machine available
- Choose lightweight desktop environments
- Use conservative optimization flags

### General Wisdom

- **Test in a VM first** if you're uncertain
- **Read multiple user reports** for varied perspectives
- **Join IRC** for real-time help during installation
- **Document your own experience** to help others

## Keeping Reports Current

Hardware and software evolve. If you've submitted a report:

- Consider updating it after major Lunar releases
- Note any changes in hardware support
- Share new optimization discoveries

Outdated reports remain valuable as historical reference.

## See Also

- [Installation Guide](/docs/installation/complete-install-guide)
- [Build Times Guide](/docs/guides/build-times)
- [FAQ](/docs/faq)
- [Contributing to Lunar](/docs/contributing)

---

**Note:** Full user report content is available in the original wiki archives. Links above reference the original content locations. We're working to migrate complete reports to the new documentation system.
