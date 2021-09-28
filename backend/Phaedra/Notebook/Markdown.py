def text(text):
    return f"{text}"


def titled_text(title: str, text: str) -> None:
    return f"**{title}**\n\n{text}"


def ordered_list(items):
    return "\n".join(f"{i + 1}. {item}" for i, item in enumerate(items))


def unordered_list(items):
    return "\n".join(f"- {item}" for item in items)


def link(text, url):
    return f"[{text}]({url})"


def image(text, url):
    return f"![{text}]({url})"
