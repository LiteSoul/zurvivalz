# Game UI Refinement Plan

## Objective

Refine the game UI to prominently display the current wave number, integrate a dynamic enemy counter, showcase a cumulative enemy kill count, and comprehensively enhance the overall UI to be intuitive, visually compelling, and immersive.

## Phase 1: Information Gathering and Analysis (Completed)

1.  **Examine Current UI Structure:** Read `src/ui/UI.js` to understand existing UI elements and structure.
2.  **Understand Wave Management Logic:** Read `src/managers/WaveManager.js` to understand wave number tracking and enemy spawning.
3.  **Game Core Mechanics:** Read `src/core/Game.js` to understand the game loop and UI integration.
4.  **Score Update Logic:** Investigate how the score is updated and if it accurately reflects kill count. (Confirmed score is incremented in `Zombie.js` on zombie death, but score value varies by zombie type, so a separate kill counter is needed)

## Phase 2: UI Design and Plan Creation (Current Phase)

5.  **Design UI Elements:**
    - **Wave Number Display:** Prominent display for wave number.
    - **Dynamic Enemy Counter:** Real-time counter for active enemies.
    - **Cumulative Kill Count:** Persistent display for total kills (separate from score).
6.  **Overall UI Refinement Strategy:**
    - **Visual Theme:** Consider a suitable visual style.
    - **Layout and Hierarchy:** Ensure clear visual hierarchy.
    - **Immersive Enhancement:** Enhance immersion with UI.
7.  **Detailed Plan with Mermaid Diagram (if applicable):** Create a detailed implementation plan.

## Phase 3: User Review and Feedback (Next Phase)

8.  **Present Plan to User:** Present the detailed UI plan.
9.  **Gather User Feedback:** Collect feedback and iterate on the plan.

## Phase 4: Plan Finalization and Implementation Preparation (Phase After Next)

10. **Save Plan to Markdown (Optional):** Save the finalized plan to a markdown file.
11. **Mode Switch Request:** Request to switch to code mode for implementation.

## Phase 5: Implementation (Code Mode)

- Implement the UI changes in `src/ui/UI.js` and related files.
- Integrate the new UI elements with game logic in `src/core/Game.js` and `src/managers/WaveManager.js`.

## User Clarification

- The score value varies depending on zombie type, so a separate kill count is needed besides the score.

## Next Steps

- Proceed to design the UI elements and create a detailed implementation plan.
- Present the plan to the user for review and feedback.
