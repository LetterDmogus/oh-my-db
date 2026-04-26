export async function askAI(prompt, apiKey) {
    if (!apiKey) throw new Error('API Key Groq belum diatur!')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `Anda adalah pakar arsitek database senior. 
                    Tugas Anda adalah merancang skema database yang efisien dan ternormalisasi.
                    WAJIB gunakan tool 'create_schema' untuk memberikan hasil rancangan Anda.
                    
                    Aturan:
                    1. Nama tabel dan kolom harus snake_case.
                    2. Gunakan tipe data standar: INT, BIGINT, VARCHAR(255), TEXT, BOOLEAN, DATE, DATETIME, TIMESTAMP, DECIMAL(10,2), JSON.
                    3. Berikan catatan (notes) singkat pada setiap kolom untuk menjelaskan fungsinya.
                    4. Pastikan setiap tabel memiliki primary key (biasanya bernama 'id').`
                },
                {
                    role: 'user',
                    content: `Buatkan skema database untuk: ${prompt}`
                }
            ],
            tools: [
                {
                    type: 'function',
                    function: {
                        name: 'create_schema',
                        description: 'Menyimpan rancangan skema database ke aplikasi.',
                        parameters: {
                            type: 'object',
                            properties: {
                                tables: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            columns: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        name: { type: 'string' },
                                                        type: { type: 'string' },
                                                        primary: { type: 'boolean' },
                                                        unique: { type: 'boolean' },
                                                        nullable: { type: 'boolean' },
                                                        notes: { type: 'string' }
                                                    },
                                                    required: ['name', 'type']
                                                }
                                            }
                                        },
                                        required: ['name', 'columns']
                                    }
                                }
                            },
                            required: ['tables']
                        }
                    }
                }
            ],
            tool_choice: 'auto'
        })
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Gagal menghubungi AI')
    }

    const data = await response.json()
    const message = data.choices[0].message
    
    if (message.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0]
        return JSON.parse(toolCall.function.arguments)
    } else {
        try {
            const content = message.content
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) return JSON.parse(jsonMatch[0])
        } catch (e) {
            throw new Error('AI memberikan jawaban yang tidak sesuai format.')
        }
        throw new Error('AI tidak berhasil membangun skema.')
    }
}

export async function suggestColumnsAI(tableName, existingColumns, apiKey) {
    if (!apiKey) throw new Error('API Key Groq belum diatur!')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `Anda adalah asisten perancang database.
                    Berikan saran kolom yang relevan untuk sebuah tabel.
                    Hindari menyarankan kolom yang sudah ada.`
                },
                {
                    role: 'user',
                    content: `Sarankan 5 kolom tambahan untuk tabel bernama '${tableName}'. 
                    Kolom yang sudah ada: ${existingColumns.join(', ')}.`
                }
            ],
            tools: [
                {
                    type: 'function',
                    function: {
                        name: 'suggest_columns',
                        description: 'Memberikan daftar saran kolom baru.',
                        parameters: {
                            type: 'object',
                            properties: {
                                columns: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            type: { type: 'string' },
                                            notes: { type: 'string' }
                                        },
                                        required: ['name', 'type']
                                    }
                                }
                            },
                            required: ['columns']
                        }
                    }
                }
            ],
            tool_choice: { type: 'function', function: { name: 'suggest_columns' } }
        })
    })

    const data = await response.json()
    const toolCall = data.choices[0].message.tool_calls[0]
    return JSON.parse(toolCall.function.arguments).columns
}

export async function generateRealisticDataAI(tableName, columns, apiKey) {
    if (!apiKey) throw new Error('API Key Groq belum diatur!')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `Anda adalah generator data dummy realistis. 
                    Tugas Anda adalah menghasilkan 5 baris data yang masuk akal dan saling berhubungan untuk tabel tertentu.`
                },
                {
                    role: 'user',
                    content: `Hasilkan 5 baris data untuk tabel '${tableName}' dengan struktur kolom: ${JSON.stringify(columns)}.`
                }
            ],
            tools: [
                {
                    type: 'function',
                    function: {
                        name: 'generate_data',
                        description: 'Menghasilkan data dummy realistis.',
                        parameters: {
                            type: 'object',
                            properties: {
                                rows: {
                                    type: 'array',
                                    items: { type: 'object' }
                                }
                            },
                            required: ['rows']
                        }
                    }
                }
            ],
            tool_choice: { type: 'function', function: { name: 'generate_data' } }
        })
    })

    const data = await response.json()
    const toolCall = data.choices[0].message.tool_calls[0]
    return JSON.parse(toolCall.function.arguments).rows
}
