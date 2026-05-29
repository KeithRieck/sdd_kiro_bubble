# Project Spec
## Context
This project is a browser-based Phaser 3 game where the player controls a bubble that grows by consuming smaller bubbles and avoids larger or equal bubbles. The game runs as an ES module app with no build step, starts through a scene pipeline (`BootScene` -> `PreloaderScene` -> `GameScene`), and includes PWA support through `manifest.json` and `service-worker.js`.

Repository evidence shows a gameplay loop centered on `GameScene`, shared entity behavior through an abstract `Bubble` class, autonomous enemy movement/spawning, a special `ShrinkBubble` mechanic, and a HUD for score/lives/level.

## Goals
- Preserve the current playable loop: move player bubble, resolve collisions, track score/lives/level, and restart appropriately.
- Preserve progressive difficulty by increasing bubble count across wins/deaths until game over.
- Preserve deterministic scene startup and asset loading flow.
- Preserve existing special bubble behavior (`ShrinkBubble`) and audio feedback.
- Preserve installable/offline-capable PWA behavior consistent with current implementation.

## Non-Goals
- Introducing multiplayer, networking, or backend services.
- Adding a build/bundling pipeline.
- Replacing Phaser with another engine.
- Redesigning visuals/audio beyond current mechanics.
- Expanding platform targets beyond modern browser/PWA.

## Actors
- Player: Uses mouse/touch pointer input to direct the player bubble.
- Game Scene Runtime: Executes frame updates, collisions, spawning, and transitions.
- Spawn System: Generates AI and shrink bubbles with distribution, spacing, and velocity constraints.
- Collision System: Detects overlap and returns collision resolution intent.
- HUD: Displays score, lives, level, and game-over messaging.
- Browser/PWA Runtime: Hosts Phaser canvas, registers service worker, and manages cached resources.

## Assumptions & Constraints
- Runtime is modern browser JavaScript with ES modules (`"type": "module"`).
- World dimensions are fixed at 800x600 for game logic and rendering boundaries.
- Player starts at size 30, lives 3, score 0, level 1, and initial bubble count 10.
- Player win threshold is size >= 100.
- Player speed scales inversely with size via `max(50, 300 - size*2)`.
- AI and shrink bubbles move with velocity and bounce off world bounds.
- New spawns target at least 200px center distance from player.
- Spawn mix includes 10% chance of `ShrinkBubble`; non-shrink sizes are range/distribution-based.
- Bubble movement speed for spawned bubbles is randomized between 50 and 150 pixels per second.
- Scenario restart after win/non-final death includes a 2-second pause and size reset to 30.
- HUD is displayed outside the play field, positioned at the top-left area to the left of the game field.
- Input handling focuses on pointer down (mouse-down/touch) behavior for player movement target updates.
- Tech stack is Phaser via CDN plus local ES modules.
- PWA behavior depends on service worker availability and browser support.
- There are no hard performance limits for this project.
- There are no accessibility requirements for this project.

## Acceptance Criteria
1. WHEN the game initializes THEN the system SHALL instantiate Phaser with an 800x600 play area, include `BootScene`, `PreloaderScene`, and `GameScene` in that order, and use a dark gray outer background color.
2. WHEN `BootScene` runs THEN the system SHALL load the logo asset and SHALL transition to `PreloaderScene`.
3. WHILE `PreloaderScene` is active THEN the system SHALL display the logo, SHALL show loading progress feedback, SHALL preload required audio assets (`pop`, `explosion`, `fanfare`, `shrink`), and THEN SHALL transition to `GameScene` after load completion.
4. WHEN `GameScene` is created THEN the system SHALL render a black game-world background with a white border, SHALL create a player bubble at world center with size 30, SHALL initialize spawn and HUD systems, and SHALL populate bubbles up to the target count.
5. WHEN pointer down input occurs (mouse-down or touch) THEN the system SHALL update the player target position and SHALL move the player toward that target each frame using size-dependent speed.
6. WHILE any bubble updates position THEN the system SHALL constrain bubble positions to the 800x600 world and SHALL apply boundary bounce behavior for autonomous bubbles.
7. WHEN player and AI bubbles collide IF player size is greater THEN the system SHALL remove the AI bubble, SHALL increase score by consumed bubble size, SHALL grow player size using integer square-root growth capped at 100, and SHALL play `pop.wav`.
8. WHEN player and AI bubbles collide IF player size is less than or equal to AI size THEN the system SHALL decrement lives, SHALL play `explosion.wav`, and THEN SHALL either restart scenario (if lives remain) or trigger game-over flow.
9. WHEN player collides with a shrink bubble THEN the system SHALL set player size to 30, SHALL remove that shrink bubble, and SHALL play the shrink sound.
10. WHEN a scenario restarts after win or non-final death THEN the system SHALL pause gameplay updates for 2 seconds, SHALL increase target bubble count by 2, SHALL clear existing spawned bubbles, SHALL respawn to target count, and SHALL preserve carried state for lives/score/level progression.
11. WHEN player size reaches or exceeds 100 THEN the system SHALL treat this as level completion, SHALL play `fanfare.wav`, and SHALL advance level progression through scenario restart behavior.
12. WHEN game over occurs (lives <= 0) THEN the system SHALL stop active gameplay updates, SHALL display game-over UI with final score and restart instruction, and SHALL restart to initial baseline state on next pointerdown.
13. WHILE gameplay is running THEN the system SHALL maintain total spawned bubble count at the configured target by spawning replacement bubbles as needed.
14. WHEN spawning a bubble IF current count is below target THEN the system SHALL place the bubble within world bounds, SHALL use velocity magnitude randomized between 50 and 150 pixels per second, SHALL enforce minimum spawn separation from the player, and SHALL assign a 10% spawn probability to `ShrinkBubble`.
15. WHEN the application is loaded in a browser supporting service workers THEN the system SHALL attempt to register `/service-worker.js` on window load and SHALL continue functioning if registration fails.
16. WHEN the service worker installs and activates THEN the system SHALL cache declared core assets and SHALL serve cached responses when available before falling back to network.
17. WHEN HUD elements are rendered THEN the system SHALL position score/lives/level indicators outside the play field.
18. WHEN HUD elements are rendered THEN the system SHALL display score, level, and lives in 14pt sans-serif font at the top of the screen to the left of the game field.
19. WHEN the player transitions between levels due to win or non-final death THEN the system SHALL preserve score and SHALL increment level number on each new level.
20. WHEN the whole game restarts after game over THEN the system SHALL reset score to 0, SHALL reset level to 1, and SHALL reset bubble count to 10.

## Risks / Trade-offs
- Current random spawn and movement behavior can produce perceived difficulty spikes even with distribution constraints.
- Service worker pre-cache includes an external CDN asset; offline behavior can vary if cache population fails.
- Full scene restarts simplify state reset but may make future fine-grained transitions harder.
- Collision behavior uses strict size comparison and no invulnerability window, which may feel punishing in dense spawn states.

## Open Questions
- No open questions at this time for gameplay tuning, audio mapping, HUD placement, level/reset persistence, or restart baseline behavior.
