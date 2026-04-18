# Implementation Plan: Bubble Consumption Game

## Overview

This task list reflects the current state of the codebase and the updated design requirements. All previously completed work is marked done. The remaining tasks implement level tracking, the stopGame() method, and the updated handleGameOver() behavior.

## Tasks

- [x] 1. Set up project structure and dependencies
- [x] 2. Implement abstract Bubble base class
- [x] 3. Implement PlayerBubble class
- [x] 4. Implement AIBubble class
- [x] 4.6 Implement ShrinkBubble class
- [x] 5. Implement CollisionSystem
- [x] 6. Checkpoint - Ensure core entity tests pass
- [x] 7. Implement SpawnSystem
- [x] 8. Implement HUD class
- [x] 9. Implement BootScene
- [x] 10. Implement PreloaderScene
- [x] 11. Checkpoint - Ensure scene and UI tests pass
- [x] 12. Implement GameScene core structure
- [x] 13. Implement GameScene game loop
- [x] 14. Implement GameScene state transitions
- [x] 15. Implement GameScene input handling
- [x] 16. Checkpoint - Ensure GameScene tests pass
- [x] 17. Create main.js and wire everything together
- [x] 18. Implement PWA features
- [x] 19. Create placeholder assets

- [x] 20. Add level tracking to GameScene
  - [x] 20.1 Add level and isStopped to GameScene constructor
    - Add this.level = 1 alongside other state properties
    - Add this.isStopped = false for game over stopped state
    - _Requirements: 1.9, 7.5_
  - [x] 20.2 Preserve level in GameScene init() method
    - Read data.level and assign to this.level if present, default to 1
    - _Requirements: 1.9_
  - [x] 20.3 Increment level in restartScenarioWithPause()
    - Add this.level++ inside the delayedCall callback before scene.restart()
    - Pass level: this.level in the scene.restart() data object
    - _Requirements: 1.10_
  - [x] 20.4 Pass level to HUD in GameScene render()
    - Update this.hud.render call to include this.level as third argument
    - _Requirements: 6.6_
  - [x] 20.5 Update GameScene update() to skip when isStopped
    - Change the isPaused check to also check isStopped
    - _Requirements: 7.6_

- [x] 21. Add stopGame() to GameScene
  - [x] 21.1 Implement GameScene stopGame() method
    - Set this.isStopped = true
    - Call this.input.removeAllListeners() to remove all existing input handlers
    - Register this.input.once pointerdown that restarts with bubbleCount 10, level 1, score 0
    - _Requirements: 7.5, 7.6, 7.7, 7.8_
  - [x] 21.2 Update GameScene handleGameOver() to call stopGame()
    - Replace this.scene.pause() with this.stopGame()
    - Keep this.hud.showGameOver(this.score) call
    - _Requirements: 7.9_

- [x] 22. Add level display to HUD
  - [x] 22.1 Add levelText to HUD
    - Add this.levelText = null to constructor
    - Add level text element at position (10, 70) with same 24pt font style in createUI()
    - _Requirements: 6.6_
  - [x] 22.2 Update HUD render() to accept and display level
    - Change signature to render(score, lives, level)
    - Add levelText update inside render()
    - _Requirements: 6.6, 6.7_
  - [x] 22.3 Remove restart listener from HUD showGameOver()
    - Remove the scene.input.once pointerdown block from showGameOver()
    - Restart is now handled by stopGame() in GameScene
    - _Requirements: 7.9_

- [x] 23. Final checkpoint - Ensure all tests pass
  - Run full test suite and fix any failures
