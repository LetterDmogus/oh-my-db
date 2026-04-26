export const commonColumns = [
  { name: 'email', type: 'VARCHAR(255)', unique: true, nullable: false, notes: 'Alamat email pengguna.' },
  { name: 'password', type: 'VARCHAR(255)', nullable: false, notes: 'Password terenkripsi.' },
  { name: 'username', type: 'VARCHAR(255)', unique: true, nullable: false },
  { name: 'phone', type: 'VARCHAR(255)', nullable: true },
  { name: 'avatar', type: 'VARCHAR(255)', nullable: true },
  { name: 'price', type: 'DECIMAL(10,2)', nullable: false, defaultValue: '0.00' },
  { name: 'stock', type: 'INT', nullable: false, defaultValue: '0' },
  { name: 'status', type: 'BOOLEAN', nullable: false, defaultValue: '1' },
  { name: 'description', type: 'TEXT', nullable: true },
  { name: 'slug', type: 'VARCHAR(255)', unique: true, nullable: false },
  { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: '1' }
]

export const columnSets = [
  {
    name: 'Audit Trail',
    columns: [
      { name: 'created_at', type: 'TIMESTAMP', nullable: true },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: true },
      { name: 'deleted_at', type: 'TIMESTAMP', nullable: true }
    ]
  },
  {
    name: 'SEO Bundle',
    columns: [
      { name: 'meta_title', type: 'VARCHAR(255)', nullable: true },
      { name: 'meta_description', type: 'TEXT', nullable: true },
      { name: 'meta_keywords', type: 'VARCHAR(255)', nullable: true }
    ]
  }
]
