export function generateSQL(project, selectedTableIds = null) {
  let sql = `-- SQL Generated for ${project.name}\n`;
  sql += `-- Dialect: ${project.dialect}\n`;
  sql += `-- Created At: ${new Date().toLocaleString()}\n\n`;

  const tablesToExport = selectedTableIds 
    ? project.tables.filter(t => selectedTableIds.includes(t.id))
    : project.tables;

  tablesToExport.forEach(table => {
    sql += `CREATE TABLE \`${table.name}\` (\n`;
    
    const columnDefinitions = table.columns.map(column => {
      let type = column.type;
      
      // Handle Custom ENUM Type
      if (type.startsWith('ENUM:')) {
          const enumName = type.replace('ENUM:', '').toLowerCase();
          const targetEnum = project.enums?.find(e => e.name.toLowerCase() === enumName);
          if (targetEnum) {
              const values = targetEnum.values.map(v => `'${v.replace(/'/g, "''")}'`).join(', ');
              type = `ENUM(${values})`;
          } else {
              type = 'VARCHAR(255)'; // Fallback jika enum tidak ditemukan
          }
      }

      let def = `  \`${column.name}\` ${type}`;
      
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
