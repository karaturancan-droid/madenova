use crate::db::DbPool;
use crate::helpers::{new_id, now_iso, soft_delete};
use crate::models::TaxItem;
use tauri::State;

fn map_tax_row(row: &rusqlite::Row) -> rusqlite::Result<TaxItem> {
    Ok(TaxItem {
        id: row.get(0)?,
        tax_type: row.get(1)?,
        period: row.get(2)?,
        amount: row.get(3)?,
        due_date: row.get(4)?,
        status: row.get(5)?,
        receipt_path: row.get(6)?,
        notes: row.get(7)?,
        created_at: row.get(8)?,
    })
}

const TAX_COLS: &str = "id, type, period, amount, due_date, status, receipt_path, notes, created_at";

#[tauri::command]
pub fn create_tax_item(
    pool: State<DbPool>,
    r#type: String,
    period: Option<String>,
    amount: f64,
    due_date: String,
    notes: Option<String>,
) -> Result<TaxItem, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let id = new_id();
    let created_at = now_iso();
    let status = "bekliyor".to_string();
    conn.execute(
        "INSERT INTO tax_items (id, type, period, amount, due_date, status, receipt_path, notes, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, NULL, ?7, ?8)",
        rusqlite::params![id, r#type, period, amount, due_date, status, notes, created_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(TaxItem {
        id,
        tax_type: r#type,
        period,
        amount,
        due_date,
        status,
        receipt_path: None,
        notes,
        created_at,
    })
}

#[tauri::command]
pub fn update_tax_item(
    pool: State<DbPool>,
    id: String,
    r#type: String,
    period: Option<String>,
    amount: f64,
    due_date: String,
    status: String,
    receipt_path: Option<String>,
    notes: Option<String>,
) -> Result<(), String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE tax_items SET type=?1, period=?2, amount=?3, due_date=?4, status=?5, receipt_path=?6, notes=?7 WHERE id=?8",
        rusqlite::params![r#type, period, amount, due_date, status, receipt_path, notes, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_tax_items(pool: State<DbPool>) -> Result<Vec<TaxItem>, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let sql = format!("SELECT {} FROM tax_items ORDER BY due_date ASC", TAX_COLS);
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let mapped = stmt.query_map([], map_tax_row).map_err(|e| e.to_string())?;
    mapped.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_tax_item(pool: State<DbPool>, id: String) -> Result<(), String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    soft_delete(&conn, "tax_items", "tax_item", &id)
}

#[tauri::command]
pub fn refresh_overdue_tax_items(pool: State<DbPool>) -> Result<(), String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    refresh_overdue_tax_items_conn(&conn)
}

pub fn refresh_overdue_tax_items_conn(conn: &rusqlite::Connection) -> Result<(), String> {
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
    conn.execute(
        "UPDATE tax_items SET status = 'gecikti' WHERE due_date < ?1 AND status = 'bekliyor'",
        rusqlite::params![today],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
