Bug fixes dan User experience
- Bug pada menu export menjadi sql, bagian enum tidak di render dengan benar.
- Bug pada import JSON, aplikasinya tidak render section ENUM. sehingga data datatype nya error.
- Buat foreign key connect nya juga bisa berlaku selain pada id, dia langsung cari yang unique dan cocokan, misalnya session_public_key, dia akan mencari kolom public_key di tabel sessions.
- Pendeteksi jika suatu kata berakhiran -ies, berarti singular nya itu y, misalnya category dan categories.
- Fitur buat otomatis mendeteksi ENUM jika mengetik nama column yang sama dengan nama ENUM nya.
