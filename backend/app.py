"""Backend local da Litch AI.

Execute com: python backend/app.py
Sem OPENAI_API_KEY, a interface continua usando o fallback local do chatbot.
"""

import json
import os
import re
import unicodedata
import urllib.error
import urllib.request
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

ROOT = Path(__file__).resolve().parent.parent
app = Flask(__name__)

BLOCKED_TERMS = {
    "idiota", "imbecil", "otario", "otaria", "burro", "burra",
    "merda", "porra", "caralho", "bosta", "cacete", "puta", "puto",
    "foda se", "filho da puta", "arrombado", "arrombada",
    "fuck", "shit", "asshole", "idiot",
}

PROJECT_CONTEXT = """
Voce e a Litch AI, assistente da plataforma ficticia Litch. Responda sempre em
portugues brasileiro, com clareza e contexto. Use apenas estas informacoes:

PLATAFORMA: a Home tem Game Store, Online Games, Litch+, biblioteca e Community.
O prototipo exibe jogos, generos, precos, descontos e avaliacoes, mas nao possui
login, checkout, pagamento real, biblioteca de usuario ou atendimento humano.
Litch+ oferece streaming no PC, celular, tablet ou TV, sem console.
PLANOS: Basic R$ 19,90/mes (1080p, 1 dispositivo); Standard R$ 34,90/mes
(1440p, 2 dispositivos); Ultra R$ 69,90/mes (4K, 4 dispositivos).
COMUNIDADE: nota 4,8/5 baseada em 2.847 avaliacoes.

Nao invente funcionalidades que nao estao implementadas. Se a pergunta nao
puder ser respondida por este contexto, diga isso e sugira uma pergunta sobre
jogos, planos, precos ou recursos da Litch.
"""


def contains_blocked_term(value):
    """Detecta termos ofensivos sem devolver o texto original ao cliente."""
    normalized = unicodedata.normalize("NFD", value.lower())
    normalized = "".join(character for character in normalized if unicodedata.category(character) != "Mn")
    clean_text = re.sub(r"[^a-z0-9]+", " ", normalized).strip()
    return any(f" {term} " in f" {clean_text} " for term in BLOCKED_TERMS)


def ask_provider(question, history):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    messages = [{"role": "system", "content": PROJECT_CONTEXT}]
    for item in history[-6:]:
        if item.get("role") in {"user", "assistant"} and item.get("content"):
            messages.append({"role": item["role"], "content": str(item["content"])[:2000]})
    messages.append({"role": "user", "content": question[:2000]})

    payload = json.dumps({
        "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 350,
    }).encode("utf-8")
    request_data = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request_data, timeout=20) as response:
            result = json.loads(response.read().decode("utf-8"))
        return result["choices"][0]["message"]["content"].strip()
    except (urllib.error.URLError, urllib.error.HTTPError, KeyError, IndexError, json.JSONDecodeError):
        return None


@app.get("/")
def home():
    return send_from_directory(ROOT / "html", "index.html")


@app.get("/help-me.html")
def help_page():
    return send_from_directory(ROOT / "html", "help-me.html")


@app.get("/<path:resource>")
def assets(resource):
    return send_from_directory(ROOT, resource)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "provider_configured": bool(os.getenv("OPENAI_API_KEY"))})


@app.post("/api/chat")
def chat():
    body = request.get_json(silent=True) or {}
    question = str(body.get("message", "")).strip()
    history = body.get("history", [])

    if not question:
        return jsonify({"error": "A mensagem nao pode estar vazia."}), 400
    if contains_blocked_term(question):
        return jsonify({
            "error": "Mensagem bloqueada. Mantenha a conversa respeitosa.",
            "blocked": True,
        }), 422

    answer = ask_provider(question, history if isinstance(history, list) else [])
    if answer is None:
        return jsonify({
            "error": "Provedor de IA indisponivel. Use o modo local do navegador.",
            "fallback": True,
        }), 503
    return jsonify({"answer": answer, "source": "provider"})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")), debug=False)
