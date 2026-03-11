Hosted at: https://keithrieck.github.io/sdd_kiro_bubble/index.html

# Bubble Game

This was a little experiment in [Spec Driven Development](https://en.wikipedia.org/wiki/Spec-driven_development) using Amazon's [Kiro](https://kiro.dev/) development environment. 

## Initial development using Kiro

The Kiro tool walks you through a series of steps:

1. **Setup**: Initially, it asks for a short summary of your project.  From this, it generates an initial [`requirements.md`](blob/master/.kiro/specs/bubble-consumption-game/requirements.md) document.  My initial description was:
    * Web game where the user plays a bubble who consumes smaller bubbles but avoids larger bubbles.
2. **Requirements**: I hand-edited the requirements document extensively based on how I thought the game should go. When this was done, Kiro generated the [`design.md`](blob/master/.kiro/specs/bubble-consumption-game/design.md) document.
3. **Design**: Going over the design, I realized that there were requirements that I should have added to the first document.  Then, I specified changes to the design in the chat window (rather than hand-editing the document.)
    * Add requirements to the requirements specification regarding sounds.  There should be a "pop" sound when the PlayerBubble consumes a smaller AI_Bubble.  There should be an explosion sound when the PlayerBubble collides with a bubble of larger or equal size.  There should be a fanfare sound when a level is reset.
    * Add a requirement to the requirements specification regarding "AI Bubble Behavior" and random spawning of bubbles.  On the first screen, there should be 10 random AI_Bubbles.  After each subsequent scene reset, there should be 2 more random AI_Bubbles than the previous scene.
    * There should be a Phaser scene called PreloaderScene that loads any graphics and sound assets.  PreloaderScene should display a logo while assets are loading.  After PreloaderScene is finished, it should start the GameScene.   There should be a Phaser scene called BootScene that loads the logo  that PreloaderScene will display.  After BootScene is finished, it should start the PreloaderScene.  The first scene started in the game should be BootScene.
    * There should be an abstract class called Bubble.  PlayerBubble and AIBubble should extend from that class.  Code that is common between PlayerBubble and AIBubble should be moved to the parent Bubble class.
4. **Tasks**: The `design.md` document seems to contain most of the code.   After I was satisfied with the design document, Koro generated the [`tasks.md`](blob/master/.kiro/specs/bubble-consumption-game/tasks.md) document.  The task list is pretty much a rote description of everything in the design document.  At this point, I told it to run the required and optional tasks.  

This step took a **long** time.  Many many hours.  Towards the end of the task list, Kiro announced that I was approaching the end of the "agent context limit".

I probably should have initialized git first and then made the initial commit be just the Markdown documents.  The 'run' process actually appended text to this README file.

Honestly, even for this simple game, the documents generated were **large**.  To realistically review them ought to take a day or more.  It's extremely tempting to just charge forward, see what is generated, and then fix stuff later.   When using this tool in a work environment, it would take genuine discipline to read and review everything properly.

For the initial development, I used Kiro on their Free tier, which provides 50 credits per month.  It appears that generating the spec cost around 10 credits and running the tasks also cost around 10. 

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
