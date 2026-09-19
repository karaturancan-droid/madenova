use crate::db::DbPool;
use tauri::State;

#[tauri::command]
pub fn get_setting(pool: State<DbPool>, key: String) -> Result<Option<String>, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let result: Option<String> = conn
        .query_row(
            "SELECT value FROM settings WHERE key = ?1",
            rusqlite::params![key],
            |row| row.get(0),
        )
        .ok();
    Ok(result)
}

/// Upserts a setting. Note: values (e.g. API keys) are never logged/printed.
#[tauri::command]
pub fn set_setting(pool: State<DbPool>, key: String, value: String) -> Result<(), String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        rusqlite::params![key, value],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
