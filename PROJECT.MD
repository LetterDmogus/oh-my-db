ini aplikasi yang bisa bantuin saya di tugas sekolah ataupun kelompok. Jadi ini itu kayak SQL Table Builder. Nanti user bisa build database, nanti di database ini ada schema berbasis JSON gitu, bisa buat tabel baru dengan column nya, dan bagus nya dari sistem ini adalah sistem config yang bisa otomatis deteksi tipe data dan nama kolom dan generate data dummy gitu. Serta fitur collaboration dengan user lain dalam membangun database schema. Nanti pas udah selesai, bisa di export jadi SQL. Di sistem nya dia akan menyimpan dalam bentuk JSON. 

/login, /register
/dashboard              → list semua project user
/projects/create        → buat project baru (nama, dialect)
/projects/{id}          → THE MAIN PAGE — table builder canvas
/templates              → pilih starter template

✅ Multi-table builder dalam satu database project
✅ Column editor (nama, tipe data, constraints)  
✅ SQL Generator & Export (.sql file)
✅ Export / Import JSON schema (untuk sharing antar teman)
✅ Template starter (e-commerce, blog, sekolah, dll)
✅ UI yang clean — bukan phpMyAdmin yang overwhelming

src/
├── components/
│   ├── layout/
│   │   ├── AppNavbar.vue
│   │   └── AppSidebar.vue
│   ├── table/
│   │   ├── TableCard.vue
│   │   └── ColumnRow.vue
│   └── ui/
│       ├── BaseModal.vue
│       └── BaseButton.vue
├── stores/
│   └── useProjectStore.js
├── utils/
│   ├── sqlGenerator.js
│   └── typeDetector.js
├── data/
│   └── templates.js
├── views/
│   ├── HomeView.vue
│   ├── ProjectView.vue
│   └── TemplatesView.vue
└── router/
    └── index.js
