Hosted at: https://keithrieck.github.io/sdd_kiro_bubble/index.html

# Bubble Game

This was my first experiment in [Spec Driven Development](https://en.wikipedia.org/wiki/Spec-driven_development) using Amazon's [Kiro](https://kiro.dev/) development environment. 

## First Pass: Initial development using Kiro

The Kiro tool walks you through a series of steps:

1. **Setup**: Initially, it asks for a short summary of your project.  From this, it generates an initial [`requirements.md`](.kiro/specs/bubble-consumption-game/requirements.md) document.  My initial description was:
    * Web game where the user plays a bubble who consumes smaller bubbles but avoids larger bubbles.
2. **Requirements**: I hand-edited the requirements document extensively based on how I thought the game should go. When this was done, Kiro generated the [`design.md`](.kiro/specs/bubble-consumption-game/design.md) document.
3. **Design**: Going over the design, I realized that there were requirements that I should have added to the first document.  Then, I specified changes to the design in the chat window (rather than hand-editing the document.)  It's cool that they make use of [Mermaid](https://github.blog/developer-skills/github/include-diagrams-markdown-files-mermaid/) to generate diagrams, the code contains good [JSDoc](https://jsdoc.app/about-getting-started) comments, and there are a lot of unit tests.
    * Add requirements to the requirements specification regarding sounds.  There should be a "pop" sound when the PlayerBubble consumes a smaller AI_Bubble.  There should be an explosion sound when the PlayerBubble collides with a bubble of larger or equal size.  There should be a fanfare sound when a level is reset.
    * Add a requirement to the requirements specification regarding "AI Bubble Behavior" and random spawning of bubbles.  On the first screen, there should be 10 random AI_Bubbles.  After each subsequent scene reset, there should be 2 more random AI_Bubbles than the previous scene.
    * There should be a Phaser scene called PreloaderScene that loads any graphics and sound assets.  PreloaderScene should display a logo while assets are loading.  After PreloaderScene is finished, it should start the GameScene.   There should be a Phaser scene called BootScene that loads the logo  that PreloaderScene will display.  After BootScene is finished, it should start the PreloaderScene.  The first scene started in the game should be BootScene.
    * There should be an abstract class called Bubble.  PlayerBubble and AIBubble should extend from that class.  Code that is common between PlayerBubble and AIBubble should be moved to the parent Bubble class.
4. **Tasks**: The `design.md` document seems to contain most of the code.   After I was satisfied with the design document, Koro generated the [`tasks.md`](.kiro/specs/bubble-consumption-game/tasks.md) document.  The task list is pretty much a rote description of everything in the design document.  At this point, I told it to run the required and optional tasks.  

This step took a **long** time.  Many many hours.  The game works, although there are things to fix:
* After completing the first level, the number of lives go immedietly to zero and the game ends.  I realize that this is because the Player_Bubble stays at size 100 instead of returning to 30.  This is my fault for not specifying a requirement to revert the size.
* New AI_Bubbles are being spawned too close to the Player_Bubble.  Again, I should have made a requirement to avoid this.
* Although Kiro created sound files, those files didn't really contain any sound.

Honestly, even for this simple game, the documents generated were **large**.  To realistically review them ought to take a day or more.  It's extremely tempting to just charge forward, see what is generated, and then fix stuff later.   When using this tool in a work environment, it would take genuine discipline to read and review everything properly.

 
## Second Pass: Fix bugs in requirements, and improve 

I decide to modify the requirements and design using the chat window:

* Add a requirement that when the scenario restarts, it will pause for 2 seconds and then will reduce the Player_Bubble size back to 30.
* Add a requirement that the screen background should be dark gray, but that the Game_world background should be black.
* Add a requirement that the score and count of lives should be displayed outside the Game_World in 24 point Ariel or Helvetica.
* Add a requirement that when a new AI_Bubble is spawned, its center must be at least 200 pixels away from the center of the Player_Bubble.

These changes updated the `requirements.md` document.  I had Kiro regenerate the `design.md` and `tasks.md`.  It this point, Kiro told me the five tasks that had been updated and offered to execute the changes for me.  Again, this took a while.  Even if it only ran certain tasks, it appeaers to have executed the tests associated with all tasks.  At this point, I've consumed a total of 162.34 credits.

This was better, but:
* When the level resets, it hasn't cleared out the old bubbles.
* Kiro changed the font, but otherwise didn't implement the other UI changes at all.


## Third Pass: More fixes to requirements and design.

More requirement changes:

* Add a requirement so that, when the GameScene spawns initial bubbles, it first removes all elements from the AI_Bubble list.
* Change the requirements so that, whenever we restart the scenario, we also spawn initial bubbles.
* Add a requirement to draw a white rectangle around the Game_World.  The border of the rectangle should be 3 pixels in thickness.  The inner dimensions of the rectangle should be 800 pixels wide and 600 pixels high.

I had to manually tweak the design document to get that second requirement to be implemented.

Again, rebuilding everything took a long time.   At this point, I've expended 259.82 credits.  The game is at a decent point, but not especially challenging.  I think I'd rather work on the gameplay by hand, rather than wait for AI to fix it.


---


## Project Structure

```
/
├── index.html              # Entry point with Phaser CDN and PWA setup
├── manifest.json           # PWA manifest for installation
├── service-worker.js       # Offline caching for PWA
├── src/
│   ├── main.js            # Phaser configuration and initialization
│   ├── scenes/            # Game scenes (Boot, Preloader, Game)
│   ├── entities/          # Game entities (Bubble, PlayerBubble, AIBubble)
│   ├── systems/           # Game systems (Collision, Spawn, Movement)
│   └── ui/                # UI components (HUD)
└── assets/
    ├── images/            # Game images and icons
    └── audio/             # Sound effects
```

## Technology Stack

- **Runtime**: ES2020 in modern browsers
- **Game Framework**: Phaser 3.60+ (via CDN)
- **PWA**: Service Worker API + Web App Manifest
- **Build**: No build step required (native ES modules)

## Getting Started

1. Serve the project with a local web server:
   ```bash
   python -m http.server 8000
   # or
   npx serve
   ```

2. Open http://localhost:8000 in your browser

3. Install as PWA (optional):
   - Chrome: Click the install icon in the address bar
   - Mobile: Use "Add to Home Screen" option

## Game Controls

- **Mouse**: Click and hold to move your bubble toward the cursor
- **Touch**: Touch and hold to move your bubble toward your finger

## Game Rules

- Start with 3 lives and a size 30 bubble
- Consume smaller bubbles to grow (max size: 100)
- Avoid larger bubbles or lose a life
- Reach size 100 to win and advance to the next level
- Each level adds 2 more AI bubbles

## Requirements

- Modern browser with ES2020 support (Chrome 80+, Firefox 75+, Safari 13+)
- HTTPS or localhost for PWA features

## Development Status

✅ **All tasks complete!** The game is fully implemented with:
- Core game mechanics (player control, AI bubbles, collision detection)
- Progressive difficulty (increasing bubble count per level)
- Sound effects (pop, explosion, fanfare)
- PWA features (offline support, installable)
- Comprehensive test suite (216 tests passing)
  - Unit tests for all components
  - Property-based tests for game logic
  - Integration tests for scene flow

See `.kiro/specs/bubble-consumption-game/tasks.md` for the full implementation plan.
