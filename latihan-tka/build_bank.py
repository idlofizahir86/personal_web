import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
SOURCE = BASE_DIR / "questions.json"
OUTPUT = BASE_DIR / "question-bank.js"

questions = json.loads(SOURCE.read_text(encoding="utf-8"))
if not isinstance(questions, list):
    raise SystemExit("questions.json harus berisi array soal.")

seen_ids = set()
allowed_categories = {"verbal", "quant", "spatial"}
for index, question in enumerate(questions, start=1):
    required = {"id", "category", "type", "prompt", "options", "answer", "explanation", "source"}
    missing = required - question.keys()
    if missing:
        raise SystemExit(f"Soal nomor {index} tidak memiliki field: {', '.join(sorted(missing))}")
    question_id = question["id"]
    if question_id in seen_ids:
        raise SystemExit(f"ID soal duplikat: {question_id}")
    seen_ids.add(question_id)
    if question["category"] not in allowed_categories:
        raise SystemExit(f"Kategori soal {question_id} tidak dikenal.")
    if len(question["options"]) != 5 or question["answer"] not in range(5):
        raise SystemExit(f"Format opsi/kunci soal {question_id} tidak valid.")
    if len(set(question["options"])) != 5:
        raise SystemExit(f"Opsi soal {question_id} harus berbeda semua.")
    source = question["source"]
    if not source.get("label") or not source.get("url", "").startswith("https://"):
        raise SystemExit(f"Label atau URL sumber soal {question_id} tidak valid.")

payload = json.dumps(questions, ensure_ascii=False, separators=(",", ":"))
OUTPUT.write_text(
    "/* Generated from questions.json by build_bank.py. Do not edit manually. */\n"
    + "window.TKA_QUESTION_BANK = " + payload + ";\n",
    encoding="utf-8",
)
print(f"Berhasil membuat {OUTPUT.name}: {len(questions)} soal.")
