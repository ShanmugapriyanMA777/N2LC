import sqlite3
import datetime
from typing import List, Dict, Any

class HistoryService:
    def __init__(self, db_path: str = "history.db"):
        self.db_path = db_path
        self.memory_history: List[Dict[str, Any]] = []
        self._init_db()

    def _init_db(self):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    prompt TEXT NOT NULL,
                    code TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    compilation_status TEXT NOT NULL,
                    execution_result TEXT
                )
            """)
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"SQLite Init Note: Using in-memory fallback ({e})")

    def add_entry(self, prompt: str, code: str, status: str = "success", result: str = "") -> Dict[str, Any]:
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = {
            "id": len(self.memory_history) + 1,
            "prompt": prompt,
            "code": code,
            "timestamp": timestamp,
            "compilation_status": status,
            "execution_result": result
        }
        self.memory_history.insert(0, entry)

        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO history (prompt, code, timestamp, compilation_status, execution_result) VALUES (?, ?, ?, ?, ?)",
                (prompt, code, timestamp, status, result)
            )
            entry["id"] = cursor.lastrowid
            conn.commit()
            conn.close()
        except Exception:
            pass

        return entry

    def get_all(self) -> List[Dict[str, Any]]:
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT id, prompt, code, timestamp, compilation_status, execution_result FROM history ORDER BY id DESC LIMIT 50")
            rows = cursor.fetchall()
            conn.close()
            if rows:
                return [
                    {
                        "id": r[0],
                        "prompt": r[1],
                        "code": r[2],
                        "timestamp": r[3],
                        "compilation_status": r[4],
                        "execution_result": r[5]
                    }
                    for r in rows
                ]
        except Exception:
            pass
        return self.memory_history

    def clear_all(self) -> bool:
        self.memory_history = []
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM history")
            conn.commit()
            conn.close()
            return True
        except Exception:
            return True

history_service = HistoryService()
