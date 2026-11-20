---
title: "Module Basics"
description: "Understanding the structure and scripts that make up a Lunar Linux module"
category: "development"
tags: ["modules", "development", "BUILD", "DETAILS", "DEPENDS"]
lastUpdated: 2025-11-02
order: 1
---

In Lunar parlance, software packages are called **modules**. The collection of all modules is the **moonbase**, which is simply a directory (usually `/var/lib/lunar/moonbase/`) containing sections (i.e. directories) which in turn contain the module directories.

A module is simply a directory containing the scripts necessary to build a software package, and optionally configuration files which may be needed in `/etc`.

## Module Scripts Overview

Some modules require only a DETAILS file, however this is only the case for a few modules in the entire moonbase. In each case, after DETAILS, DEPENDS, and CONFIGURE, where a module can use Lunar's default internal function(s), there is no need for a module-specific script.

### Core Module Files

- **DETAILS** - Sets version, source URL(s) and other critical data
- **CONFLICTS** - Specifies modules which must (will) be removed by module
- **CONFIGURE** - Interactive script where build options can be set
- **DEPENDS** - Specifies required and optional packages
- **PRE_BUILD** - Most often used for patching, unpacking additional source tarballs
- **BUILD** - Runs necessary variations on: configure; make; make install
- **POST_BUILD** - Install configuration scripts and data
- **POST_INSTALL** - Messages, notes, more cleanups, configuration fixes
- **PRE_REMOVE** - Used by `lrm`; actions which must precede removal
- **POST_REMOVE** - Used by `lrm`; actions which must follow removal

**Note:** Modules that require changes for 64-bit systems may also have `DETAILS.x86_64`, etc.

## Package Build and Install Scripts

The following scripts are used by `lin` or indirectly by `lunar` when building modules.

### The DETAILS Script

Every module is required to have at least a DETAILS file. A minimal DETAILS may appear as follows:

```bash
# /var/lib/lunar/moonbase/editors/emacs/DETAILS
          MODULE=emacs
         VERSION=21.3
          SOURCE=$MODULE-$VERSION.tar.gz
      SOURCE_URL=$GNU_URL/$MODULE
      SOURCE_URL=ftp://ftp.gnu.org/pub/gnu/$MODULE
      SOURCE_VFY=sha1:94d7ae9cb3aef05159cfff148265fc9ce0973980
        WEB_SITE=http://www.gnu.org/software/emacs
         ENTERED=20010922
         UPDATED=20020529
           SHORT="the extensible, self-documenting real-time display editor"

cat << EOF
Emacs is the extensible, customizable, self-documenting real-time
display editor.
EOF
```

#### Common SOURCE_URL Mirrors

- `$GNOME_URL` - GNOME mirrors
- `$GNU_URL` - GNU mirrors
- `$KDE_URL` - KDE mirrors
- `$SFORGE_URL` - SourceForge mirrors
- `$LRESORT_URL` - lunar-linux mirrors
- `$XFREE86_URL` - XFree86 mirrors
- `$XORG_URL` - x.org packages mirrors
- `$KERNEL_URL` - kernel, kernel tools mirrors
- `$PATCH_URL` - The place for *.patch or *.diff files which are not downloadable from other public hosts

#### Why Use Mirror URLs?

The use of mirror URLs is very important because:
- Downloads are faster because mirror is usually very close to user
- If any mirror server fails there is another one on list so user is not left with broken download
- International Internet connections are less blocked

#### Optional DETAILS Fields

**PSAFE** - If the application does not compile on more than one thread:
```bash
PSAFE="no"
```

**SOURCE_DIRECTORY** - If the tarball is not extracting into the default `$MODULE-$VERSION`:
```bash
SOURCE_DIRECTORY=$BUILD_DIRECTORY/"$MODULE"_"$VERSION"_src
```

**MAINTAINER** - If you want your name in the module and be listed as maintainer:
```bash
MAINTAINER=youremailadress
```

**Multiple SOURCE_URLs** - List them as:
```bash
SOURCE_URL[0]=
SOURCE_URL[1]=
SOURCE_URL[2]=
```

**Multiple SOURCEs** - List them as:
```bash
SOURCE2=
SOURCE3=
SOURCE2_URL=
SOURCE3_URL=
```

