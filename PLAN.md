# ParentMentor AI Feature Plan

## Planner Summary

ParentMentor AI has now moved beyond the original chat MVP into a more complete demo flow:

1. Parent signs up or logs in.
2. Parent completes lightweight onboarding with parent name and first child profile.
3. Parent lands on a dashboard with child switching, tasks, moods, rewards, streaks, and quick recommendations.
4. Parent can open child-specific coach, routines, activities, rewards, insights, and child mode.
5. Child mode uses the current parent session and exposes only child-safe progress interactions.

## Delivered Feature Areas

1. Parent dashboard with:
   - active child switcher
   - overview stat cards
   - today checklist
   - mood and reward quick actions
   - weekly recommendation snapshot

2. Child profile management with:
   - create, edit, delete
   - rich profile fields
   - child detail view and aggregated child data

3. Parent onboarding with:
   - parent name collection
   - first child creation flow after login

4. AI parenting coach with:
   - child-specific context
   - saved chat history
   - structured response cards

5. Routine generator with:
   - AI-assisted generation
   - save, edit, delete
   - recurring and archive-ready fields

6. Activity suggestions with:
   - AI-assisted generation
   - save/delete flow
   - child-specific filtering

7. Task and habit tracking with:
   - create, toggle, delete
   - streaks and points
   - child mode completion

8. Rewards and badges with:
   - create, claim, delete rewards
   - automatic badge unlocks from streaks and claiming

9. Mood tracking with:
   - create/list/delete mood logs
   - dashboard and insights integration

10. Weekly insights with:
    - completion and consistency summaries
    - mood trend view
    - next-week recommendation

11. Child mode with:
    - today’s missions
    - routines
    - activities
    - stars, rewards, badges
    - celebration messaging

## Visual Direction

The app theme was refreshed from a black glass UI to a bright, child-friendly palette using:

1. warm cream backgrounds
2. sky, amber, rose, emerald, and violet accents
3. rounded playful surfaces
4. softer shadows
5. kid-friendly typography choices for headings

## Remaining Follow-Up Ideas

1. Add provider-backed LLM integration behind the existing fallback AI service.
2. Add automated tests for the new Flask routes.
3. Add richer charts if the team decides to bring in a chart library.
