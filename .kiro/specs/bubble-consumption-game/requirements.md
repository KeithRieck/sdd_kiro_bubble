# Requirements Document

## Introduction

A browser-based Progressive Web Application (PWA) game where the player controls a bubble that grows by consuming smaller bubbles while avoiding larger bubbles. The game is implemented using ES2020 and the Phaser game library, executing entirely client-side without server communication.

## Glossary

- **Game**: The bubble consumption web application
- **Player_Bubble**: The bubble controlled by the player
- **AI_Bubble**: A computer-controlled bubble in the game world
- **Game_World**: The playable area containing all bubbles 
- **Collision**: Physical contact between two bubbles
- **Size**: The diameter measurement of a bubble
- **PWA**: Progressive Web Application with offline capability
- **Game_Session**: A single playthrough from start to game over
- **Score**: An integer

## Requirements

### Requirement 1: Game duration

**User Story:** The player initially has 3 lives.  The player will have a score which starts at 0.  When a player reaches the goal Size of 100 pixels, the Game will clear and reset.

#### Acceptance Criteria

1. WHEN the game begins the player will have 3 lives.
2. WHEN a life is lost, the whole scenario will be restarted with 1 less life.
3. WHEN the last life is lost, the game is over.
4. WHEN the Player_Bubble has reached the goal Size of 100 pixels, the Game will clear and the scenario will be restarted.
5. The Score will be displayed at all times.
6. WHEN the scenario restarts (either from winning by reaching 100 pixels or losing a life), THE Game SHALL pause for 2 seconds.
7. WHEN the 2 second pause completes, THE Game SHALL reduce the Player_Bubble Size to 30 pixels.
8. WHEN the scenario restarts, THE Game SHALL spawn initial AI_Bubbles for the new scenario.

### Requirement 2: Player Bubble Control

**User Story:** As a player, I want to control my bubble's movement, so that I can navigate toward smaller bubbles and away from larger ones.

#### Acceptance Criteria

1. WHEN the player provides input via mouse or touch, THE Game SHALL move the Player_Bubble toward the input position
2. THE Player_Bubble SHALL move at a speed inversely proportional to its current Size
3. THE Game SHALL constrain the Player_Bubble within the Game_World boundaries which will be 800 pixels wide by 600 pixels high
4. WHEN the Player_Bubble reaches a Game_World boundary, THE Game SHALL prevent further movement in that direction

### Requirement 3: Bubble Consumption Mechanics

**User Story:** As a player, I want to consume smaller bubbles to grow, so that I can become larger and consume more bubbles.

#### Acceptance Criteria

1. WHEN a Collision occurs between the Player_Bubble and an AI_Bubble, THE Game SHALL compare their Size values
2. IF the Player_Bubble Size is greater than the AI_Bubble Size, THEN THE Game SHALL remove the AI_Bubble and the AI_Bubble Size will be added to the Score.
3. IF the AI_Bubble Size is greater than or equal to the Player_Bubble Size, THEN THE player will lose one life and the scenario will be restarted.
4. THE Game SHALL calculate the new Player_Bubble Size by adding integer square root of the AI_Bubble to the Size of the Player_Bubble, but never allowing the Size to increase higher than 100 pixels
5. FOR ALL bubble consumption events, the total area before and after consumption SHALL remain constant (invariant property)

### Requirement 4: AI Bubble Behavior

**User Story:** As a player, I want AI bubbles to move autonomously, so that the game presents a dynamic challenge.

#### Acceptance Criteria

1. THE Game SHALL spawn AI_Bubbles at random positions within the Game_World
2. WHEN an AI_Bubble is spawned, THE Game SHALL position its center at least 200 pixels away from the center of the Player_Bubble
3. WHILE an AI_Bubble exists, THE Game SHALL move it in a consistent direction at constant velocity
4. WHEN an AI_Bubble reaches a Game_World boundary, THE Game SHALL reverse its direction
5. THE Game SHALL assign each AI_Bubble a random Size within a defined range at spawn time
6. THE Game SHALL spawn 10 AI_Bubbles on the first scene
7. WHEN a scenario is restarted (either from winning by reaching 100 pixels or losing a life), THE Game SHALL spawn 2 more AI_Bubbles than the previous scenario
8. THE Game SHALL maintain the spawned AI_Bubble count throughout each scenario
9. WHEN the scenario restarts, THE Game SHALL first remove all elements from the AI_Bubble list to ensure a clean state
10. WHEN the scenario restarts, THE Game SHALL spawn the initial AI_Bubbles for the new scenario

### Requirement 5: Visual Representation

**User Story:** As a player, I want to see bubbles with clear size differences, so that I can quickly identify which bubbles to pursue or avoid.

#### Acceptance Criteria

