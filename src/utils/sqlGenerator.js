export function generateSQL(project) {
  let sql = `-- SQL Generated for ${project.name}\n`;
  sql += `-- Dialect: ${project.dialect}\n`;
  sql += `-- Created At: ${new Date().toLocaleString()}\n\n`;

  project.tables.forEach(table => {
    sql += `CREATE TABLE \`${table.name}\` (\n`;
    
    const columnDefinitions = table.columns.map(column => {
      let def = `  \`${column.name}\` ${column.type}`;
      
      if (column.nullable === false || column.primary) def += ' NOT NULL';
      if (column.unique) def += ' UNIQUE';
      if (column.autoIncrement) def += ' AUTO_INCREMENT';
      if (column.defaultValue) {
          if (column.defaultValue === 'CURRENT_TIMESTAMP') {
              def += ' DEFAULT CURRENT_TIMESTAMP';
          } else {
              def += ` DEFAULT '${column.defaultValue}'`;
          }
      }
      if (column.primary) def += ' PRIMARY KEY';
      
      return def;
    });

    const foreignKeys = table.columns
      .filter(col => col.references && col.references.tableId)
      .map(col => {
        const targetTable = project.tables.find(t => t.id === col.references.tableId);
        if (!targetTable) return null;
        const targetPk = targetTable.columns.find(c => c.primary) || targetTable.columns[0];
        return `  FOREIGN KEY (\`${col.name}\`) REFERENCES \`${targetTable.name}\`(\`${targetPk.name}\`)`;
      })
      .filter(fk => fk !== null);

    const allLines = [...columnDefinitions, ...foreignKeys];
    sql += allLines.join(',\n');
    sql += `\n);\n\n`;

    // Add INSERT INTO statements
    if (table.data && table.data.length > 0) {
        table.data.forEach(row => {
            const keys = Object.keys(row);
            const values = Object.values(row).map(val => {
                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                if (val === null) return 'NULL';
                return val;
            });
            sql += `INSERT INTO \`${table.name}\` (\`${keys.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
        });
        sql += `\n`;
    }
  });

  return sql;
}