**Compiler Selection** - Force use of specific GCC version:
```bash
LUNAR_COMPILER=GCC_4_0  # or GCC_3_4 for gcc3
```

#### When to Update the UPDATED Field

Update the UPDATED field only when you have:
- Added something that will change the compile behavior
- Updated the version
- Added configure options

Don't change it just for formatting tweaks - don't force people to recompile if all you did was tidy up the file.

For *-cvs or *-svn modules in zbeta, check Module Guidelines for special handling.

#### SOURCE_VFY Field

The SOURCE_VFY field checks that the downloaded source file has not been corrupted or changed since the module was last updated.

- SHA1 checksums are preferred: `SOURCE_VFY=sha1:...`
- MD5 sums can be used: `SOURCE_VFY=md5:...`
- Should be omitted for modules that download snapshots from svn, cvs, git repositories because the sources could change between downloads

#### MAINTAINER Field

If you find a MAINTAINER field, please respect this and notify the person listed there that you will or have updated their module.

#### DETAILS with Comments and Default Values

```bash
          MODULE=emacs                                       # Module name, yes it's redundant
         VERSION=21.3                                        # Version, changes often
          SOURCE=$MODULE-$VERSION.tar.gz                     # Source filename
SOURCE_DIRECTORY=$BUILD_DIRECTORY/$MODULE-$VERSION           # Where source unpacks
                                                             # ($BUILD_DIRECTORY=/usr/src)
   SOURCE_URL[0]=$GNU_URL/$MODULE                            # Download URL
   SOURCE_URL[1]=ftp://ftp.gnu.org/pub/gnu/$MODULE          # Alternate URL(s)
      SOURCE_VFY=sha1:94d7ae9cb3aef05159cfff148265fc9ce0973980 # Sets sha1 hash or pgp/gpg sig url
        WEB_SITE=http://www.gnu.org/software/emacs           # Where to learn more
         ENTERED=20010922                                    # First appearance in moonbase
         UPDATED=20020529                                    # Date of latest change
                                                             # Force update by setting this

# The remaining lines are used for input to the 'lvu what' command
# and are best copied from the source-maintainer's own description.

           SHORT="the extensible, self-documenting real-time display editor"

cat << EOF
Emacs is the extensible, customizable, self-documenting real-time
display editor.
EOF
```

### The DEPENDS Script

The DEPENDS script is essential to configuration management and is the key to the overall operation of Lunar. Dependencies should be exactly specified, preferably not assuming the presence of any other modules, while knowing the sub-dependencies of the modules which are added and not adding those explicitly where not needed.

**Warning:** Getting this right is difficult. Because the state of installed packages may vary widely, it's important to have a good understanding of what might or might not be installed on a target system.

**Note:** By convention, Lunar does not include the X Window System (xfree86 or XOrg) in any dependency. There are two reasons:
1. We expect users to understand that to use a graphical application locally, the X Window System must be installed
2. Due to X11's unusual definition of client and server, it is often possible to build graphical applications for remote display without the server components locally installed

#### Required and Optional Dependencies

DEPENDS may include both required and optional dependencies:

```bash
# /var/lib/lunar/moonbase/devel/subversion/DEPENDS
depends zlib
depends openssl
optional_depends "db4" "--with-berkeley-db" "" "for creating local repositories"
#                  ^            ^            ^                  ^
#                  |            |            |                  |
#     optional package       if "Y"       if "N"       explanatory comment
#                        { ./configure strings }
```

The `depends` function determines one required package.

The `optional_depends` function consists of:
1. The required package
2. Necessary `--options` to give to `./configure` for yes
3. Options for no
4. An explanatory comment telling the user the purpose
5. An optional preferred choice (normally depends on package state)

Many old modules use `&&` in DEPENDS to be consistent with BUILD files, but the `&&` delimiter is not required and new DEPENDS files should not use it.

**Important:** You may not use `if module_installed...` or other general bash programming in the DEPENDS file to handle conditional dependencies. This is to keep the dependency tracking code in the Lunar tools as simple and fast as possible.

#### Aliases

Aliases are a means to select a generic module. When you need functionality that can be provided by two or more software packages, you can select one of them to provide a correct dependency.

Example `/var/lib/lunar/moonbase/aliases`:

