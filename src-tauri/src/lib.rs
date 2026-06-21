use std::{collections::HashMap, fs, path::PathBuf, time::Instant};

use tauri::Manager;
use serde::{Deserialize, Serialize};

fn workspace_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
    Ok(dir.join("workspace.json"))
}

#[tauri::command]
fn load_workspace(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let path = workspace_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    fs::read_to_string(path).map(Some).map_err(|error| error.to_string())
}

#[tauri::command]
fn save_workspace(app: tauri::AppHandle, data: String) -> Result<(), String> {
    let path = workspace_path(&app)?;
    fs::write(path, data).map_err(|error| error.to_string())
}

#[derive(Deserialize)]
struct HttpRequestInput {
    method: String,
    url: String,
    headers: HashMap<String, String>,
    body: Option<String>,
}

#[derive(Serialize)]
struct HttpResponseOutput {
    status: u16,
    #[serde(rename = "statusText")]
    status_text: String,
    #[serde(rename = "timeMs")]
    time_ms: u128,
    #[serde(rename = "sizeBytes")]
    size_bytes: usize,
    headers: HashMap<String, String>,
    cookies: Vec<String>,
    body: serde_json::Value,
    #[serde(rename = "rawBody")]
    raw_body: String,
}

#[tauri::command]
async fn send_http_request(request: HttpRequestInput) -> Result<HttpResponseOutput, String> {
    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|error| error.to_string())?;
    let method = request
        .method
        .parse::<reqwest::Method>()
        .map_err(|error| error.to_string())?;
    let started_at = Instant::now();
    let mut builder = client.request(method, request.url);

    for (key, value) in request.headers {
        builder = builder.header(key, value);
    }

    if let Some(body) = request.body {
        builder = builder.body(body);
    }

    let response = builder.send().await.map_err(|error| error.to_string())?;
    let status = response.status();
    let status_text = status.canonical_reason().unwrap_or("").to_string();
    let headers: HashMap<String, String> = response
        .headers()
        .iter()
        .map(|(key, value)| (key.to_string(), value.to_str().unwrap_or("").to_string()))
        .collect();
    let cookies = response
        .headers()
        .get_all(reqwest::header::SET_COOKIE)
        .iter()
        .filter_map(|value| value.to_str().ok().map(String::from))
        .collect::<Vec<_>>();
    let raw_body = response.text().await.map_err(|error| error.to_string())?;
    let body = if headers
        .get("content-type")
        .map(|value| value.to_lowercase().contains("json"))
        .unwrap_or(false)
    {
        serde_json::from_str(&raw_body).unwrap_or_else(|_| serde_json::Value::String(raw_body.clone()))
    } else {
        serde_json::Value::String(raw_body.clone())
    };
    let size_bytes = raw_body.len()
        + serde_json::to_string(&headers)
            .map(|value| value.len())
            .unwrap_or_default();

    Ok(HttpResponseOutput {
        status: status.as_u16(),
        status_text,
        time_ms: started_at.elapsed().as_millis(),
        size_bytes,
        headers,
        cookies,
        body,
        raw_body,
    })
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![load_workspace, save_workspace, send_http_request])
        .run(tauri::generate_context!())
        .expect("failed to run Getman");
}
