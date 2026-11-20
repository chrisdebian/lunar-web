---
title: "Module Submission"
description: "How to submit new or updated modules to the official Lunar Linux moonbase"
category: "development"
tags: ["modules", "submission", "contributing", "moonbase"]
lastUpdated: 2025-11-02
order: 3
---

The official Moonbase is maintained and updated by the Lunar Linux developers. But what if there isn't a module in the Moonbase for the package that you want, or it is not the latest version, or it is out-of-date in some other way?

## Why Would I Want to Submit a Module?

You have several options when you encounter a missing or outdated module:

1. **Report the problem** via:
   - Bug Tracker (bugs.lunar-linux.org, no longer available)
   - [Lunar Mailing-List](http://lunar-linux.org/mailing-lists)
   - [#lunar](https://web.libera.chat/#lunar) IRC channel on [Libera.Chat](https://libera.chat/)
   - Hope that someone can help you

2. **Scratch your itch the open source way:**
   - Create or update the module yourself using the information in:
     - [Module Basics](/docs/development/module-basics)
     - [Writing Modules](/docs/development/module-writing)
   - Remember to work in the **zlocal** section so your updates are not lost the next time you download a new Moonbase

3. **Share your work:**
   - Maybe other people could benefit from your module
   - Maybe other people could improve your module
   - Submit it to the Lunar developers so they can decide whether to commit it to the Moonbase

## Acceptance and Rejection Criteria

### Submissions Will Probably Be Accepted If They:

- Introduce a new or missing module into the moonbase
- Provide an updated version of a module
- Provide updated download and website URLs
- Provide missing dependencies required to build the module
- Add BUILD options that enable a failing module to build

### Submissions Are Likely to Be Rejected If They:

- Do not follow the formatting guidelines given in the documentation
- Fail to download sources correctly, or fail to build
- Introduce system-specific changes that not all users will want
- Remove explicit dependencies in favor of implicit ones
- Form part of a larger suite of modules that need to be updated and tested together (such as an X, KDE or GNOME component)
- Introduce an svn or git development version of a module that already has a recent, stable version
- Change a core module, or one which is known to cause update problems for other tools

## How Do I Create a New Module?

The easiest way is to run:

```bash
lvu new theModule
```

It will ask for:
- URLs for the source tarball
- Website URL
- Short and long description entries

Then it creates a basic DETAILS file for you. Follow the guidelines below to complete the module.

## How Do I Update a Module?

Let's assume that you have found that theModule no longer downloads and installs properly and you want to fix it.

### Step 1: Copy the Module to zlocal

```bash
lvu edit theModule
```

This copies the existing theModule files to zlocal.

### Step 2: Navigate to the Module Directory

```bash
lvu cd theModule
```

Or manually change into the directory given by `lvu edit`.

### Step 3: Edit the DETAILS File

#### If You Are Updating Because There Is a New Release:

1. Modify the version number to the latest one available
2. Edit the UPDATED date to today's date
3. Download the new version:
   ```bash
   lget theModule
   ```
4. Generate the new checksum:
   ```bash
   sha1sum /var/spool/lunar/theModule-(whatever the new file name is)
   ```
5. Insert this checksum in the SOURCE_VFY field in the DETAILS file

#### If You Are Correcting a Broken Link or SHA1sum Without Changing the Version:

Leave the UPDATED field as it was so that people will not be forced to download and re-install.

### Step 4: Test the Module

```bash
# Test building and installation
lin theModule

# Test, test and test again!
```

### Step 5: Verify Installation

```bash
# Make sure it hasn't installed files where it shouldn't
lvu install theModule

# Check whether you need to create or update DEPENDS
lvu links theModule
```

### Additional Files

Many modules only require a DETAILS file. Others may also need:
- DEPENDS
- BUILD
- PRE_BUILD
- POST_INSTALL
- x86_64 versions of the files

See [Module Basics](/docs/development/module-basics) for more information.

## How Do I Submit the Module?

Once you have successfully installed the module using `lin -rc theModule`:

### Step 1: Subscribe to the Mailing List

Subscribe to the [Lunar Mailing-List](http://lunar-linux.org/mailing-lists). Not sure if this is still required, but why not do it now anyway? Other users might have feedback about the module.

### Step 2: Set Your Email Address

If you haven't already done so, you will need to set your email address for the submission script to work:

```bash
lunar set ADMIN your@email.address
```

Or run `lunar` and follow the menus.

### Step 3: Submit the Module

```bash
lvu submit theModule
```

Provide a meaningful message (see Note below).

### Step 4: Wait for Feedback

You should receive email feedback whether your submission was accepted or the reasons for rejection. Remember that:

- The Lunar development team is quite small
- They are all working in their spare time and have real lives and other commitments
- Some submissions require specific hardware/software environments to be able to install and test them properly

## Submission Message Guidelines

**Important:** The first line of the message will be visible on the online [Submission queue](http://foo-projects.org/~sofar/queue.php).

Give the reasons why the module has been updated and what you have changed. This message can then be used directly when submitting the changes to the central moonbase.

### Good Submission Message Examples:

```
Update foo to version 2.1.3 - fixes security vulnerability

- Updated VERSION to 2.1.3
- Added missing dependency on bar
- Fixed compilation with GCC 11
```

```
Add new module: baz - network monitoring tool

- Created DETAILS, DEPENDS, and BUILD
- Tested on x86_64
- Optional dependency on gtk+ for GUI
```

### Poor Submission Message Examples:

```
updated
```

```
fix
```

```
I updated this module please accept it
```

## Best Practices

### Before Submitting

1. **Test thoroughly:**
   ```bash
   # Clean build
   lrm theModule
   lin -rc theModule
   ```

2. **Check dependencies:**
   ```bash
   lvu links theModule
   ```

3. **Verify files:**
   ```bash
   lvu install theModule
   ```

4. **Test removal:**
   ```bash
   lrm theModule
   lin theModule
   ```

### Formatting Guidelines

- Follow the formatting in existing modules
- Use consistent indentation
- Include all necessary fields in DETAILS
- Add comments where helpful
- Use proper shell syntax

### Documentation

- Provide a clear SHORT description
- Write a detailed long description
- Document any non-obvious build options
- Explain any patches or workarounds

## Common Issues

### Download Failures

Make sure the SOURCE_URL is correct and the file is still available:

```bash
lget theModule
```

### Build Failures

Test the build process thoroughly. Common issues:
- Missing dependencies
- Incorrect configure options
- Platform-specific problems

### Checksum Mismatches

Always generate fresh checksums:

```bash
sha1sum /var/spool/lunar/theModule-x.y.z.tar.gz
```

## Advanced Submissions

### Multiple Files

If your module requires multiple source files:

```bash
SOURCE2=$MODULE-docs-$VERSION.tar.gz
SOURCE2_URL=http://example.com/
SOURCE2_VFY=sha1:...
```

### Platform-Specific Changes

For 64-bit specific changes, create:
- `DETAILS.x86_64`
- `BUILD.x86_64`

### Patches

If you need to include patches:

1. Create the patch file
2. Add it to the module directory
3. Reference it in PRE_BUILD:
   ```bash
   patch_it $SOURCE_CACHE/mymodule-fix.patch 1
   ```

## The Developer's Perspective

For an idea of how the developers process submissions, the development team:

1. Reviews submissions in the queue
2. Tests the module if possible
3. Checks for formatting and guideline compliance
4. Commits accepted modules to the moonbase
5. Provides feedback on rejected submissions

Patience is appreciated - the team works on this in their spare time!

## Getting Help

If you have questions about submitting modules:

- Ask on #lunar IRC channel
- Post to the lunar mailing list
- Check existing modules for examples
- Review the documentation

## Related Topics

- [Module Basics](/docs/development/module-basics) - Understanding module structure
- [Writing Modules](/docs/development/module-writing) - Creating new modules
- [Moonbase](/docs/package-management/moonbase) - Understanding the repository

Remember: Every submission helps make Lunar Linux better for everyone!