```bash
%APACHE:apache apache2 apache-mod_ssl
%FAM:fam gamin
%GECKO_RENDERER:firefox thunderbird mozilla
%GHOSTSCRIPT:espgs ghostscript
%MTA:postfix exim sendmail esmtp
%SLANG:slang slang2
%X:XOrg XOrg-test xfree86 xfree86-beta
%XMLRENDERER:libxml2 expat
%XSCREENSAVER:xscreensaver xscreensaver-gtk1 xscreensaver-kde
```

You can choose an alias instead of a specific module:

```bash
depends %X
```

### The CONFLICTS Script

This script is simply used to specify modules which will be removed when a given module is installed.

Example:

```bash
# /var/lib/lunar/moonbase/editors/elvis/CONFLICTS
conflicts vim
```

### The CONFIGURE Script

The CONFIGURE script is used to collect interactive input from the user on optional parameters for the software build. Use the `query` function and provide a default answer to each question. The results are stored in configuration state files.

A simple example:

```bash
# /var/lib/lunar/moonbase/crypto/gnupg/CONFIGURE
if ! grep -q CONFIGURED $MODULE_CONFIG; then
  if query "Enable experimental external HKP keyserver interface? " n; then
    OPTS="$OPTS --enable-external-hkp"
  fi
  echo 'CONFIGURED="y"' >> $MODULE_CONFIG
  echo 'OPTS='"$OPTS" >> $MODULE_CONFIG
fi
```

Another way is using `mquery`:

```bash
# Example from lilo module
mquery RUN_LILO "Run LILO automatically upon LILO upgrades?" y
```

```bash
mquery ENABLE_FOO "Enable foo?" n "--enable-foo --enable-foo2" "--disable-foo --disable-foo2"
```

Where "No" would be the default answer. When the user chooses to enable-foo, answer "yes" is stored in the ENABLE_FOO variable and `--enable-foo --enable-foo2` will be added to the `./configure` command in the BUILD script.

### The PRE_BUILD Script

PRE_BUILD is used where special processing is needed before undertaking the actual build steps. Typical requirements include:
- Unpacking multiple sources
- Creating necessary system or source-tree directories
- Applying source patches

Example:

```bash
# /var/lib/lunar/moonbase/doc-tools/html2db/PRE_BUILD
mk_source_dir $SOURCE_DIRECTORY  &&
unpack $SOURCE                   &&
cd $MODULE
unpack $SOURCE2
cd tidy
patch_it $SOURCE_CACHE/$SOURCE3 0
cd /usr/src/$MODULE
```

### The BUILD Script

BUILD is used where the `default_build()` function does not work for a given software package.

#### Default Build Process

Function `default_build()` calls `default_config` which executes:

```bash
./configure  --build=$BUILD            \
             --prefix=/usr             \
             --sysconfdir=/etc         \
             --localstatedir=/var      \
             --infodir=/usr/share/info \
             --mandir=/usr/share/man   \
             $OPTS
```

Next, `default_build()` calls `default_make` which executes:

```bash
make &&
prepare_install &&
make install
```

The `prepare_install` should only be called immediately before the `make install` phase, so that the package management system only tracks the installed files and not any intermediate build files.

**Note (2011-02-20):** Be aware that several modules in the moonbase appear to get this wrong, so take care!

#### For Git/SVN/CVS Modules

If you have modules from git, svn or cvs, the configure script is missing most of the time. You can use the `default_cvs_build()` function:

```bash
./autogen.sh --prefix=/usr
```

It will then call `default_make()`.

#### Custom BUILD Examples

Where the default build configuration does not work, the BUILD script provides the needed steps. About 75% of modules need a BUILD script.

Example 1:

```bash
# /var/lib/lunar/moonbase/archive/gzip/BUILD
./configure --build=$BUILD            \
            --prefix=/usr             \
            --bindir=/bin             \
            --infodir=/usr/share/info \
            --mandir=/usr/share/man   &&
make &&
prepare_install &&
make bindir=/bin install
```

Example 2:

```bash
# /var/lib/lunar/moonbase/editors/ex/BUILD
cd $SOURCE_DIRECTORY                    &&
sedit 's/usr.local/usr/' Makefile       &&
sedit 's/= man/= share\/man/' Makefile  &&
sedit 's/ucb/bin/' Makefile             &&
sedit 's/= termlib/= ncurses/' Makefile &&
make                                    &&
prepare_install                         &&
make install
```

