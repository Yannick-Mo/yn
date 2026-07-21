import Database from "@tauri-apps/plugin-sql"

let db: Database | null = null
let dbError: string | null = null

export async function getDb(): Promise<Database> {
  if (db) return db
  if (dbError) throw new Error(dbError)
  try {
    db = await Database.load("sqlite:yn.db")
    await db.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sentence_id TEXT UNIQUE,
        content TEXT NOT NULL,
        author TEXT,
        source TEXT NOT NULL,
        from_text TEXT,
        type_text TEXT,
        translation TEXT,
        added_at INTEGER NOT NULL
      )
    `)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sentence_id TEXT,
        content TEXT NOT NULL,
        author TEXT,
        source TEXT NOT NULL,
        from_text TEXT,
        type_text TEXT,
        translation TEXT,
        fetched_at INTEGER NOT NULL
      )
    `)
    return db
  } catch (err) {
    dbError = `Database init failed: ${err}`
    throw new Error(dbError)
  }
}

export interface Favorite {
  sentence_id: string
  content: string
  author: string | null
  source: string
  from_text: string | null
  type_text: string | null
  translation: string | null
  added_at: number
}

export async function addFavorite(fav: Omit<Favorite, "added_at">): Promise<void> {
  try {
    const d = await getDb()
    await d.execute(
      "INSERT OR IGNORE INTO favorites (sentence_id, content, author, source, from_text, type_text, translation, added_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [fav.sentence_id, fav.content, fav.author, fav.source, fav.from_text, fav.type_text, fav.translation, Date.now()]
    )
  } catch (err) {
    console.error("addFavorite failed:", err)
  }
}

export async function removeFavorite(sentenceId: string): Promise<void> {
  try {
    const d = await getDb()
    await d.execute("DELETE FROM favorites WHERE sentence_id = $1", [sentenceId])
  } catch (err) {
    console.error("removeFavorite failed:", err)
  }
}

export async function getFavorites(): Promise<Favorite[]> {
  const d = await getDb()
  return await d.select<Favorite[]>(
    "SELECT sentence_id, content, author, source, from_text, type_text, translation, added_at FROM favorites ORDER BY added_at DESC"
  )
}

export async function isFavorited(sentenceId: string): Promise<boolean> {
  try {
    const d = await getDb()
    const rows = await d.select<{cnt: number}[]>(
      "SELECT COUNT(*) as cnt FROM favorites WHERE sentence_id = $1", [sentenceId]
    )
    const row = rows[0]
    return row ? row.cnt > 0 : false
  } catch (err) {
    console.error("isFavorited failed:", err)
    return false
  }
}

export async function exportFavorites(format: "json" | "csv" | "txt"): Promise<string> {
  const favs = await getFavorites()

  switch (format) {
    case "json":
      return JSON.stringify(favs, null, 2)
    case "csv": {
      const header = "content,author,source,from_text"
      const rows = favs.map(f =>
        `"${f.content.replace(/"/g, '""')}","${f.author || ""}","${f.source}","${f.from_text || ""}"`
      )
      return [header, ...rows].join("\n")
    }
    case "txt":
      return favs.map(f => {
        let s = f.content
        if (f.author) s += ` — ${f.author}`
        if (f.from_text) s += ` (${f.from_text})`
        return s
      }).join("\n\n")
    default:
      return ""
  }
}
