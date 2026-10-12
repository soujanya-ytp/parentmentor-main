import os
import re

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover - handled gracefully at runtime
    OpenAI = None


PROMPT_TEMPLATE = """You are an expert parenting coach who helps parents solve real-life problems with practical, step-by-step guidance.

Parent Name:
{parent_name}

Child Details:
- Name: {child_name}
- Age: {child_age}
- Goal: {goal}

Parent Question:
{question}

Your job:
Do NOT give generic advice.
Think like a real parent situation and solve the problem.

Respond in this structure:

1. Understanding the Situation
- Explain WHY this problem is happening (emotion, behavior, context)
- Keep this short: 2 to 3 sentences only

2. Practical Solution Plan
- Give 3–5 VERY specific steps
- Each step must be a short, doable task the parent can immediately assign or do
- Keep each step under 10 words when possible
- Start each step with a clear action verb
- Do not include explanations inside the step
- Write each step on its own bullet line starting with "-"
- At least 1 step must be clearly a child-doable task that can be added to a task list
- Good examples:
  - Play outside for 20 minutes
  - Put the tablet away until homework ends
  - Choose one outdoor game after snack
- Avoid vague steps like:
  - Start with one simple change
  - Be more consistent
  - Set boundaries

3. Example Routine (Realistic)
- Show how a day would actually look (especially around the problem time)

4. Smart Tips
- Give short but powerful tips
- Include what to avoid

Rules:
- Be practical, not theoretical
- Avoid generic lines like “be consistent” unless explained
- Use simple language
- Make it feel like advice from an experienced parent coach
- When it feels natural, address the parent by name
- If you mention the child, use the child's name when helpful"""


def generate_parenting_response(
    question,
    child_age,
    goal=None,
    parent_name=None,
    child_name=None,
    mode=None,
    routine_summary=None,
    latest_logs_summary=None,
    latest_moods_summary=None,
    recent_history_summary=None,
):
    context_block = _build_context_block(
        child_name=child_name,
        mode=mode,
        routine_summary=routine_summary,
        latest_logs_summary=latest_logs_summary,
        latest_moods_summary=latest_moods_summary,
        recent_history_summary=recent_history_summary,
    )
    prompt = PROMPT_TEMPLATE.format(
        parent_name=parent_name or "Parent",
        child_name=child_name or "Not specified",
        child_age=child_age,
        goal=goal or "Not specified",
        question=question.strip(),
    ) + context_block

    try:
        text = _generate_response_text(prompt)
        return _parse_response_text(text)
    except Exception:
        return _fallback_response(question, child_age, goal, parent_name, child_name)


def _generate_response_text(prompt):
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("AI_MODEL", "gpt-4o-mini")
    if not api_key or OpenAI is None:
        raise RuntimeError("OpenAI is not configured")

    client = OpenAI(api_key=api_key)
    response = client.responses.create(
        model=model,
        input=prompt,
    )
    return (response.output_text or "").strip()


def _parse_response_text(text):
    normalized = text.strip()
    sections = {
        "problem_breakdown": _extract_section(normalized, "Understanding the Situation", "Practical Solution Plan"),
        "action_plan": _extract_list_section(normalized, "Practical Solution Plan", "Example Routine"),
        "daily_routine": _extract_section(normalized, "Example Routine", "Smart Tips"),
        "tips": _extract_section(normalized, "Smart Tips", None),
    }

    if any(not value for value in sections.values()):
        raise ValueError("Incomplete AI response")

    return sections


def _extract_section(text, current_title, next_title):
    content = _match_section_content(text, current_title, next_title)
    if not content:
        return ""

    content = re.sub(r"^\s*[-*]\s*", "", content, flags=re.MULTILINE)
    content = re.sub(r"\*\*(.*?)\*\*", r"\1", content)
    return " ".join(line.strip() for line in content.splitlines() if line.strip())


def _extract_list_section(text, current_title, next_title):
    content = _match_section_content(text, current_title, next_title)
    if not content:
        return []

    content = re.sub(r"\*\*(.*?)\*\*", r"\1", content)
    lines = [line.strip() for line in content.splitlines() if line.strip()]

    items = []
    for line in lines:
        cleaned = re.sub(r"^\s*(?:[-*]|\d+[.)])\s*", "", line).strip()
        if cleaned:
            items.append(cleaned)

    if not items:
        compact = " ".join(lines).strip()
        if compact:
            items = [part.strip() for part in re.split(r"\s*\|\s*|;\s+", compact) if part.strip()]

    return items


def _match_section_content(text, current_title, next_title):
    heading_prefix = r"(?:^|\n)\s*(?:#{1,6}\s*)?"
    next_pattern = (
        rf"{heading_prefix}\d+\.\s*{re.escape(next_title)}"
        if next_title
        else r"$"
    )
    pattern = (
        rf"{heading_prefix}\d+\.\s*{re.escape(current_title)}\s*(.*?)(?={next_pattern})"
    )
    match = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL)
    if not match:
        return ""

    return match.group(1).strip()


def _fallback_response(question, child_age, goal, parent_name=None, child_name=None):
    goal_text = goal or "build a steady routine"
    child_label = child_name or f"a child age {child_age}"
    greeting = f"Hi {parent_name}," if parent_name else "Hi,"
    action_plan = _fallback_action_plan(question, child_name)

    return {
        "problem_breakdown": (
            f"{greeting} this sounds like a real moment with {child_label}, and the challenge around {question.strip().lower()} usually comes from a mix of big feelings, habit, and unclear transitions."
        ),
        "action_plan": action_plan,
        "daily_routine": (
            f"After school: snack, 20 minutes of movement, homework or quiet play, then limited screen time, then dinner, bath, and bedtime at a steady hour to support the goal to {goal_text}."
        ),
        "tips": (
            "Stay calm, use short instructions, praise small progress, and avoid changing the plan too often."
        ),
    }


def _fallback_action_plan(question, child_name=None):
    text = (question or "").lower()

    if "screen" in text:
        return [
            "Play outside for 20 minutes after snack.",
            "Put the tablet away until playtime ends.",
            "Start a 20-minute screen timer.",
            "Pick blocks, coloring, or ball play next.",
        ]

    if "bed" in text or "sleep" in text:
        return [
            "Put on pajamas right after bath.",
            "Choose one bedtime story.",
            "Turn off screens one hour before bed.",
            "Get into bed after story time.",
        ]

    if "homework" in text or "study" in text or "focus" in text:
        return [
            "Start with 10 minutes of homework.",
            "Keep only one book on the table.",
            "Finish one question before a short break.",
            "Praise effort right after each step.",
        ]

    return [
        "Practice one clear habit today.",
        "Repeat the routine at the same time.",
        "Praise the exact good behavior quickly.",
        "Keep one backup activity ready.",
    ]


def _build_context_block(
    child_name=None,
    mode=None,
    routine_summary=None,
    latest_logs_summary=None,
    latest_moods_summary=None,
    recent_history_summary=None,
):
    parts = [
        "",
        "Additional Child Context:",
        f"Child Name: {child_name or 'Not specified'}",
        f"Current Mode: {mode or 'parent'}",
        f"Routine Summary: {routine_summary or 'No routine context'}",
        f"Latest Daily Logs: {latest_logs_summary or 'No daily logs'}",
        f"Latest Mood Logs: {latest_moods_summary or 'No mood logs'}",
        f"Recent Coach Chat History: {recent_history_summary or 'No previous chat history'}",
        "",
        "Use this context when it is relevant, but keep the response practical and easy for a parent to follow.",
    ]
    return "\n".join(parts)
