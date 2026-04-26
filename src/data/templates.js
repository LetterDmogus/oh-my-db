export const templates = [
  {
    id: 'blog',
    name: 'Simple Blog',
    description: 'Posts, Categories, and Comments setup.',
    tables: [
      {
        id: 't1',
        name: 'posts',
        columns: [
          { id: 'c1', name: 'id', type: 'INT', primary: true, autoIncrement: true },
          { id: 'c2', name: 'title', type: 'VARCHAR(255)', nullable: false },
          { id: 'c3', name: 'content', type: 'TEXT', nullable: true },
          { id: 'c4', name: 'category_id', type: 'INT', nullable: false },
          { id: 'c5', name: 'created_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' }
        ]
      },
      {
        id: 't2',
        name: 'categories',
        columns: [
          { id: 'c6', name: 'id', type: 'INT', primary: true, autoIncrement: true },
          { id: 'c7', name: 'name', type: 'VARCHAR(255)', nullable: false }
        ]
      }
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Starter',
    description: 'Products, Orders, and Users.',
    tables: [
      {
        id: 't3',
        name: 'products',
        columns: [
          { id: 'c8', name: 'id', type: 'INT', primary: true, autoIncrement: true },
          { id: 'c9', name: 'name', type: 'VARCHAR(255)', nullable: false },
          { id: 'c10', name: 'price', type: 'DECIMAL(10,2)', nullable: false },
          { id: 'c11', name: 'stock', type: 'INT', nullable: false }
        ]
      },
      {
        id: 't4',
        name: 'users',
        columns: [
          { id: 'c12', name: 'id', type: 'INT', primary: true, autoIncrement: true },
          { id: 'c13', name: 'email', type: 'VARCHAR(255)', nullable: false },
          { id: 'c14', name: 'password', type: 'VARCHAR(255)', nullable: false }
        ]
      }
    ]
  }
]
