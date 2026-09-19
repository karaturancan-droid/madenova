use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::Connection;
use std::path::Path;

pub type DbPoolInner = Pool<SqliteConnectionManager>;

pub struct DbPool(pub DbPoolInner);

pub fn create_pool(app_data_dir: &Path) -> DbPoolInner {
    let db_path = app_data_dir.join("madenova.db");
    let manager = SqliteConnectionManager::file(db_path).with_init(|c| {
        c.execute_batch("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;")?;
        Ok(())
    });
    Pool::builder()
        .max_size(8)
        .build(manager)
        .expect("failed to create sqlite connection pool")
}

/// Runs all migrations idempotently. Safe to call on every app startup.
pub fn run_migrations(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch("PRAGMA foreign_keys = ON;")?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL
        )",
        [],
    )?;

    let migrations: Vec<(i64, &str)> = vec![(1, "initial_schema")];

    for (version, _name) in migrations {
        let already_applied: bool = conn
            .query_row(
                "SELECT COUNT(*) FROM schema_migrations WHERE version = ?1",
                [version],
                |row| row.get::<_, i64>(0),
            )
            .map(|c| c > 0)
            .unwrap_or(false);

        if !already_applied {
            match version {
                1 => migration_1_initial_schema(conn)?,
                _ => {}
            }
            conn.execute(
                "INSERT INTO schema_migrations (version, applied_at) VALUES (?1, ?2)",
                rusqlite::params![version, chrono::Utc::now().to_rfc3339()],
            )?;
        }
    }

    Ok(())
}

fn migration_1_initial_schema(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS companies (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            tax_no TEXT,
            phone TEXT,
            email TEXT,
            contact_person TEXT,
            balance REAL NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ledger_entries (
            id TEXT PRIMARY KEY,
            company_id TEXT NOT NULL,
            date TEXT NOT NULL,
            document_no TEXT,
            description TEXT,
            debit REAL NOT NULL DEFAULT 0,
            credit REAL NOT NULL DEFAULT 0,
            running_balance REAL NOT NULL DEFAULT 0,
            entry_type TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS recycle_bin (
            id TEXT PRIMARY KEY,
            entity_type TEXT NOT NULL,
            record_data TEXT NOT NULL,
            deleted_at TEXT NOT NULL,
            restore_deadline TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            sku TEXT,
            category TEXT,
            unit TEXT,
            purchase_price REAL DEFAULT 0,
            sale_price REAL DEFAULT 0,
            min_stock REAL DEFAULT 0,
            current_stock REAL DEFAULT 0,
            supplier TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS stock_movements (
            id TEXT PRIMARY KEY,
            product_id TEXT NOT NULL,
            type TEXT NOT NULL,
            quantity REAL NOT NULL,
            date TEXT NOT NULL,
            note TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS vehicles (
            id TEXT PRIMARY KEY,
            plate TEXT NOT NULL,
            brand TEXT,
            model TEXT,
            year INTEGER,
            status TEXT,
            km REAL,
            inspection_due_date TEXT,
            insurance_due_date TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS vehicle_expenses (
            id TEXT PRIMARY KEY,
            vehicle_id TEXT NOT NULL,
            type TEXT,
            amount REAL NOT NULL DEFAULT 0,
            date TEXT NOT NULL,
            note TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tires (
            id TEXT PRIMARY KEY,
            vehicle_id TEXT NOT NULL,
            position TEXT,
            dot_code TEXT,
            tread_depth REAL,
            change_date TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tax_items (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            period TEXT,
            amount REAL NOT NULL DEFAULT 0,
            due_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'bekliyor',
            receipt_path TEXT,
            notes TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS workers (
            id TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            tc_no TEXT,
            birth_date TEXT,
            hire_date TEXT,
            exit_date TEXT,
            position TEXT,
            sgk_no TEXT,
            iban TEXT,
            salary REAL DEFAULT 0,
            contract_end_date TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS leaves (
            id TEXT PRIMARY KEY,
            worker_id TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            type TEXT,
            days REAL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS overtimes (
            id TEXT PRIMARY KEY,
            worker_id TEXT NOT NULL,
            date TEXT NOT NULL,
            hours REAL NOT NULL,
            rate REAL NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS payrolls (
            id TEXT PRIMARY KEY,
            worker_id TEXT NOT NULL,
            period TEXT NOT NULL,
            gross REAL,
            net REAL,
            deductions REAL,
            status TEXT,
            receipt_path TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT,
            file_type TEXT,
            file_path TEXT,
            related_type TEXT,
            related_id TEXT,
            expiry_date TEXT,
            tags TEXT,
            notes TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            module TEXT NOT NULL,
            related_id TEXT,
            due_date TEXT,
            days_left INTEGER,
            status TEXT NOT NULL DEFAULT 'aktif',
            source_type TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS invoices (
            id TEXT PRIMARY KEY,
            company_id TEXT,
            invoice_no TEXT,
            date TEXT,
            subtotal REAL,
            vat_amount REAL,
            total REAL,
            iban TEXT,
            raw_data TEXT,
            status TEXT NOT NULL DEFAULT 'taslak',
            file_path TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE TABLE IF NOT EXISTS import_hashes (
            id TEXT PRIMARY KEY,
            file_hash TEXT NOT NULL UNIQUE,
            file_name TEXT,
            imported_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS asistan_messages (
            id TEXT PRIMARY KEY,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            suggested_action TEXT
        );
        "#,
    )
}
