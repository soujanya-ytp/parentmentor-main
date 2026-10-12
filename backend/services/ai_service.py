import json
import os

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None


def generate_parenting_response(question, child):
    prompt = f"""You are an expert parenting coach.

Child Name: {child.get('name') or 'Not specified'}
Child Age: {child.get('age') or 'Not specified'}
Goal: {child.get('goal') or 'build steadier routines'}
Strengths: {child.get('strengths') or 'curiosity and connection'}
Challenges: {child.get('challenges') or 'staying regulated during transitions'}

Parent Question: {question}

Return valid JSON with keys:
- problem_breakdown
- action_plan
- suggested_activity
- encouragement
- daily_routine
- tips
"""

    fallback = {
        "problem_breakdown": (
            f"{child['name']} is likely showing a real need behind this challenge. At age {child['age']}, kids often need clear transitions and predictable support."
        ),
        "action_plan": [
            f"Name the goal out loud in a calm way and connect it to {child['name']}'s strengths.",
            "Use one small boundary, one transition cue, and one positive follow-up instead of changing everything at once.",
            "Track what happens right before the hard moment so you can spot the main trigger.",
        ],
        "suggested_activity": "Try a 10-minute reset activity before the hardest part of the day.",
        "encouragement": "A calm, consistent response matters more than a perfect plan.",
        "daily_routine": "Keep the next 24 hours simple: preview the expectation, give a transition reminder, then follow through calmly.",
        "tips": "Avoid shaming language, keep choices limited, praise effort fast, and repeat the plan for several days.",
    }
    return _generate_json_response(prompt, fallback)


def generate_routine_suggestion(child, payload):
    prompt = f"""You are an expert parenting coach creating a child routine.

Child Name: {child.get('name') or 'Not specified'}
Child Age: {child.get('age') or 'Not specified'}
Goal: {payload.get('goal') or child.get('goal') or 'build more predictable habits'}
Routine Type: {payload.get('routine_type') or 'daily'}
Time Of Day: {payload.get('time_of_day') or 'after school'}
Estimated Duration: {payload.get('estimated_duration') or '20 minutes'}
Structure Level: {payload.get('structure_level') or 'balanced'}

Return valid JSON with keys:
- title
- routine_type
- goal
- time_of_day
- estimated_duration
- structure_level
- items (array of short routine steps)
- parent_tips
- child_phrase
"""

    routine_type = payload.get("routine_type") or "daily"
    fallback = {
        "title": f"{child['name']}'s {routine_type.replace('-', ' ').title()} Routine",
        "routine_type": routine_type,
        "goal": payload.get("goal") or child.get("goal") or "build more predictable habits",
        "time_of_day": payload.get("time_of_day") or "after school",
        "estimated_duration": payload.get("estimated_duration") or "20 minutes",
        "structure_level": payload.get("structure_level") or "balanced",
        "items": ["Start calmly", "Complete one clear step", "Take a short break", "Finish together"],
        "parent_tips": "Preview the routine before it begins, keep transitions visual, and praise each completed step.",
        "child_phrase": f"Let's do your {routine_type.replace('-', ' ')} plan one step at a time.",
    }
    return _generate_json_response(prompt, fallback)


def generate_activity_suggestion(child, payload):
    prompt = f"""You are an expert parenting coach generating one practical activity.

Child Name: {child.get('name') or 'Not specified'}
Child Age: {child.get('age') or 'Not specified'}
Goal: {payload.get('goal') or child.get('goal') or 'more calm and connection'}
Current Mood: {payload.get('current_mood') or 'neutral'}
Interests: {payload.get('interests') or child.get('interests') or child.get('favorite_activities') or 'hands-on play'}
Category: {payload.get('category') or 'family bonding'}
Available Time: {payload.get('available_time') or '15 minutes'}
Setting: {payload.get('setting') or 'indoor'}

Return valid JSON with keys:
- title
- category
- description
- materials
- duration
- benefits
- parent_tip
"""

    fallback = {
        "title": f"{(payload.get('category') or 'Family bonding').title()} Play for {child['name']}",
        "category": payload.get("category") or "family bonding",
        "description": "Use a short, simple activity that helps the child regulate and reconnect with the parent.",
        "materials": "Paper, crayons, pillows, timer, or simple household objects",
        "duration": payload.get("available_time") or "15 minutes",
        "benefits": "Builds connection, emotional regulation, and confidence.",
        "parent_tip": "Join for the first two minutes, then let the child lead where possible.",
    }
    return _generate_json_response(prompt, fallback)


def generate_weekly_summary(child, summary_input):
    prompt = f"""You are an expert parenting coach generating a short weekly insight summary.

Child Name: {child.get('name') or 'Not specified'}
Child Age: {child.get('age') or 'Not specified'}
Completion Rate: {summary_input.get('completion_rate', 0)}
Mood Trend: {summary_input.get('mood_trend') or 'still forming'}
Strongest Habit: {summary_input.get('strongest_habit') or 'showing up for the basics'}
Challenge Area: {summary_input.get('challenge_area') or 'consistency during transitions'}

Return valid JSON with keys:
- summary
- focus_area_next_week
- recommendation
"""

    fallback = {
        "summary": (
            f"{child['name']} had a {summary_input.get('completion_rate', 0)}% completion week. Mood trend looks {summary_input.get('mood_trend') or 'still forming'}."
        ),
        "focus_area_next_week": f"Simplify support around {summary_input.get('challenge_area') or 'consistency during transitions'}.",
        "recommendation": "Keep one priority habit, one calming transition, and one visible reward target for the next seven days.",
    }
    return _generate_json_response(prompt, fallback)


def _generate_json_response(prompt, fallback):
    try:
        text = _call_openai(prompt)
        data = json.loads(_strip_code_fences(text))
        if isinstance(data, dict):
            merged = fallback.copy()
            merged.update({key: value for key, value in data.items() if value not in (None, "")})
            return merged
    except Exception:
        pass
    return fallback


def _call_openai(prompt):
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


def _strip_code_fences(text):
    stripped = text.strip()
    if stripped.startswith("```"):
        lines = stripped.splitlines()
        if len(lines) >= 3:
            return "\n".join(lines[1:-1]).strip()
    return stripped