1. THE Game SHALL render each bubble as a circle with radius proportional to its Size
2. THE Game SHALL render the Player_Bubble as a gray circle with a blue border whose Size is initially 30 pixels.
3. THE Game SHALL render AI_Bubbles with random pastel colors with no border and will have Size of between 10 and 70 pixels.
4. THE Game SHALL render the screen background as dark gray
5. THE Game SHALL render the Game_World background as black
6. THE Game SHALL draw a white rectangle border around the Game_World with 3 pixels thickness and inner dimensions of 800 pixels wide by 600 pixels high

### Requirement 6: HUD Display

**User Story:** As a player, I want to see my current score and remaining lives at all times, so that I can track my progress and status during gameplay.

#### Acceptance Criteria

1. THE Game SHALL display the Score outside the Game_World
2. THE Game SHALL display the count of lives outside the Game_World
3. THE Game SHALL render the Score and lives count in 16 point Arial or Helvetica font
4. THE Game SHALL update the displayed Score immediately when the Player_Bubble consumes an AI_Bubble
5. THE Game SHALL update the displayed lives count immediately when a life is lost


### Requirement 7: Game Session Management

**User Story:** As a player, I want to start new games and see my progress, so that I can track my performance.

#### Acceptance Criteria

1. WHEN the player initiates a new game, THE Game SHALL initialize the Player_Bubble at the center of the Game_World with a default Size of 30 pixels
2. WHEN a Game_Session ends, THE Game SHALL display the final Score
3. THE Game SHALL provide a restart option after a Game_Session ends
4. THE Game SHALL track and display the number of AI_Bubbles consumed during the current Game_Session

### Requirement 8: Progressive Web Application Features

**User Story:** As a player, I want to install and play the game offline, so that I can play without an internet connection.

#### Acceptance Criteria

1. THE Game SHALL register a service worker for offline functionality
2. THE Game SHALL provide a web app manifest file with installation metadata
3. WHEN the player installs the PWA, THE Game SHALL be accessible from the device home screen
4. THE Game SHALL function without network connectivity after initial installation
5. THE Game SHALL cache all required assets for offline play

### Requirement 9: Input Handling

**User Story:** As a player, I want to use mouse or touch input, so that I can play on desktop or mobile devices.

#### Acceptance Criteria

1. WHEN the player uses mouse input, THE Game SHALL interpret mouse position as the movement target
2. WHEN the player uses touch input, THE Game SHALL interpret touch position as the movement target
3. THE Game SHALL support continuous movement while mouse button is held or touch is maintained
4. THE Game SHALL normalize input coordinates across different screen sizes and resolutions

### Requirement 10: Performance Requirements

**User Story:** As a player, I want smooth gameplay, so that I can react quickly to game events.

#### Acceptance Criteria

1. THE Game SHALL maintain a frame rate of at least 30 frames per second on devices meeting minimum specifications
2. THE Game SHALL update all bubble positions at least 30 times per second
3. THE Game SHALL detect all Collision events within one frame of occurrence
4. THE Game SHALL render the Game_World at the device's native resolution up to 1920x1080 pixels

### Requirement 11: Collision Detection

**User Story:** As a player, I want accurate collision detection, so that the game feels fair and responsive.

#### Acceptance Criteria

1. WHEN two bubbles overlap, THE Game SHALL detect a Collision
2. THE Game SHALL calculate Collision using circle-to-circle distance comparison
3. WHEN the distance between two bubble centers is less than the sum of their radii, THE Game SHALL register a Collision
4. THE Game SHALL process all Collision events before rendering the next frame

### Requirement 12: Game Balance

**User Story:** As a player, I want a balanced difficulty curve, so that the game remains challenging as I grow.

#### Acceptance Criteria

1. THE Game SHALL spawn AI_Bubbles with Size values ranging from 50% to 150% of the current Player_Bubble Size
2. WHEN the Player_Bubble Size increases, THE Game SHALL proportionally increase the average AI_Bubble Size
3. THE Game SHALL ensure at least 30% of AI_Bubbles are smaller than the Player_Bubble at any time
4. THE Game SHALL ensure at least 20% of AI_Bubbles are larger than the Player_Bubble at any time

### Requirement 13: Sound Effects

**User Story:** As a player, I want audio feedback for game events, so that I have a more engaging and immersive experience.

#### Acceptance Criteria

1. WHEN the Player_Bubble consumes a smaller AI_Bubble, THE Game SHALL play a "pop" sound effect
2. WHEN the Player_Bubble collides with an AI_Bubble of larger or equal Size, THE Game SHALL play an "explosion" sound effect
3. WHEN a level is reset (either from winning or losing a life), THE Game SHALL play a "fanfare" sound effect
4. THE Game SHALL load all sound assets during the PreloaderScene phase
5. THE Game SHALL support muting and unmuting of sound effects
