import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export const useProjectStore = defineStore('project', () => {
  const projects = ref(JSON.parse(localStorage.getItem('projects') || '[]'))
  const userLibraries = ref(JSON.parse(localStorage.getItem('user_libraries') || '[]'))
  const groqApiKey = ref(localStorage.getItem('groq_api_key') || '')
  const darkMode = ref(localStorage.getItem('dark_mode') === 'true')
  const activeProjectId = ref(null)
  
  // Undo/Redo Stacks
  const history = ref([])
  const future = ref([])

  const activeProject = computed(() => {
    return projects.value.find(p => p.id === activeProjectId.value)
  })

  function saveToLocalStorage() {
    localStorage.setItem('projects', JSON.stringify(projects.value))
    localStorage.setItem('user_libraries', JSON.stringify(userLibraries.value))
    localStorage.setItem('groq_api_key', groqApiKey.value)
    localStorage.setItem('dark_mode', darkMode.value)
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
    saveToLocalStorage()
  }

  function updateApiKey(key) {
    groqApiKey.value = key
    saveToLocalStorage()
  }

  function recordHistory() {
    history.value.push(JSON.stringify(projects.value))
    if (history.value.length > 50) history.value.shift()
    future.value = []
  }

  function undo() {
    if (history.value.length === 0) return
    future.value.push(JSON.stringify(projects.value))
    const previous = JSON.parse(history.value.pop())
    projects.value = previous
    saveToLocalStorage()
  }

  function redo() {
    if (future.value.length === 0) return
    history.value.push(JSON.stringify(projects.value))
    const next = JSON.parse(future.value.pop())
    projects.value = next
    saveToLocalStorage()
  }

  function createProject(name, dialect = 'mysql') {
    recordHistory()
    const newProject = {
      id: uuidv4(),
      name,
      dialect,
      notation: 'crows_foot',
      tables: [],
      notes: [],
      enums: [],
      snapshots: [],
      createdAt: new Date().toISOString()
    }
    projects.value.push(newProject)
    saveToLocalStorage()
    return newProject
  }

  function takeSnapshot(projectId, label = 'Auto Snapshot') {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
        if (!project.snapshots) project.snapshots = []
        project.snapshots.push({
            id: uuidv4(),
            label,
            timestamp: new Date().toISOString(),
            data: JSON.parse(JSON.stringify({ 
                tables: project.tables, 
                enums: project.enums 
            }))
        })
        saveToLocalStorage()
    }
  }

  function deleteSnapshot(projectId, snapshotId) {
    const project = projects.value.find(p => p.id === projectId)
    if (project && project.snapshots) {
        project.snapshots = project.snapshots.filter(s => s.id !== snapshotId)
        saveToLocalStorage()
    }
  }

  function addEnum(projectId, position = null) {
    recordHistory()
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
        if (!project.enums) project.enums = []
        project.enums.push({
            id: uuidv4(),
            name: `status_type_${project.enums.length + 1}`,
            values: ['active', 'inactive'],
            position: position || { x: 150, y: 150 }
        })
        saveToLocalStorage()
    }
  }

  function updateEnum(projectId, enumId, updates) {
    const project = projects.value.find(p => p.id === projectId)
    if (project && project.enums) {
        const en = project.enums.find(e => e.id === enumId)
        if (en) {
            Object.assign(en, updates)
            saveToLocalStorage()
        }
    }
  }

  function removeEnum(projectId, enumId) {
    recordHistory()
    const project = projects.value.find(p => p.id === projectId)
    if (project && project.enums) {
        project.enums = project.enums.filter(e => e.id !== enumId)
        saveToLocalStorage()
    }
  }

  function addNote(projectId, position = null) {
    recordHistory()
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
        if (!project.notes) project.notes = []
        project.notes.push({
            id: uuidv4(),
            content: 'Catatan baru...',
            color: 'yellow',
            position: position || { x: 100, y: 100 },
            width: 200,
            height: 150
        })
        saveToLocalStorage()
    }
  }

  function updateNote(projectId, noteId, updates) {
    const project = projects.value.find(p => p.id === projectId)
    if (project && project.notes) {
        const note = project.notes.find(n => n.id === noteId)
        if (note) {
            Object.assign(note, updates)
            saveToLocalStorage()
        }
    }
  }

  function removeNote(projectId, noteId) {
    recordHistory()
    const project = projects.value.find(p => p.id === projectId)
    if (project && project.notes) {
        project.notes = project.notes.filter(n => n.id !== noteId)
        saveToLocalStorage()
    }
  }

  function deleteProject(id) {
    recordHistory()
    projects.value = projects.value.filter(p => p.id !== id)
    saveToLocalStorage()
  }

  function addTable(projectId, tableName, position = null) {
    recordHistory()
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      project.tables.push({
        id: uuidv4(),
        name: tableName || `table_${project.tables.length + 1}`,
        color: 'gray',
        width: 280,
        position: position || { x: 50 + (project.tables.length * 40), y: 50 + (project.tables.length * 40) },
        columns: [
          { id: uuidv4(), name: 'id', type: 'INT', primary: true, nullable: false, autoIncrement: true, notes: '' }
        ],
        data: []
      })
      saveToLocalStorage()
    }
  }

  function updateTableData(projectId, tableId, newData) {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      const table = project.tables.find(t => t.id === tableId)
      if (table) {
          table.data = newData
          saveToLocalStorage()
      }
    }
  }

  function removeTable(projectId, tableId) {
    recordHistory()
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      project.tables = project.tables.filter(t => t.id !== tableId)
      saveToLocalStorage()
    }
  }

  function addColumn(projectId, tableId, columnData = {}) {
    recordHistory()
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      const table = project.tables.find(t => t.id === tableId)
      if (table) {
        table.columns.push({
          id: uuidv4(),
          name: columnData.name || `column_${table.columns.length + 1}`,
          type: columnData.type || 'VARCHAR(255)',
          primary: columnData.primary || false,
          unique: columnData.unique || false,
          nullable: columnData.nullable ?? true,
          references: columnData.references || null,
          notes: columnData.notes || '',
          ...columnData
        })
        saveToLocalStorage()
      }
    }
  }

  function addTimestamps(projectId, tableId) {
    recordHistory()
    addColumn(projectId, tableId, { name: 'created_at', type: 'TIMESTAMP', nullable: true })
    addColumn(projectId, tableId, { name: 'updated_at', type: 'TIMESTAMP', nullable: true })
  }

  function updateColumn(projectId, tableId, columnId, updates) {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      const table = project.tables.find(t => t.id === tableId)
      if (table) {
        if (updates.primary === true) {
            table.columns.forEach(c => {
                if (c.id !== columnId) c.primary = false
            })
            updates.nullable = false
        }
        const column = table.columns.find(c => c.id === columnId)
        if (column) {
          Object.assign(column, updates)
          saveToLocalStorage()
        }
      }
    }
  }

  function removeColumn(projectId, tableId, columnId) {
    recordHistory()
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      const table = project.tables.find(t => t.id === tableId)
      if (table) {
        table.columns = table.columns.filter(c => c.id !== columnId)
        saveToLocalStorage()
      }
    }
  }

  function updateTable(projectId, tableId, updates) {
      const project = projects.value.find(p => p.id === projectId)
      if (project) {
        const table = project.tables.find(t => t.id === tableId)
        if (table) {
          Object.assign(table, updates)
          saveToLocalStorage()
        }
      }
  }

  function updateProject(projectId, updates) {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
        Object.assign(project, updates)
        saveToLocalStorage()
    }
  }

  function importLibrary(libraryData) {
    if (!libData.id || !libData.blocks) return false
    const exists = userLibraries.value.find(l => l.id === libraryData.id)
    if (exists) {
        if (!confirm('Library ini sudah ada. Ingin menimpanya?')) return false
        userLibraries.value = userLibraries.value.filter(l => l.id !== libraryData.id)
    }
    userLibraries.value.push(libraryData)
    saveToLocalStorage()
    return true
  }

  function deleteLibrary(id) {
    userLibraries.value = userLibraries.value.filter(l => l.id !== id)
    saveToLocalStorage()
  }

  function exportProjectAsLibrary(projectId) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return null
    return {
        id: uuidv4(),
        name: project.name,
        author: 'User',
        description: `Bundle dari proyek ${project.name}`,
        blocks: project.tables.map(t => ({
            name: t.name,
            description: `Tabel dari ${project.name}`,
            color: t.color || 'gray',
            columns: t.columns.map(c => ({
                name: c.name,
                type: c.type,
                unique: c.unique,
                nullable: c.nullable,
                notes: c.notes
            }))
        }))
    }
  }

  return {
    projects,
    userLibraries,
    groqApiKey,
    darkMode,
    toggleDarkMode,
    activeProjectId,
    activeProject,
    history,
    future,
    undo,
    redo,
    recordHistory,
    createProject,
    deleteProject,
    addTable,
    removeTable,
    takeSnapshot,
    deleteSnapshot,
    addNote,
    updateNote,
    removeNote,
    addEnum,
    updateEnum,
    removeEnum,
    addColumn,
    updateColumn,
    removeColumn,
    updateTable,
    updateProject,
    updateTableData,
    addTimestamps,
    saveToLocalStorage,
    importLibrary,
    deleteLibrary,
    exportProjectAsLibrary,
    updateApiKey
  }
})
