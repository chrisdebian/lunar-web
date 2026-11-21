#!/usr/bin/env node
// Writes the moonbase arrivals feed (the homepage board's data) to a JSON file. Used by the
// moonbase-feed workflow to refresh the published file on GitHub Pages without a full build.
//
//   node scripts/moonbase-feed.mjs [output.json]      (default: moonbase-arrivals.json)
//
// Set GITHUB_TOKEN to avoid GitHub's limit of 60 unauthenticated requests an hour.
// Node 24 runs the TypeScript module below directly (type stripping), so no install is needed.

import { writeFileSync } from 'node:fs'
import process from 'node:process'
import { fetchMoonbaseArrivals } from '../server/utils/moonbase.ts'

const output = process.argv[2] ?? 'moonbase-arrivals.json'
const feed = await fetchMoonbaseArrivals(process.env.GITHUB_TOKEN)
writeFileSync(output, JSON.stringify(feed))
console.log(`${feed.arrivals.length} arrivals, ${feed.total} updates in the last ${feed.days} days → ${output}`)
