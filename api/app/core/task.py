# app/core/tasks.py
from app.database import get_session
from app.models import Post
from app.services.ai_developer import develop_content


def develop_post(post_id: int):
    session = next(get_session())  # ✅ open session correctly
    try:
        post = session.get(Post, post_id)

        if not post:
            print(f"[AI TASK] Post {post_id} not found.")
            return

        if not post.content:
            print(f"[AI TASK] Post {post_id} has no content.")
            return

        if post.analysis:  # don't generate twice
            print(f"[AI TASK] Post {post_id} already has analysis.")
            return

        print(f"[AI TASK] Generating analysis for Post {post_id}...")

        ai_text, ai_tags = develop_content(post.content)

        if ai_text and ai_tags:
            post.analysis = ai_text
            post.tags = ai_tags
            post.status = "done"
            print(f"[AI TASK] ✅ Analysis complete for Post {post_id}")
        else:
            post.status = "error"
            print(f"[AI TASK] ⚠️ AI failed for Post {post_id}")

        session.add(post)
        session.commit()

    except Exception as e:
        print(f"[AI TASK ERROR] {e}")
    finally:
        session.close()  # ✅ MUST CLOSE SESSION