The first example is a build which needs non-standard 'configure' and 'make install' commands. The second is a build which does not use GNU auto-tools' 'configure' script.

#### Using && in BUILD Scripts

In the examples above, BUILD scripts contain multiple commands separated by `&&` to ensure that execution stops as soon as any command fails. The `&&` are 'and' operations: the command after the `&&` will only be run if the one before the `&&` completed successfully.

The use of `&&` is **required** in multi-command BUILD scripts.

### The POST_BUILD Script

POST_BUILD runs in place of the `default_post_build` routine which is used to install minor documentation and transfer/enable initialization scripts and similar system data, mostly into `/etc`.

**Note:** POST_BUILD script usage is deprecated. You should install your config files in BUILD (remember not to overwrite previous config files!) or install defaults from POST_INSTALL (again, do not overwrite present files!). The ability to use a POST_BUILD script is purely for certain internal functions.

### The POST_INSTALL Script

POST_INSTALL has no equivalent functions and is run to handle post-installation work in a general manner.

Example:

```bash
# /var/lib/lunar/moonbase/compilers/gcc/POST_INSTALL
cd /usr/lib/gcc-lib/$BUILD/$VERSION                      &&
ln    -sf /usr/bin/cpp cpp                               &&
cd /lib/                                                 &&
ln    -sf /usr/bin/cpp cpp                               &&
if [ ! -e /usr/bin/cc ]; then
  ln -s gcc /usr/bin/cc
fi
```

As in BUILD scripts, the `&&` represent 'and' operations, but their use in POST_INSTALL scripts is preferred rather than required.

## Package Removal Scripts

Module removal is handled by `lrm`. Because installation is monitored and backup tarballs are created using installwatch, most of package removal is handled automatically using the logs created by installwatch. However, we provide for additional actions to be taken through the PRE_REMOVE and POST_REMOVE scripts.

### The PRE_REMOVE Script

PRE_REMOVE is needed to execute any tasks needed prior to the main task of removing all files installed by the module.

Example:

```bash
# /var/lib/lunar/moonbase/mail/docbook-3.1/PRE_REMOVE
CENTRALIZED=/etc/sgml/catalog
DOCBOOK_INSTALL_DIR=/usr/share/sgml/docbook/$VERSION
install-catalog -r $CENTRALIZED $DOCBOOK_INSTALL_DIR/catalog
```

### The POST_REMOVE Script

POST_REMOVE may be used to remove data not tracked by installwatch and to correctly adjust remaining configuration files and data.

Example 1:

```bash
# /var/lib/lunar/moonbase/devel/binutils/POST_REMOVE
install-info  --delete as         --info-dir /usr/info
install-info  --delete bfd        --info-dir /usr/info
install-info  --delete binutils   --info-dir /usr/info
install-info  --delete configure  --info-dir /usr/info
install-info  --delete gasp       --info-dir /usr/info
install-info  --delete gprof      --info-dir /usr/info
install-info  --delete ld         --info-dir /usr/info
```

Example 2:

```bash
# /var/lib/lunar/moonbase/compilers/php/POST_REMOVE
if    module_installed  apache;  then
  cp        /etc/httpd/httpd.conf       /tmp/httpd.conf
  grep  -v  "LoadModule php4_module"    /tmp/httpd.conf  |
  grep  -v  "AddModule mod_php4.c"   >  /etc/httpd/httpd.conf
  rm    -f  /tmp/httpd.conf
elif  module_installed  apache_mod_ssl;  then
  cp        /etc/httpsd/httpd.conf      /tmp/httpd.conf
  grep  -v  "LoadModule php4_module"    /tmp/httpd.conf  |
  grep  -v  "AddModule mod_php4.c"   >  /etc/httpsd/httpd.conf
  rm    -f  /tmp/httpd.conf
fi
```

## Related Topics

- [Module Writing](/docs/development/module-writing) - Learn how to write modules
- [Module Functions](/docs/development/module-functions) - Reference for available functions
- [Module Submission](/docs/development/module-submission) - How to submit modules to moonbase
