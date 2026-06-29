// ============================================================
// useImportMarkdown — import local .md file with frontmatter
// ============================================================
//
// Returns:
//   importMarkdown() => Promise<{ title, content, tags } | null>
//
// Opens a file picker, reads the selected .md file,
// parses YAML frontmatter (--- ... ---) to extract title/tags,
// and returns the parsed data. Returns null if user cancels.

export interface ImportedMarkdown {
  title: string
  content: string
  tags: string[]
}

/**
 * Naive YAML frontmatter parser.
 * Only handles simple key: value lines (no nested objects, no arrays inline).
 * Tags can be:
 *   tags: tag1, tag2, tag3      — comma-separated
 *   tags: [tag1, tag2, tag3]    — inline array
 * Returns null if no frontmatter found.
 */
const QUOTE_RE = /^['"]|['"]$/g
const MD_EXT_RE = /\\.md$/i

function parseFrontmatter(raw: string): { attrs: Record<string, string | string[]>, body: string } | null {
  const trimmed = raw.trimStart()

  // Must start with ---
  if (!trimmed.startsWith('---'))
    return null

  // Find closing ---
  const endIdx = trimmed.indexOf('---', 3)
  if (endIdx === -1)
    return null

  const fmRaw = trimmed.slice(3, endIdx).trim()
  const body = trimmed.slice(endIdx + 3).trimStart()

  const attrs: Record<string, string | string[]> = {}

  for (const line of fmRaw.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1)
      continue

    const key = line.slice(0, colonIdx).trim().toLowerCase()
    let value: string = line.slice(colonIdx + 1).trim()

    if (!key || !value)
      continue

    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
      value = value.slice(1, -1)
    }

    // Inline array: [tag1, tag2]
    if (value.startsWith('[') && value.endsWith(']')) {
      const items = value.slice(1, -1).split(',').map(s => s.trim().replace(QUOTE_RE, '')).filter(Boolean)
      attrs[key] = items
    }
    // Comma-separated list (for tags)
    else if (['tags', 'tag', 'categories', 'category'].includes(key) && value.includes(',')) {
      attrs[key] = value.split(',').map(s => s.trim()).filter(Boolean)
    }
    else {
      attrs[key] = value
    }
  }

  return { attrs, body }
}

export function useImportMarkdown() {
  function importMarkdown(): Promise<ImportedMarkdown | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.md,.markdown'
      input.addEventListener('change', () => {
        const file = input.files?.[0]
        if (!file) {
          resolve(null)
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          const text = reader.result as string
          const parsed = parseFrontmatter(text)
          const title = (parsed?.attrs?.title as string) || file.name.replace(/\.md$/i, '')
          const tags = (parsed?.attrs?.tags || parsed?.attrs?.tag || parsed?.attrs?.categories || parsed?.attrs?.category || []) as string | string[]
          const content = parsed ? parsed.body : text
          resolve({ title, content, tags: Array.isArray(tags) ? tags : [tags] })
        }
        reader.readAsText(file, 'UTF-8')
      })
      input.click()
    })
  }

  return { importMarkdown }
}
