use crate::db::DbPool;
use crate::helpers::{new_id, now_iso};
use crate::models::Invoice;
use tauri::State;

const INVOICE_COLS: &str = "id, company_id, invoice_no, date, subtotal, vat_amount, total, iban, raw_data, status, file_path, created_at";

fn map_invoice_row(row: &rusqlite::Row) -> rusqlite::Result<Invoice> {
    Ok(Invoice {
        id: row.get(0)?,
        company_id: row.get(1)?,
        invoice_no: row.get(2)?,
        date: row.get(3)?,
        subtotal: row.get(4)?,
        vat_amount: row.get(5)?,
        total: row.get(6)?,
        iban: row.get(7)?,
        raw_data: row.get(8)?,
        status: row.get(9)?,
        file_path: row.get(10)?,
        created_at: row.get(11)?,
    })
}

#[tauri::command]
pub fn create_invoice(
    pool: State<DbPool>,
    company_id: Option<String>,
    invoice_no: Option<String>,
    date: Option<String>,
    subtotal: Option<f64>,
    vat_amount: Option<f64>,
    total: Option<f64>,
    iban: Option<String>,
    raw_data: Option<String>,
    file_path: Option<String>,
) -> Result<Invoice, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let id = new_id();
    let created_at = now_iso();
    let status = "taslak".to_string();
    conn.execute(
        "INSERT INTO invoices (id, company_id, invoice_no, date, subtotal, vat_amount, total, iban, raw_data, status, file_path, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        rusqlite::params![id, company_id, invoice_no, date, subtotal, vat_amount, total, iban, raw_data, status, file_path, created_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(Invoice {
        id,
        company_id,
        invoice_no,
        date,
        subtotal,
        vat_amount,
        total,
        iban,
        raw_data,
        status,
        file_path,
        created_at,
    })
}

#[tauri::command]
pub fn update_invoice(
    pool: State<DbPool>,
    id: String,
    company_id: Option<String>,
    invoice_no: Option<String>,
    date: Option<String>,
    subtotal: Option<f64>,
    vat_amount: Option<f64>,
    total: Option<f64>,
    iban: Option<String>,
    raw_data: Option<String>,
    file_path: Option<String>,
) -> Result<(), String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE invoices SET company_id=?1, invoice_no=?2, date=?3, subtotal=?4, vat_amount=?5, total=?6, iban=?7, raw_data=?8, file_path=?9 WHERE id=?10",
        rusqlite::params![company_id, invoice_no, date, subtotal, vat_amount, total, iban, raw_data, file_path, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_invoices(pool: State<DbPool>) -> Result<Vec<Invoice>, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let sql = format!("SELECT {} FROM invoices ORDER BY created_at DESC", INVOICE_COLS);
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let mapped = stmt.query_map([], map_invoice_row).map_err(|e| e.to_string())?;
    mapped.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_invoice(pool: State<DbPool>, id: String) -> Result<Invoice, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let sql = format!("SELECT {} FROM invoices WHERE id = ?1", INVOICE_COLS);
    conn.query_row(&sql, rusqlite::params![id], map_invoice_row)
        .map_err(|e| e.to_string())
}

/// Approves a draft invoice. If it has company_id + invoice_no + total, also
/// creates a ledger_entry for that company. This is the ONLY place AI/manually
/// imported invoice data reaches the ledger, and only via this explicit action.
#[tauri::command]
pub fn approve_invoice(pool: State<DbPool>, id: String) -> Result<(), String> {
    let mut conn = pool.0.get().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let invoice = tx
        .query_row(
            &format!("SELECT {} FROM invoices WHERE id = ?1", INVOICE_COLS),
            rusqlite::params![id],
            map_invoice_row,
        )
        .map_err(|e| e.to_string())?;

    tx.execute(
        "UPDATE invoices SET status = 'onaylandı' WHERE id = ?1",
        rusqlite::params![id],
    )
    .map_err(|e| e.to_string())?;

    if let (Some(company_id), Some(total)) = (invoice.company_id.clone(), invoice.total) {
        let description = match &invoice.invoice_no {
            Some(no) => format!("Fatura #{} onaylandi", no),
            None => "Fatura onaylandi".to_string(),
        };
        let entry_id = new_id();
        let created_at = now_iso();
        let date = invoice.date.clone().unwrap_or_else(|| created_at.clone());

        tx.execute(
            "INSERT INTO ledger_entries (id, company_id, date, document_no, description, debit, credit, running_balance, entry_type, created_at) VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, 0, 'fatura', ?7)",
            rusqlite::params![entry_id, company_id, date, invoice.invoice_no, description, total, created_at],
        )
        .map_err(|e| e.to_string())?;

        // Recompute running balances for this company inline (avoid cross-module import cycle).
        let mut stmt = tx
            .prepare("SELECT id, debit, credit FROM ledger_entries WHERE company_id = ?1 ORDER BY date ASC, created_at ASC")
            .map_err(|e| e.to_string())?;
        let rows: Vec<(String, f64, f64)> = stmt
            .query_map(rusqlite::params![company_id], |row| {
                Ok((row.get(0)?, row.get(1)?, row.get(2)?))
            })
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;
        drop(stmt);

        let mut running = 0.0f64;
        for (eid, debit, credit) in &rows {
            running += debit - credit;
            tx.execute(
                "UPDATE ledger_entries SET running_balance = ?1 WHERE id = ?2",
                rusqlite::params![running, eid],
            )
            .map_err(|e| e.to_string())?;
        }
        tx.execute(
            "UPDATE companies SET balance = ?1 WHERE id = ?2",
            rusqlite::params![running, company_id],
        )
        .map_err(|e| e.to_string())?;
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn reject_invoice(pool: State<DbPool>, id: String) -> Result<(), String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE invoices SET status = 'reddedildi' WHERE id = ?1",
        rusqlite::params![id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn check_import_hash(pool: State<DbPool>, hash: String) -> Result<bool, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM import_hashes WHERE file_hash = ?1",
            rusqlite::params![hash],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    Ok(count > 0)
}

#[tauri::command]
pub fn record_import_hash(pool: State<DbPool>, hash: String, file_name: Option<String>) -> Result<(), String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let id = new_id();
    let imported_at = now_iso();
    conn.execute(
        "INSERT INTO import_hashes (id, file_hash, file_name, imported_at) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![id, hash, file_name, imported_at],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
