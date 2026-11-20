#!/usr/bin/env node

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const WIKI_BASE = 'http://wiki.lunar-linux.org'
const OUTPUT_DIR = './docs-imported-staging'

// List of wiki pages to scrape
const WIKI_PAGES = [
  // Main pages
  'Lunar_Linux',
  'Lunar_Linux:About',
  'Lunar_Linux:FAQ',
  'Lunar_Linux/Documentation',

  // Installation
  'Lunar_Linux:Installation',
  'Lunar_Linux:Installation/1.5.0',
  'Lunar_Linux:DesktopEnvironments',
  'Installation:No_CD',
  'Installation:No_network',
  'Installation:The_kernel_commandline_/dev_params_mini-HowTo',
  'Installation:Software_Raid',
  'Install_XOrg7',

  // Moonbase & Modules
  'Moonbase',
  'Module_Basics',
  'Module_Writing',
  'Module_Functions',
  'Module_Submission',

  // Other
  'Lunar_Linux:Misc',
  'User_Reports',
  'How_long',
  'Howto_Articles'
]

async function fetchWikiPage(pageName) {
  try {
    const url = `${WIKI_BASE}/${pageName}`
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`Failed to fetch ${pageName}: ${response.status}`)
      return null
    }

    const html = await response.text()
    return html
  } catch (error) {
    console.error(`Error fetching ${pageName}:`, error.message)
    return null
  }
}

function extractContent(html) {
  // Basic HTML to markdown conversion
  // This is a simplified version - may need enhancement

  // Extract title
  const titleMatch = html.match(/<h1[^>]*id="firstHeading"[^>]*>([^<]+)<\/h1>/)
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled'

  // Extract main content - find the div with mw-content-ltr class
  const contentMatch = html.match(/class="mw-content-ltr"[^>]*>([\s\S]*?)<!-- \/bodycontent -->/)
  let content = contentMatch ? contentMatch[1] : ''

  // Basic HTML to Markdown conversions
  content = content
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Convert headers
    .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1')
    .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1')
    .replace(/<h4[^>]*>(.*?)<\/h4>/g, '#### $1')
    // Convert paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gs, '$1\n\n')
    // Convert lists
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (_, items) => {
      return items.replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n')
    })
    // Convert code blocks
    .replace(/<pre[^>]*>(.*?)<\/pre>/gs, '```\n$1\n```\n')
    .replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`')
    // Convert links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return { title, content }
}

async function saveMarkdown(pageName, title, content) {
  // Create output directory if it doesn't exist
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }

  // Generate filename from page name
  const filename = pageName.toLowerCase().replace(/_/g, '-').replace(/:/g, '-').replace(/\//g, '-') + '.md'
  const filepath = join(OUTPUT_DIR, filename)

  // Create frontmatter
  const frontmatter = `---
title: "${title}"
description: "Imported from wiki - needs review"
category: "uncategorized"
tags: []
lastUpdated: ${new Date().toISOString().split('T')[0]}
needsReview: true
---

`

  const markdown = frontmatter + content

  await writeFile(filepath, markdown, 'utf-8')
  console.log(`✓ Saved: ${filename}`)
}

async function main() {
  console.log('Starting wiki scraping...\n')

  for (const pageName of WIKI_PAGES) {
    console.log(`Fetching: ${pageName}`)
    const html = await fetchWikiPage(pageName)

    if (!html) {
      console.log(`✗ Skipped: ${pageName}\n`)
      continue
    }

    const { title, content } = extractContent(html)
    await saveMarkdown(pageName, title, content)
    console.log()

    // Be nice to the server
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('Wiki scraping complete!')
  console.log(`\nImported files are in: ${OUTPUT_DIR}`)
  console.log('Next steps:')
  console.log('1. Review and categorize each file')
  console.log('2. Update frontmatter (category, tags, description)')
  console.log('3. Refine content and formatting')
  console.log('4. Move to appropriate category in content/docs/')
}

main().catch(console.error)
