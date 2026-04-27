/**
 * Smart Type Detection Dictionary
 * Menentukan tipe data berdasarkan nama kolom.
 */

const typeDictionary = [
  // IDs & Foreign Keys
  { pattern: /^id$/, type: 'INT', primary: true, autoIncrement: true, nullable: false },
  { pattern: /_id$/, type: 'INT', nullable: false },
  { pattern: /^uuid$/, type: 'UUID', nullable: false },

  // Strings / Text
  { pattern: /email/, type: 'VARCHAR(255)', nullable: true, unique: true },
  { pattern: /password|token|secret/, type: 'VARCHAR(255)', nullable: false },
  { pattern: /slug/, type: 'VARCHAR(255)', nullable: false, unique: true },
  { pattern: /name|title|subject|label/, type: 'VARCHAR(255)', nullable: true },
  { pattern: /phone|telp|mobile/, type: 'VARCHAR(20)', nullable: true },
  { pattern: /address|location/, type: 'VARCHAR(500)', nullable: true },
  { pattern: /description|content|body|bio|summary|notes/, type: 'TEXT', nullable: true },
  { pattern: /image|avatar|photo|thumbnail|file|url|link/, type: 'VARCHAR(2048)', nullable: true },

  // Numbers & Currency
  { pattern: /price|amount|total|cost|balance|salary|tax|discount/, type: 'DECIMAL(15,2)', nullable: true },
  { pattern: /age|count|quantity|qty|stock|order|position|rank/, type: 'INT', nullable: true },
  { pattern: /lat|latitude|lng|longitude/, type: 'DECIMAL(10,8)', nullable: true },
  { pattern: /rating|score|percentage/, type: 'DECIMAL(5,2)', nullable: true },

  // Dates & Times
  { pattern: /created_at|updated_at/, type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' },
  { pattern: /deleted_at|published_at|expired_at/, type: 'TIMESTAMP', nullable: true },
  { pattern: /date|birthday|deadline/, type: 'DATE', nullable: true },
  { pattern: /time|duration/, type: 'TIME', nullable: true },
  { pattern: /year/, type: 'YEAR', nullable: true },

  // Booleans / Status
  { pattern: /^is_|has_|active|status|verified|enabled|disabled/, type: 'TINYINT(1)', nullable: false, defaultValue: '1' },
  { pattern: /gender|sex/, type: 'ENUM("M", "F", "OTHER")', nullable: true },

  // Complex
  { pattern: /json|metadata|settings|options|extra|payload/, type: 'JSON', nullable: true },
]

/**
 * Mendeteksi tipe data berdasarkan nama kolom dan dialek database.
 */
export function detectType(name, dialect = 'mysql') {
  const n = name.toLowerCase()
  
  // Cari pola yang cocok di kamus
  const match = typeDictionary.find(entry => entry.pattern.test(n))
  
  if (match) {
    let result = { ...match }
    delete result.pattern // hapus pattern agar tidak masuk ke objek kolom
    
    // Penyesuaian berdasarkan Dialek
    if (dialect === 'postgresql') {
      if (result.type === 'INT' && result.autoIncrement) result.type = 'SERIAL'
      if (result.type === 'BIGINT' && result.autoIncrement) result.type = 'BIGSERIAL'
      if (result.type === 'TINYINT(1)') result.type = 'BOOLEAN'
      if (result.type === 'DATETIME') result.type = 'TIMESTAMP'
    } else if (dialect === 'sqlite') {
      if (result.type === 'INT' && result.primary) result.type = 'INTEGER'
      if (result.type === 'DECIMAL(15,2)') result.type = 'REAL'
      if (result.type === 'JSON') result.type = 'TEXT'
    }

    return result
  }

  // Default jika tidak ada yang cocok
  return { type: 'VARCHAR(255)', nullable: true }
}

/**
 * Generate data contoh (dummy) berdasarkan tipe data.
 */
export function generateDummyValue(type, name) {
    const n = name.toLowerCase()
    const t = type.toUpperCase()

    if (t.includes('INT') || t === 'SERIAL') return Math.floor(Math.random() * 100)
    if (t.includes('DECIMAL') || t === 'REAL') return (Math.random() * 100).toFixed(2)
    if (t.includes('UUID')) return '550e8400-e29b-41d4-a716-446655440000'
    
    if (t.includes('VARCHAR') || t.includes('TEXT')) {
        if (n.includes('email')) return 'user@example.com'
        if (n.includes('name')) return 'John Doe'
        if (n.includes('title')) return 'Sample Title'
        if (n.includes('phone')) return '08123456789'
        if (n.includes('slug')) return 'sample-title-slug'
        if (n.includes('address')) return 'Jl. Sudirman No. 123, Jakarta'
        if (n.includes('url') || n.includes('image')) return 'https://example.com/image.jpg'
        return 'Sample Data'
    }
    
    if (t.includes('DATE') || t.includes('TIMESTAMP')) return new Date().toISOString().split('T')[0]
    if (t.includes('TIME')) return '12:00:00'
    if (t.includes('TINYINT') || t === 'BOOLEAN') return 1
    if (t === 'JSON') return '{"key": "value"}'
    if (t.startsWith('ENUM')) {
        const matches = t.match(/"([^"]+)"/g)
        if (matches) return matches[0].replace(/"/g, '')
        return '...'
    }
    
    return '...'
}
