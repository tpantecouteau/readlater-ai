import os
from typing import Dict
import requests
import json
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Charger la clé API Groq
OPEN_ROUTER_API_KEY = os.getenv("OPEN_ROUTER_API_KEY")
if not OPEN_ROUTER_API_KEY:
    raise ValueError("❌ OPEN_ROUTER_API_KEY is not set. Add it to your .env file.")

# Protection contre les gros contenus
MAX_INPUT_CHARS = 8000


def build_prompt_analysis(content: str) -> str:
    """
    Prompt IA final – style validé :
    Smart + pédagogique + significatif + Takeaway final
    """
    return f"""
            Tu es un analyste expert spécialisé en transformation de contenu éducatif en connaissances utiles.
            Tu reçois un texte et tu dois en produire une analyse développée, claire et pertinente sur son contenu et ses idées clés.

            🎯 Objectif :
            Développer le sens du texte, ajouter du contexte, concepts clés et connexions logiques.
            Tu dois améliorer la compréhension, PAS résumer ni répéter, ni décrire ce que tu vois.

            🧠 Style :
            - Ton : clair, pédagogique, professionnel
            - Qualité d’analyse : réflexion structurée et intelligente
            - Structure naturelle en paragraphes (3–5)
            - Zéro bullshit, zéro répétition, pas de remplissage inutile

            ✅ Format de sortie obligatoire :
            Texte fluide en 3–5 paragraphes.
            Terminer par **une seule phrase** qui commence par : "Takeaway:".

            ⚠️ Interdictions :
            - Ne paraphrase pas le texte d’origine
            - Ne répète pas le texte d’entrée
            - Ne dis pas "ce texte signifie que" → développe directement l’idée
            - Pas de liste ou tirets
            - Pas de markdown
            - Pas d’emojis

            ---

            Texte d’origine :
            \"\"\"{content}\"\"\"

            ---

            Analyse développée :
            """


def build_prompt_tags(analysis: str) -> str:
    """
    Prompt IA pour extraire tags depuis analyse.
    """
    return f"""
                Tu es un expert en extraction de mots-clés et tags pertinents à partir d'analyses de texte.
                Tu reçois une analyse développée d'un texte et tu dois en extraire une liste de tags pertinents.

                🎯 Objectif :
                Extraire des tags pertinents qui capturent les thèmes, concepts et idées clés de l'analyse.

                🧠 Style :
                - Ton : clair, professionnel
                - Qualité : précis et pertinent
                - Structure : texte fluide, pas de liste
                - Zéro bullshit, zéro répétition, pas de remplissage inutile

                ✅ Format de sortie obligatoire :
                Liste de mots clés séparés par des virgules, sans introduction ni conclusion. Maximum 3 tags.

                ⚠️ Interdictions :
                - Ne paraphrase pas l'analyse
                - Ne prend pas des mots au hasard
                - Pas de liste à puces
                - Pas de markdown
                - Pas d’emojis
                - Rien d'autre que 3 tags maximum séparés par des virgules

                ---

                Texte d’origine :
                \"\"\"{analysis}\"\"\"

                ---

                Tags :
                """


def develop_content(content: str) -> (str | None) | (str | None):
    """
    Génère l'analyse IA enrichie d'un contenu.
    Retourne None en cas d'échec.
    """

    if not content or not content.strip():
        return None

    # Limiter la taille du texte envoyé à l'IA
    content = content.strip()
    if len(content) > MAX_INPUT_CHARS:
        content = content[:MAX_INPUT_CHARS] + "..."

    prompt_analysis = build_prompt_analysis(content)
    prompt_tags = build_prompt_tags(prompt_analysis)

    try:
        messages = ({"role": "user", "content": prompt_analysis},)
        ai_response_analysis = open_router_call(messages)

        messages = ({"role": "user", "content": prompt_tags},)
        ai_reponses_tags = open_router_call(messages)
        return ai_response_analysis, ai_reponses_tags

    except Exception as e:
        print(f"[AI ERROR] develop_content failed: {e}")
        return None


def open_router_call(messages: Dict[str, str]) -> str | None:
    """
    Appel générique à l'API OpenRouter avec une liste de messages.
    Retourne la réponse IA ou None en cas d'échec.
    """
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPEN_ROUTER_API_KEY}",
            },
            data=json.dumps(
                {
                    "model": "deepseek/deepseek-v3.1-terminus",
                    "messages": messages,
                }
            ),
        )
        data = response.json()
        print(data)
        ai_response = data["choices"][0]["message"]["content"].strip()

        return ai_response

    except Exception as e:
        print(f"[AI ERROR] api_open_router_call failed: {e}")
        return None
