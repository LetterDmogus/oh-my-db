/**
 * SQL Diff Generator
 * Membandingkan skema saat ini dengan snapshot untuk menghasilkan query migrasi (ALTER TABLE).
 */

export function generateSQLDiff(currentProject, snapshot) {
    let sql = `-- SQL Migration Diff\n`;
    sql += `-- From Snapshot: ${snapshot.label} (${new Date(snapshot.timestamp).toLocaleString()})\n`;
    sql += `-- Generated At: ${new Date().toLocaleString()}\n\n`;

    const currentTables = currentProject.tables;
    const oldTables = snapshot.data.tables;

    // 1. Deteksi Tabel Baru (CREATE)
    currentTables.forEach(table => {
        const oldTable = oldTables.find(t => t.id === table.id);
        if (!oldTable) {
            sql += `-- New Table: ${table.name}\n`;
            sql += `CREATE TABLE \`${table.name}\` (\n`;
            const cols = table.columns.map(c => `  \`${c.name}\` ${c.type}${c.primary ? ' PRIMARY KEY' : ''}${!c.nullable ? ' NOT NULL' : ''}`);
            sql += cols.join(',\n');
            sql += `\n);\n\n`;
        }
    });

    // 2. Deteksi Tabel Dihapus (DROP)
    oldTables.forEach(table => {
        const currentTable = currentTables.find(t => t.id === table.id);
        if (!currentTable) {
            sql += `-- Table Deleted\n`;
            sql += `DROP TABLE IF EXISTS \`${table.name}\`;\n\n`;
        }
    });

    // 3. Deteksi Perubahan di Dalam Tabel (ALTER)
    currentTables.forEach(table => {
        const oldTable = oldTables.find(t => t.id === table.id);
        if (oldTable) {
            let tableAlterations = [];

            // A. Cek Kolom Baru (ADD)
            table.columns.forEach(col => {
                const oldCol = oldTable.columns.find(c => c.id === col.id);
                if (!oldCol) {
                    tableAlterations.push(`ADD COLUMN \`${col.name}\` ${col.type}${!col.nullable ? ' NOT NULL' : ''}`);
                }
            });

            // B. Cek Kolom Dihapus (DROP)
            oldTable.columns.forEach(col => {
                const currentCol = table.columns.find(c => c.id === col.id);
                if (!currentCol) {
                    tableAlterations.push(`DROP COLUMN \`${col.name}\``);
                }
            });

            // C. Cek Perubahan Atribut Kolom (MODIFY)
            table.columns.forEach(col => {
                const oldCol = oldTable.columns.find(c => c.id === col.id);
                if (oldCol) {
                    const typeChanged = col.type !== oldCol.type;
                    const nullChanged = col.nullable !== oldCol.nullable;
                    const nameChanged = col.name !== oldCol.name;

                    if (typeChanged || nullChanged || nameChanged) {
                        // Jika nama berubah, gunakan CHANGE (MySQL) atau RENAME (Postgres)
                        // Untuk simplicity Versi 1.0, kita gunakan sintaks MySQL standard
                        if (nameChanged) {
                            tableAlterations.push(`CHANGE COLUMN \`${oldCol.name}\` \`${col.name}\` ${col.type}${!col.nullable ? ' NOT NULL' : ''}`);
                        } else {
                            tableAlterations.push(`MODIFY COLUMN \`${col.name}\` ${col.type}${!col.nullable ? ' NOT NULL' : ''}`);
                        }
                    }
                }
            });

            if (tableAlterations.length > 0) {
                sql += `-- Alterations for ${table.name}\n`;
                sql += `ALTER TABLE \`${table.name}\` \n  ${tableAlterations.join(',\n  ')};\n\n`;
            }
        }
    });

    if (sql.split('\n').length <= 5) {
        return sql + "-- No changes detected between current schema and snapshot.";
    }

    return sql;
}
