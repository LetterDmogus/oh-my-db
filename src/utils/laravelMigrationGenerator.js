export function generateLaravelMigration(project, selectedTableIds = null) {
    let php = `<?php\n\n`;
    php += `use Illuminate\\Database\\Migrations\\Migration;\n`;
    php += `use Illuminate\\Database\\Schema\\Blueprint;\n`;
    php += `use Illuminate\\Support\\Facades\\Schema;\n\n`;
    php += `return new class extends Migration\n{\n`;
    php += `    /**\n     * Run the migrations.\n     */\n`;
    php += `    public function up(): void\n    {\n`;

    const tablesToExport = selectedTableIds 
        ? project.tables.filter(t => selectedTableIds.includes(t.id))
        : project.tables;

    tablesToExport.forEach(table => {
        php += `        Schema::create('${table.name}', function (Blueprint $table) {\n`;
        
        const columnNames = table.columns.map(c => c.name);
        const hasTimestamps = columnNames.includes('created_at') && columnNames.includes('updated_at');

        table.columns.forEach(col => {
            if (hasTimestamps && (col.name === 'created_at' || col.name === 'updated_at')) return;
            if (col.name === 'id' && col.primary && (col.type === 'INT' || col.type === 'BIGINT')) {
                php += `            $table->id();\n`;
                return;
            }
            if (col.references) {
                const targetTable = project.tables.find(t => t.id === col.references.tableId);
                if (targetTable) {
                    php += `            $table->foreignId('${col.name}')->constrained('${targetTable.name}')`;
                    if (col.nullable) php += '->nullable()';
                    php += ';\n';
                    return;
                }
            }
            let method = 'string';
            const type = col.type.toUpperCase();
            
            // Handle Custom ENUM
            if (type.startsWith('ENUM:')) {
                const enumName = col.type.replace('ENUM:', '').toLowerCase();
                const targetEnum = project.enums?.find(e => e.name.toLowerCase() === enumName);
                if (targetEnum) {
                    const values = targetEnum.values.map(v => `'${v.replace(/'/g, "''")}'`).join(', ');
                    php += `            $table->enum('${col.name}', [${values}])`;
                    if (col.unique) php += '->unique()';
                    if (col.nullable) php += '->nullable()';
                    if (col.defaultValue) php += `->default('${col.defaultValue}')`;
                    php += ';\n';
                    return;
                }
            }

            if (type.includes('INT')) method = 'integer';
            if (type.includes('BIGINT')) method = 'bigInteger';
            if (type.includes('TEXT')) method = 'text';
            if (type.includes('BOOLEAN') || type.includes('TINYINT(1)')) method = 'boolean';
            if (type.includes('DECIMAL')) method = 'decimal';
            if (type.includes('DATE')) method = 'date';
            if (type.includes('DATETIME')) method = 'dateTime';
            if (type.includes('TIMESTAMP')) method = 'timestamp';
            if (type.includes('JSON')) method = 'json';
            php += `            $table->${method}('${col.name}')`;
            if (col.unique) php += '->unique()';
            if (col.nullable) php += '->nullable()';
            if (col.defaultValue && col.defaultValue !== 'CURRENT_TIMESTAMP') {
                php += `->default('${col.defaultValue}')`;
            } else if (col.defaultValue === 'CURRENT_TIMESTAMP') {
                php += `->useCurrent()`;
            }
            php += ';\n';
        });
        if (hasTimestamps) php += `            $table->timestamps();\n`;
        php += `        });\n\n`;
    });

    php += `    }\n\n`;
    php += `    /**\n     * Reverse the migrations.\n     */\n`;
    php += `    public function down(): void\n    {\n`;
    [...tablesToExport].reverse().forEach(table => {
        php += `        Schema::dropIfExists('${table.name}');\n`;
    });
    php += `    }\n};\n`;
    return php;
}
