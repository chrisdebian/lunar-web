---
title: "Contributing to Documentation"
description: "Guidelines for contributing to Lunar Linux documentation"
---

Thank you for your interest in improving Lunar Linux documentation!

## How to Contribute

1. Fork the [Lunar Linux website repository](https://github.com/lunar-linux/lunar-www)
2. Create a new branch for your changes
3. Make your documentation changes
4. Submit a pull request

## Documentation Guidelines

### File Organization

Documentation is organized in `/content/docs/` with the following structure:

- `installation/` - Installation guides
- `package-management/` - Package management documentation
- `system-administration/` - System administration guides
- `development/` - Development documentation

### Frontmatter Requirements

Each documentation page must include frontmatter:

```yaml
---
title: "Page Title"
description: "Brief description"
category: "category-name"
order: 1
lastUpdated: 2025-11-02
tags: [tag1, tag2, tag3]
---
```

### Writing Style

- Use clear, concise language
- Include code examples where relevant
- Use proper markdown formatting
- Add links to related documentation

### Markdown Formatting

- Use heading levels 2-4 (h1 is reserved for title)
- Use code blocks with language specification
- Use lists for sequential steps
- Use bold for emphasis, not italics

## Review Process

All documentation contributions are reviewed by maintainers. Please be patient and responsive to feedback.
