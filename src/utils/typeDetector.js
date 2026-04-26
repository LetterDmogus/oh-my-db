export function detectType(name) {
  const n = name.toLowerCase()
  
  if (n === 'id') return { type: 'INT', autoIncrement: true, primary: true, nullable: false }
  if (n.endsWith('_id')) return { type: 'INT', nullable: false }
  
  if (n.includes('email')) return { type: 'VARCHAR(255)', nullable: true }
  if (n.includes('password')) return { type: 'VARCHAR(255)', nullable: false }
  if (n.includes('name') || n.includes('title') || n.includes('subject')) return { type: 'VARCHAR(255)', nullable: true }
  
  if (n.includes('description') || n.includes('content') || n.includes('body') || n.includes('bio')) return { type: 'TEXT', nullable: true }
  
  if (n.includes('price') || n.includes('amount') || n.includes('total') || n.includes('cost')) return { type: 'DECIMAL(10,2)', nullable: true }
  
  if (n.includes('date') || n.endsWith('_at') || n === 'timestamp') {
      if (n.includes('created') || n.includes('updated')) return { type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' }
      return { type: 'DATE', nullable: true }
  }
  
  if (n.startsWith('is_') || n.startsWith('has_') || n === 'active' || n === 'status') return { type: 'TINYINT(1)', nullable: false, defaultValue: '1' }
  
  if (n.includes('age') || n.includes('count') || n.includes('quantity')) return { type: 'INT', nullable: true }

  return { type: 'VARCHAR(255)', nullable: true }
}

export function generateDummyValue(type, name) {
    const n = name.toLowerCase()
    const t = type.toUpperCase()

    if (t.includes('INT')) return Math.floor(Math.random() * 100)
    if (t.includes('DECIMAL')) return (Math.random() * 100).toFixed(2)
    if (t.includes('VARCHAR') || t.includes('TEXT')) {
        if (n.includes('email')) return 'user@example.com'
        if (n.includes('name')) return 'John Doe'
        if (n.includes('title')) return 'Sample Title'
        if (n.includes('phone')) return '08123456789'
        return 'Sample Data'
    }
    if (t.includes('DATE') || t.includes('TIMESTAMP')) return new Date().toISOString().split('T')[0]
    if (t.includes('TINYINT')) return 1
    
    return '...'
}
