use crate::db::DbPool;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub id: String,
    pub role: String, // "user" or "assistant"
    pub content: String,
    pub timestamp: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub suggested_action: Option<SuggestedAction>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SuggestedAction {
    pub action_type: String,
    pub description: String,
    pub payload: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatHistory {
    pub messages: Vec<Message>,
}

#[tauri::command]
pub fn asistan_get_history(pool: State<DbPool>) -> Result<ChatHistory, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, role, content, timestamp, suggested_action 
             FROM asistan_messages 
             ORDER BY timestamp ASC",
        )
        .map_err(|e| e.to_string())?;

    let messages = stmt
        .query_map([], |row| {
            let suggested_action_str: Option<String> = row.get(4).ok();
            let suggested_action = suggested_action_str.and_then(|s| {
                serde_json::from_str(&s).ok()
            });

            Ok(Message {
                id: row.get(0)?,
                role: row.get(1)?,
                content: row.get(2)?,
                timestamp: row.get(3)?,
                suggested_action,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(ChatHistory { messages })
}

#[tauri::command]
pub fn asistan_mesaj_gonder(
    mesaj: String,
    pool: State<DbPool>,
) -> Result<Message, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let user_id = uuid::Uuid::new_v4().to_string();

    // Save user message
    conn.execute(
        "INSERT INTO asistan_messages (id, role, content, timestamp) 
         VALUES (?, ?, ?, ?)",
        [&user_id, "user", &mesaj, &now],
    )
    .map_err(|e| e.to_string())?;

    // Generate assistant response (mock for now)
    let assistant_response = generate_assistant_response(&mesaj);
    let assistant_id = uuid::Uuid::new_v4().to_string();
    let assistant_timestamp = chrono::Local::now()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();

    let suggested_action_json = assistant_response
        .suggested_action
        .as_ref()
        .map(|sa| serde_json::to_string(sa).unwrap_or_default());

    conn.execute(
        "INSERT INTO asistan_messages (id, role, content, timestamp, suggested_action) 
         VALUES (?, ?, ?, ?, ?)",
        rusqlite::params![
            &assistant_id,
            "assistant",
            &assistant_response.content,
            &assistant_timestamp,
            suggested_action_json
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(Message {
        id: assistant_id,
        role: "assistant".to_string(),
        content: assistant_response.content,
        timestamp: assistant_timestamp,
        suggested_action: assistant_response.suggested_action,
    })
}

fn generate_assistant_response(user_message: &str) -> Message {
    let lower_msg = user_message.to_lowercase();
    
    let (content, suggested_action) = if lower_msg.contains("firma") && lower_msg.contains("ekle") {
        (
            "Yeni bir firma eklemek ister misiniz? Firma adı, vergi numarası ve iletişim bilgilerini sağlayabilirsiniz.".to_string(),
            Some(SuggestedAction {
                action_type: "create_company".to_string(),
                description: "Yeni firma oluştur".to_string(),
                payload: serde_json::json!({}),
            }),
        )
    } else if lower_msg.contains("ürün") && lower_msg.contains("ekle") {
        (
            "Yeni bir ürün eklemek ister misiniz? Ürün adı, SKU, kategori ve fiyat bilgilerini sağlayabilirsiniz.".to_string(),
            Some(SuggestedAction {
                action_type: "create_product".to_string(),
                description: "Yeni ürün oluştur".to_string(),
                payload: serde_json::json!({}),
            }),
        )
    } else if lower_msg.contains("araç") && lower_msg.contains("ekle") {
        (
            "Yeni bir araç eklemek ister misiniz? Araç plakası, marka, model ve yılını sağlayabilirsiniz.".to_string(),
            Some(SuggestedAction {
                action_type: "create_vehicle".to_string(),
                description: "Yeni araç oluştur".to_string(),
                payload: serde_json::json!({}),
            }),
        )
    } else if lower_msg.contains("çalışan") && lower_msg.contains("ekle") {
        (
            "Yeni bir çalışan eklemek ister misiniz? Çalışan adı, pozisyon ve maaş bilgilerini sağlayabilirsiniz.".to_string(),
            Some(SuggestedAction {
                action_type: "create_worker".to_string(),
                description: "Yeni çalışan oluştur".to_string(),
                payload: serde_json::json!({}),
            }),
        )
    } else {
        (
            "Size nasıl yardımcı olabilirim? Firma, ürün, araç, çalışan yönetimi veya muhasebe işlemleri hakkında sorular sorabilirsiniz.".to_string(),
            None,
        )
    };

    Message {
        id: uuid::Uuid::new_v4().to_string(),
        role: "assistant".to_string(),
        content,
        timestamp: chrono::Local::now()
            .format("%Y-%m-%d %H:%M:%S")
            .to_string(),
        suggested_action,
    }
}
