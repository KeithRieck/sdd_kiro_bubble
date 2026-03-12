# Implementation Plan: Bubble Consumption Game

## Overview

This implementation plan breaks down the bubble consumption game into discrete coding tasks. The game is built with JavaScript ES2020 and Phaser 3, following a client-side only architecture. The visual design features a dark gray screen background (#808080) with a black Game_World area (#000000) surrounded by a white 3-pixel border (800x600 inner dimensions). The HUD displays score and lives outside the Game_World in 24-point Arial/Helvetica font. AI bubbles spawn at least 200 pixels away from the player. When scenarios restart (from winning or losing a life), the game pauses for 2 seconds, clears the AI_Bubble list, resets the player bubble size to 30 pixels, and spawns initial bubbles for the new scenario. Implementation proceeds incrementally: project setup → core entities → game systems → scene orchestration → PWA features → testing.

## Tasks

- [ ] 1. Set up project structure and dependencies
  - Create directory structure (src/scenes, src/entities, src/systems, src/ui, assets/images, assets/audio)
  - Create index.html with Phaser CDN link and service worker registration
  - Create manifest.json for PWA configuration
  - Set up basic HTML structure with game container
  - _Requirements: 8.1, 8.2_

- [ ] 2. Implement abstract Bubble base class
  - [ ] 2.1 Create Bubble.js with constructor and common properties
    - Implement constructor with scene, x, y, size parameters
    - Add abstract class check to prevent direct instantiation
    - Implement getRadius() method
    - Implement isWithinBounds() and constrainToBounds() methods
    - _Requirements: 2.3, 2.4, 5.1_
  
  - [ ]* 2.2 Write property test for boundary constraint
    - **Property 1: Player Bubble Boundary Constraint**
    - **Validates: Requirements 2.3, 2.4**
  
  - [ ] 2.3 Add abstract update() and render() methods
    - Define abstract methods that throw errors if not overridden
    - _Requirements: 5.1_

- [ ] 3. Implement PlayerBubble class
  - [ ] 3.1 Create PlayerBubble.js extending Bubble
    - Implement constructor with default size 30
    - Add targetX and targetY properties
    - Implement getSpeed() method (inversely proportional to size)
    - _Requirements: 2.2, 7.1_
  
  - [ ]* 3.2 Write property test for speed calculation
    - **Property 2: Speed Inversely Proportional to Size**
    - **Validates: Requirements 2.2**
  
  - [ ] 3.3 Implement update() method with movement logic
    - Calculate direction vector to target
    - Apply speed-based movement with delta time
    - Constrain position to world boundaries
    - _Requirements: 2.1, 2.3, 2.4_
  
  - [ ]* 3.4 Write property test for input target setting
    - **Property 3: Input Sets Movement Target**
    - **Validates: Requirements 2.1, 9.1, 9.2**
  
  - [ ] 3.5 Implement setTarget() method
    - Set targetX and targetY from input coordinates
    - _Requirements: 2.1_
  
  - [ ] 3.6 Implement grow() method
    - Calculate growth as floor(sqrt(consumedSize))
    - Cap size at 100 pixels
    - _Requirements: 3.4_
  
  - [ ]* 3.7 Write property test for growth calculation
    - **Property 6: Growth Calculation**
    - **Validates: Requirements 3.4**
  
  - [ ] 3.8 Implement render() method
    - Draw gray circle with blue border using Phaser Graphics
    - _Requirements: 5.2_

- [ ] 4. Implement AIBubble class
  - [ ] 4.1 Create AIBubble.js extending Bubble
    - Implement constructor with velocityX and velocityY parameters
    - Add color property with pastel color generation
    - Implement generatePastelColor() and hslToHex() helper methods
    - _Requirements: 4.1, 4.2, 5.3_
  
  - [ ] 4.2 Implement update() method with boundary bouncing
    - Update position based on velocity and delta time
    - Reverse velocity components when hitting boundaries
    - _Requirements: 4.3, 4.4_
  
  - [ ]* 4.3 Write property test for boundary bouncing
    - **Property 11: AI Bubble Boundary Bouncing**
    - **Validates: Requirements 4.4**
  
  - [ ]* 4.4 Write property test for constant velocity
    - **Property 12: AI Bubble Constant Velocity**
    - **Validates: Requirements 4.3**
  
  - [ ] 4.5 Implement render() method
    - Draw colored circle with no border using Phaser Graphics
    - _Requirements: 5.3_

- [ ] 5. Implement CollisionSystem
  - [ ] 5.1 Create CollisionSystem.js with static methods
    - Implement checkCollision() using circle-to-circle distance
    - Implement resolveCollision() returning action and data
    - _Requirements: 3.1, 11.1, 11.2, 11.3_
  
  - [ ]* 5.2 Write property test for collision detection
    - **Property 4: Collision Detection by Distance**
    - **Validates: Requirements 11.1, 11.2, 11.3**
  
  - [ ]* 5.3 Write property test for consumption score increase
    - **Property 5: Consumption Increases Score**
    - **Validates: Requirements 3.2, 6.4**
  
  - [ ]* 5.4 Write property test for area conservation
    - **Property 7: Area Conservation**
    - **Validates: Requirements 3.5**
  
  - [ ]* 5.5 Write property test for death on larger collision
    - **Property 8: Death on Larger Collision**
    - **Validates: Requirements 3.3**

- [ ] 6. Checkpoint - Ensure core entity tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement SpawnSystem
  - [ ] 7.1 Create SpawnSystem.js with constructor
    - Initialize with scene, worldWidth, worldHeight, initialBubbleCount
    - Add targetBubbleCount property (starts at 10)
    - Implement incrementDifficulty() and getTargetCount() methods
    - _Requirements: 4.6, 4.7_
  
  - [ ] 7.2 Implement calculateSizeRange() method
    - Calculate min as max(10, 0.5 * playerSize)
    - Calculate max as min(70, 1.5 * playerSize)
    - _Requirements: 4.5, 12.1, 12.2_
  
  - [ ]* 7.3 Write property test for AI bubble size range
    - **Property 15: AI Bubble Size Range**
    - **Validates: Requirements 4.5, 5.3**
  
  - [ ]* 7.4 Write property test for dynamic size scaling
    - **Property 16: Dynamic Size Scaling**
    - **Validates: Requirements 12.1, 12.2**
  
  - [ ] 7.5 Implement generateBalancedSize() method
    - 30% chance for size < playerSize
    - 50% chance for size ≈ playerSize
    - 20% chance for size > playerSize
    - _Requirements: 12.3, 12.4_
  
  - [ ]* 7.6 Write property test for smaller bubble distribution
    - **Property 17: Smaller Bubble Distribution**
    - **Validates: Requirements 12.3**
  
  - [ ]* 7.7 Write property test for larger bubble distribution
    - **Property 18: Larger Bubble Distribution**
    - **Validates: Requirements 12.4**
  
  - [ ] 7.8 Implement getRandomPosition() method with player distance constraint
    - Generate position with margin from edges
    - Ensure position is at least 200 pixels from player bubble center
    - Use retry loop with max attempts to find valid position
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 7.9 Write property test for spawn distance from player
    - **Property 28: AI Bubble Spawn Distance from Player**
    - **Validates: Requirements 4.2**
  
  - [ ]* 7.10 Write property test for spawn position within bounds
    - **Property 14: AI Bubble Spawn Position**
    - **Validates: Requirements 4.1**
  
  - [ ] 7.11 Implement getRandomVelocity() method
    - Generate velocity with random angle and speed 50-150 px/s
    - _Requirements: 4.3_
  
  - [ ] 7.12 Implement spawnBubble() method
    - Check if at capacity
    - Create AIBubble with balanced size and random position/velocity
    - Pass player position to getRandomPosition for distance check
    - _Requirements: 4.1, 4.2, 4.6, 4.8_

- [ ] 8. Implement HUD class
  - [ ] 8.1 Create HUD.js with constructor
    - Create score and lives text elements using Phaser
    - Position outside Game_World area (e.g., top-left corner)
    - Use 24 point Arial or Helvetica font
    - _Requirements: 1.5, 6.1, 6.2, 6.3_
  
  - [ ]* 8.2 Write property test for HUD font specification
    - **Property 33: HUD Font Specification**
    - **Validates: Requirements 6.3**
  
  - [ ]* 8.3 Write property test for score visibility
    - **Property 20: Score Always Visible**
    - **Validates: Requirements 1.5**
  
  - [ ] 8.4 Implement render() method
    - Update score and lives text displays
    - _Requirements: 1.5_
  
  - [ ] 8.5 Implement showGameOver() method
    - Display final score and restart option
    - Set up click handler for restart
    - _Requirements: 7.2, 7.3_
  
  - [ ]* 8.6 Write property test for game over display
    - **Property 21: Game Over Display**
    - **Validates: Requirements 7.2, 7.3**

- [ ] 9. Implement BootScene
  - [ ] 9.1 Create BootScene.js
    - Implement preload() to load logo image
    - Implement create() to transition to PreloaderScene
    - _Requirements: 8.5_
  
  - [ ]* 9.2 Write unit test for BootScene
    - Test logo loading
    - Test scene transition to PreloaderScene

- [ ] 10. Implement PreloaderScene
  - [ ] 10.1 Create PreloaderScene.js
    - Display logo in preload()
    - Create progress bar graphics
    - Load sound effects (pop, explosion, fanfare)
    - Update progress bar on load events
    - Transition to GameScene on complete
    - _Requirements: 13.4, 8.5_
  
  - [ ]* 10.2 Write unit test for PreloaderScene
    - Test asset loading
    - Test progress bar updates
    - Test scene transition to GameScene

- [ ] 11. Checkpoint - Ensure scene and UI tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement GameScene core structure
  - [ ] 12.1 Create GameScene.js with constructor and properties
    - Initialize worldWidth (800), worldHeight (600)
    - Initialize lives (3), score (0), currentBubbleCount (10)
    - Add properties for playerBubble, aiBubbles array, spawnSystem, hud, sounds
    - Add isPaused property for scenario restart pause state
    - _Requirements: 1.1, 1.6, 2.3, 7.1_
  
  - [ ] 12.2 Implement init() method
    - Preserve bubbleCount across scene restarts
    - _Requirements: 4.7_
  
  - [ ] 12.3 Implement create() method
    - Initialize game state (lives, score)
    - Create black background rectangle for Game_World (800x600, color #000000)
    - Create white 3-pixel border around Game_World (800x600 inner dimensions)
    - Load sound effects
    - Create PlayerBubble at center with size 30
    - Initialize SpawnSystem with currentBubbleCount
    - Call spawnInitialBubbles()
    - Set up input handlers
    - Create HUD
    - _Requirements: 1.1, 5.5, 5.6, 7.1, 13.4_
  
  - [ ]* 12.4 Write property test for Game_World background color
    - **Property 32: Game World Background Color**
    - **Validates: Requirements 5.5**
  
  - [ ]* 12.5 Write property test for Game_World border rendering
    - **Property 35: Game World Border Rendering**
    - **Validates: Requirements 5.6**
  
  - [ ]* 12.6 Write unit test for initial game state
    - Test 3 lives at start
    - Test player bubble at center with size 30
    - Test 10 AI bubbles spawned initially
    - Test black Game_World background exists
    - Test white 3-pixel border around Game_World

- [ ] 13. Implement GameScene game loop
  - [ ] 13.1 Implement update() method
    - Skip all updates if isPaused is true
    - Update player bubble
    - Update all AI bubbles
    - Call checkCollisions()
    - Call maintainBubbleCount()
    - Check win condition (size >= 100)
    - Call render()
    - _Requirements: 1.4, 1.6, 10.1, 10.2_
  
  - [ ]* 13.2 Write property test for continuous movement
    - **Property 22: Continuous Movement**
    - **Validates: Requirements 9.3**
  
  - [ ] 13.3 Implement checkCollisions() method
    - Loop through AI bubbles
    - Check collision with player using CollisionSystem
    - Handle consumption (increase score, grow player, remove AI, play pop sound)
    - Handle death (play explosion sound, call handleDeath())
    - _Requirements: 3.1, 3.2, 11.4, 13.1, 13.2_
  
  - [ ]* 13.4 Write property test for pop sound on consumption
    - **Property 24: Pop Sound on Consumption**
    - **Validates: Requirements 13.1**
  
  - [ ]* 13.5 Write property test for explosion sound on death
    - **Property 25: Explosion Sound on Death**
    - **Validates: Requirements 13.2**
  
  - [ ] 13.6 Implement maintainBubbleCount() method
    - Spawn new bubbles until reaching target count
    - Pass player position to spawnBubble for distance check
    - _Requirements: 4.2, 4.8_
  
  - [ ]* 13.7 Write property test for bubble count invariant
    - **Property 13: AI Bubble Count Invariant**
    - **Validates: Requirements 4.6, 4.7, 4.8**
  
  - [ ] 13.8 Implement render() method
    - Render all AI bubbles
    - Render player bubble
    - Update HUD
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 13.9 Write property test for bubble radius rendering
    - **Property 19: Bubble Radius Rendering**
    - **Validates: Requirements 5.1**

- [ ] 14. Implement GameScene state transitions
  - [ ] 14.1 Implement handleDeath() method
    - Decrement lives
    - If lives > 0: play fanfare, increment currentBubbleCount by 2, call restartScenarioWithPause()
    - If lives = 0: call handleGameOver()
    - _Requirements: 1.2, 1.6, 3.3, 4.7, 13.3_
  
  - [ ]* 14.2 Write property test for life decrement
    - **Property 9: Life Decrement**
    - **Validates: Requirements 1.2**
  
  - [ ]* 14.3 Write property test for fanfare sound on reset
    - **Property 26: Fanfare Sound on Level Reset**
    - **Validates: Requirements 13.3**
  
  - [ ]* 14.4 Write property test for progressive bubble count
    - **Property 27: Progressive Bubble Count**
    - **Validates: Requirements 4.7**
  
  - [ ] 14.5 Implement handleWin() method
    - Play fanfare sound
    - Increment currentBubbleCount by 2
    - Call restartScenarioWithPause()
    - _Requirements: 1.4, 1.6, 4.7, 13.3_
  
  - [ ]* 14.6 Write property test for win condition reset
    - **Property 10: Win Condition Reset**
    - **Validates: Requirements 1.4**
  
  - [ ] 14.7 Implement restartScenarioWithPause() method
    - Set isPaused to true
    - Use Phaser time.delayedCall to wait 2000ms
    - After delay: set isPaused to false, reset player bubble size to 30, clear AI_Bubble list, call spawnInitialBubbles(), restart scene
    - _Requirements: 1.6, 1.7, 1.8, 4.9, 4.10_
  
  - [ ]* 14.8 Write property test for AI_Bubble list cleared on restart
    - **Property 34: AI Bubble List Cleared on Restart**
    - **Validates: Requirements 4.9**
  
  - [ ]* 14.9 Write property test for scenario restart pause duration
    - **Property 29: Scenario Restart Pause Duration**
    - **Validates: Requirements 1.6**
  
  - [ ]* 14.10 Write property test for player size reset on restart
    - **Property 30: Player Size Reset on Scenario Restart**
    - **Validates: Requirements 1.7**
  
  - [ ] 14.11 Implement handleGameOver() method
    - Pause scene
    - Show game over display via HUD
    - _Requirements: 1.3, 7.2, 7.3_

- [ ] 15. Implement GameScene input handling
  - [ ] 15.1 Implement setupInput() method
    - Add pointermove listener to set player target when pointer is down
    - Add pointerdown listener to set player target
    - _Requirements: 2.1, 9.1, 9.2, 9.3_
  
  - [ ]* 15.2 Write property test for input coordinate normalization
    - **Property 23: Input Coordinate Normalization**
    - **Validates: Requirements 9.4**
  
  - [ ] 15.3 Implement spawnInitialBubbles() helper method
    - Clear AI_Bubble list to ensure clean state
    - Spawn bubbles up to target count
    - _Requirements: 1.8, 4.6, 4.9, 4.10_

- [ ] 16. Checkpoint - Ensure GameScene tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Create main.js and wire everything together
  - [ ] 17.1 Create main.js with Phaser configuration
    - Import all scene classes
    - Configure Phaser with 800x600 dimensions
    - Set backgroundColor to #808080 (dark gray screen background)
    - Set scene array: [BootScene, PreloaderScene, GameScene]
    - Configure arcade physics
    - Create Phaser.Game instance
    - _Requirements: 2.3, 5.4, 10.1_
  
  - [ ]* 17.2 Write property test for screen background color
    - **Property 31: Screen Background Color**
    - **Validates: Requirements 5.4**
  
  - [ ]* 17.3 Write integration test for scene flow
    - Test BootScene → PreloaderScene → GameScene transitions

- [ ] 18. Implement PWA features
  - [ ] 18.1 Create service-worker.js
    - Define cache name and URLs to cache
    - Implement install event handler to cache assets
    - Implement fetch event handler for cache-first strategy
    - _Requirements: 8.1, 8.4, 8.5_
  
  - [ ]* 18.2 Write unit test for service worker
    - Test cache storage
    - Test offline functionality
  
  - [ ] 18.3 Update index.html with service worker registration
    - Add service worker registration script
    - Add manifest link
    - _Requirements: 8.1, 8.2_
  
  - [ ]* 18.4 Write unit test for PWA configuration
    - Test manifest validity
    - Test service worker registration

- [ ] 19. Create placeholder assets
  - [ ] 19.1 Create placeholder logo.png
    - Create simple 200x200 logo image
    - _Requirements: 8.5_
  
  - [ ] 19.2 Create placeholder sound files
    - Create or source pop.wav, explosion.mp3, fanfare.wav
    - _Requirements: 13.4_
  
  - [ ] 19.3 Create PWA icons
    - Create icon-192.png and icon-512.png
    - _Requirements: 8.2_

- [ ] 20. Final integration and testing
  - [ ]* 20.1 Test complete game flow
    - Verify all scenes transition correctly
    - Verify player can consume bubbles and grow
    - Verify death and life system works
    - Verify win condition triggers 2-second pause and scene reset
    - Verify player bubble resets to 30 pixels after pause
    - Verify AI_Bubble list is cleared before spawning on restart
    - Verify initial bubbles are spawned after restart
    - Verify progressive difficulty increases bubble count
    - Verify AI bubbles spawn at least 200 pixels from player
    - Verify screen background is dark gray (#808080)
    - Verify Game_World background is black (#000000)
    - Verify Game_World has white 3-pixel border with 800x600 inner dimensions
    - Verify HUD displays in 24pt Arial/Helvetica font
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 1.8, 3.2, 3.3, 3.4, 4.2, 4.7, 4.9, 4.10, 5.4, 5.5, 5.6, 6.3_
  
  - [ ]* 20.2 Run all property tests with extended iterations
    - Run all 35 property tests with 1000 iterations each
  
  - [ ]* 20.3 Test PWA installation and offline functionality
    - Verify game can be installed
    - Verify game works offline after installation
    - _Requirements: 8.3, 8.4_
  
  - [ ]* 20.4 Test cross-device compatibility
    - Test mouse input on desktop
    - Test touch input on mobile/tablet
    - _Requirements: 9.1, 9.2, 9.4_

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and integration points
- The implementation follows an incremental approach: entities → systems → scenes → integration
- All 35 correctness properties from the design document are covered by property test tasks
- PWA features are implemented last to ensure core game functionality is solid first
- New specifications include: dark gray screen background (#808080), black Game_World background (#000000), white 3-pixel border around Game_World (800x600 inner dimensions), 24pt font for HUD, 200px AI spawn distance from player, 2-second pause on scenario restart, player size reset to 30 pixels after pause, AI_Bubble list clearing before spawning on restart, and initial bubble spawning whenever scenario restarts
