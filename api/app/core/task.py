from app.database import get_session
from app.models import Post
from app.services.ai_developer import develop_content


def develop_post(post_id: int):
    session = next(get_session())
    try:
        post = session.get(Post, post_id)

        if not post or not post.content or post.analysis:
            return

        ai_text, ai_tags = develop_content(post.content)

        if ai_text and ai_tags:
            post.analysis = ai_text
            post.tags = ai_tags
            post.status = "done"
        else:
            post.status = "error"

        session.add(post)
        session.commit()

    except Exception:
        pass
    finally:
        session.close()
