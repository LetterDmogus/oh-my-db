/**
 * Schema Auditor
 * Mengevaluasi skema database berdasarkan best practices dan standar SQL.
 */

export function auditSchema(project) {
    const issues = [];

    if (!project.tables || project.tables.length === 0) {
        return [{ type: 'info', message: 'Mulai dengan menambahkan tabel pertama Anda.' }];
    }

    project.tables.forEach(table => {
        // 1. Cek Primary Key
        const hasPk = table.columns.some(c => c.primary);
        if (!hasPk) {
            issues.push({
                type: 'error',
                table: table.name,
                message: `Tabel "${table.name}" tidak memiliki Primary Key.`,
                tip: 'Setiap tabel wajib memiliki kunci unik (biasanya kolom "id") untuk mengidentifikasi baris data.'
            });
        }

        // 2. Cek Penamaan (Lowercase & No Spaces)
        if (/[A-Z]/.test(table.name) || /\s/.test(table.name)) {
            issues.push({
                type: 'warning',
                table: table.name,
                message: `Nama tabel "${table.name}" mengandung huruf kapital atau spasi.`,
                tip: 'Gunakan snake_case (huruf kecil dan underscore) agar konsisten di berbagai sistem operasi.'
            });
        }

        // 3. Cek Relasi (Foreign Key Integrity)
        table.columns.forEach(col => {
            if (col.references) {
                const targetTable = project.tables.find(t => t.id === col.references.tableId);
                if (!targetTable) {
                    issues.push({
                        type: 'error',
                        table: table.name,
                        message: `Relasi pada "${col.name}" merujuk ke tabel yang sudah dihapus.`,
                        tip: 'Hapus relasi ini atau hubungkan kembali ke tabel yang ada.'
                    });
                } else {
                    const targetPk = targetTable.columns.find(c => c.id === col.references.columnId);
                    // Cek tipe data FK harus sama dengan PK
                    if (targetPk && col.type !== targetPk.type) {
                        issues.push({
                            type: 'warning',
                            table: table.name,
                            message: `Tipe data "${col.name}" (${col.type}) berbeda dengan referensinya "${targetTable.name}.${targetPk.name}" (${targetPk.type}).`,
                            tip: 'Foreign Key harus memiliki tipe data yang identik dengan Primary Key yang dirujuk.'
                        });
                    }
                }
            }

            // 4. Cek Tipe Data Enum Kustom
            if (col.type.startsWith('ENUM:')) {
                const enumName = col.type.replace('ENUM:', '').toLowerCase();
                const exists = project.enums?.some(e => e.name.toLowerCase() === enumName);
                if (!exists) {
                    issues.push({
                        type: 'error',
                        table: table.name,
                        message: `Kolom "${col.name}" menggunakan Enum "${enumName}" yang tidak ada.`,
                        tip: 'Buat blok Enum dengan nama tersebut atau ganti tipe datanya.'
                    });
                }
            }
        });

        // 5. Cek Duplikasi Nama Kolom
        const colNames = table.columns.map(c => c.name.toLowerCase());
        const duplicates = colNames.filter((item, index) => colNames.indexOf(item) !== index);
        if (duplicates.length > 0) {
            issues.push({
                type: 'error',
                table: table.name,
                message: `Tabel "${table.name}" memiliki nama kolom duplikat: ${duplicates.join(', ')}.`,
                tip: 'Setiap kolom dalam satu tabel harus memiliki nama yang unik.'
            });
        }
    });

    // 6. Cek Enum yang tidak terpakai
    project.enums?.forEach(en => {
        const isUsed = project.tables.some(t => 
            t.columns.some(c => c.type === `ENUM:${en.name.toUpperCase()}`)
        );
        if (!isUsed) {
            issues.push({
                type: 'info',
                message: `Blok Enum "${en.name}" tidak digunakan oleh kolom mana pun.`,
                tip: 'Jika tidak diperlukan, Anda bisa menghapusnya untuk merapikan canvas.'
            });
        }
    });

    return issues;
}
