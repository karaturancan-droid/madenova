use crate::db::DbPool;
use crate::helpers::{new_id, now_iso, soft_delete};
use crate::models::Document;
use tauri::State;

fn map_document_row(row: &rusqlite::Row) -> rusqlite::Result<Document> {
    Ok(Document {
        id: row.get(0)?,
        title: row.get(1)?,
        category: row.get(2)?,
        file_type: row.get(3)?,
        file_path: row.get(4)?,
        related_type: row.get(5)?,
        related_id: row.get(6)?,
        expiry_date: row.get(7)?,
        tags: row.get(8)?,
        notes: row.get(9)?,
        created_at: row.get(10)?,
    })
}

const DOC_COLS: &str = "id, title, category, file_type, file_path, related_type, related_id, expiry_date, tags, notes, created_at";

#[tauri::command]
pub fn create_document(
    pool: State<DbPool>,
    title: String,
    category: Option<String>,
    file_type: Option<String>,
    file_path: Option<String>,
    related_type: Option<String>,
    related_id: Option<String>,
    expiry_date: Option<String>,
    tags: Option<String>,
    notes: Option<String>,
) -> Result<Document, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let id = new_id();
    let created_at = now_iso();
    conn.execute(
        "INSERT INTO documents (id, title, category, file_type, file_path, related_type, related_id, expiry_date, tags, notes, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![id, title, category, file_type, file_path, related_type, related_id, expiry_date, tags, notes, created_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(Document {
        id,
        title,
        category,
        file_type,
        file_path,
        related_type,
        related_id,
        expiry_date,
        tags,
        notes,
        created_at,
    })
}

#[tauri::command]
pub fn update_document(
    pool: State<DbPool>,
    id: String,
    title: String,
    category: Option<String>,
    file_type: Option<String>,
    file_path: Option<String>,
    related_type: Option<String>,
    related_id: Option<String>,
    expiry_date: Option<String>,
    tags: Option<String>,
    notes: Option<String>,
) -> Result<(), String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE documents SET title=?1, category=?2, file_type=?3, file_path=?4, related_type=?5, related_id=?6, expiry_date=?7, tags=?8, notes=?9 WHERE id=?10",
        rusqlite::params![title, category, file_type, file_path, related_type, related_id, expiry_date, tags, notes, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_documents(
    pool: State<DbPool>,
    category: Option<String>,
    related_type: Option<String>,
    related_id: Option<String>,
    search: Option<String>,
) -> Result<Vec<Document>, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let mut sql = format!("SELECT {} FROM documents WHERE 1=1", DOC_COLS);
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(c) = &category {
        sql.push_str(" AND category = ?");
        params.push(Box::new(c.clone()));
    }
    if let Some(rt) = &related_type {
        sql.push_str(" AND related_type = ?");
        params.push(Box::new(rt.clone()));
    }
    if let Some(rid) = &related_id {
        sql.push_str(" AND related_id = ?");
        params.push(Box::new(rid.clone()));
    }
    if let Some(s) = &search {
        sql.push_str(" AND (title LIKE ? OR tags LIKE ? OR notes LIKE ?)");
        let pattern = format!("%{}%", s);
        params.push(Box::new(pattern.clone()));
        params.push(Box::new(pattern.clone()));
        params.push(Box::new(pattern));
    }
    sql.push_str(" ORDER BY created_at DESC");

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    let mapped = stmt
        .query_map(param_refs.as_slice(), map_document_row)
        .map_err(|e| e.to_string())?;
    mapped.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_document(pool: State<DbPool>, id: String) -> Result<(), String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    soft_delete(&conn, "documents", "document", &id)
}

#[tauri::command]
pub fn list_expiring_documents(pool: State<DbPool>, days: i64) -> Result<Vec<Document>, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let cutoff = (chrono::Utc::now() + chrono::Duration::days(days))
        .format("%Y-%m-%d")
        .to_string();
    let sql = format!(
        "SELECT {} FROM documents WHERE expiry_date IS NOT NULL AND expiry_date <= ?1 ORDER BY expiry_date ASC",
        DOC_COLS
    );
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let mapped = stmt
        .query_map(rusqlite::params![cutoff], map_document_row)
        .map_err(|e| e.to_string())?;
    mapped.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}
