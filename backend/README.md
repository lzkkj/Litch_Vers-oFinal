# Backend Python da Litch

## Executar localmente

Na pasta raiz do projeto:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python backend/app.py
```

Depois, abra `http://127.0.0.1:5000/help-me.html`.

## Ativar respostas abertas com IA

O backend funciona sem chave e o navegador usa o conhecimento local. Para ativar um provedor compatível com a API de Chat Completions, defina a chave somente no terminal ou nas variáveis do sistema:

```powershell
$env:OPENAI_API_KEY = "sua-chave-aqui"
$env:OPENAI_MODEL = "gpt-4o-mini"
python backend/app.py
```

Nunca coloque essa chave no HTML ou no JavaScript. Sem a chave, sem internet ou se o provedor falhar, o chatbot volta automaticamente para as respostas locais.
