// Public Tauri shell.
//
// The implementation lives in the private agent-switch-private-core repository. The
// public repository intentionally does not contain the core Rust source, while
// local and release builds can still compile after the private core is checked
// out next to this repository.
include!(concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/../.private/agent-switch-private-core/src-tauri-core/src/lib.rs"
));
