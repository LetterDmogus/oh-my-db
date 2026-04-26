export function generateLaravelSeeder(project, selectedTableIds = null) {
    let php = `<?php\n\n`;
    php += `namespace Database\\Seeders;\n\n`;
    php += `use Illuminate\\Database\\Seeder;\n`;
    php += `use Illuminate\\Support\\Facades\\DB;\n\n`;
    php += `class DatabaseSeeder extends Seeder\n{\n`;
    php += `    /**\n     * Seed the application's database.\n     */\n`;
    php += `    public function run(): void\n    {\n`;

    const tablesToExport = selectedTableIds 
        ? project.tables.filter(t => selectedTableIds.includes(t.id))
        : project.tables;

    tablesToExport.forEach(table => {
        if (table.data && table.data.length > 0) {
            php += `        DB::table('${table.name}')->insert([\n`;
            
            table.data.forEach(row => {
                php += `            [\n`;
                Object.entries(row).forEach(([key, value]) => {
                    let formattedValue = value;
                    if (typeof value === 'string') {
                        formattedValue = `'${value.replace(/'/g, "\\'")}'`;
                    } else if (value === null || value === '') {
                        formattedValue = 'null';
                    }
                    
                    php += `                '${key}' => ${formattedValue},\n`;
                });
                php += `            ],\n`;
            });
            
            php += `        ]);\n\n`;
        }
    });

    php += `    }\n}\n`;
    return php;
}
