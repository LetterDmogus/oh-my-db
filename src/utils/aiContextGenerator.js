/**
 * AI Context Generator
 * Menghasilkan ringkasan skema database yang dioptimalkan untuk LLM (Claude, GPT, Gemini).
 */

export function generateAIContext(project) {
    let md = `# Database Schema Context: ${project.name}\n`;
    md += `Dialect: ${project.dialect}\n`;
    md += `Generated At: ${new Date().toLocaleString()}\n\n`;

    if (project.notes && project.notes.length > 0) {
        md += `## Architecture Decisions & Notes\n`;
        project.notes.forEach((note, i) => {
            md += `### Note #${i + 1}\n${note.content}\n\n`;
        });
    }

    if (project.enums && project.enums.length > 0) {
        md += `## Custom Data Types (Enums)\n`;
        project.enums.forEach(en => {
            md += `- **${en.name.toUpperCase()}**: [${en.values.join(', ')}]\n`;
        });
        md += `\n`;
    }

    md += `## Table Definitions\n`;
    project.tables.forEach(table => {
        md += `### Table: ${table.name}\n`;
        md += `| Column | Type | Constraints | References | Description |\n`;
        md += `|--------|------|-------------|------------|-------------|\n`;
        
        table.columns.forEach(col => {
            let constraints = [];
            if (col.primary) constraints.push('PRIMARY KEY');
            if (col.autoIncrement) constraints.push('AUTO_INCREMENT');
            if (col.unique) constraints.push('UNIQUE');
            if (!col.nullable) constraints.push('NOT NULL');
            if (col.defaultValue) constraints.push(`DEFAULT: ${col.defaultValue}`);

            let refStr = '-';
            if (col.references) {
                const targetTable = project.tables.find(t => t.id === col.references.tableId);
                const targetCol = targetTable?.columns.find(c => c.id === col.references.columnId);
                if (targetTable) {
                    refStr = `${targetTable.name}.${targetCol?.name || 'id'}`;
                }
            }

            const colNotes = col.notes ? col.notes.replace(/\n/g, ' ') : '-';
            md += `| ${col.name} | ${col.type} | ${constraints.join(', ') || '-'} | ${refStr} | ${colNotes} |\n`;
        });
        
        if (table.notes) {
            md += `\n*Table Notes: ${table.notes}*\n`;
        }
        md += `\n`;
    });

    md += `\n---\n*Instructions for AI:* Use this schema as the source of truth for generating migrations, models, or API endpoints. Respect the relationships and data types defined above.`;

    return md;
}
