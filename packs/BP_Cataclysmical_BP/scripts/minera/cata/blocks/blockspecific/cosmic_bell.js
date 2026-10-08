import { world, system } from "@minecraft/server";

const frames = [
  null, // 0 is default
  "mnra_cata:cosmic_bell_frame1",
  "mnra_cata:cosmic_bell_frame2",
  "mnra_cata:cosmic_bell_frame3",
  "mnra_cata:cosmic_bell_frame4",
  "mnra_cata:cosmic_bell_frame5",
  "mnra_cata:cosmic_bell_frame6",
  "mnra_cata:cosmic_bell_frame7",
  "mnra_cata:cosmic_bell_frame8"
];

const animationOrder = [
  0, 1, 2, 3, 4, 3, 2, 1, 0,
  5, 6, 7, 8, 7, 6, 5, 0
];

export function animateCosmicBell(block, tickSpeed = 0.1) {
  if (!block) return;

  const loc = block.location;
  const dim = block.dimension;

  let step = 0;
  const totalSteps = animationOrder.length * 2;

  const intervalId = system.runInterval(() => {

    const currentBlock = dim.getBlock(loc);

    if (!currentBlock || currentBlock.typeId !== "mnra_cata:cosmic_bell") {
      system.clearRun(intervalId);
      return;
    }

    if (step >= totalSteps) {
      system.clearRun(intervalId);
      return;
    }

    const frameIndex = animationOrder[step % animationOrder.length];
    const activeState = frames[frameIndex];

    let perm = currentBlock.permutation;

    for (let i = 1; i <= 8; i++) {
      perm = perm.withState(`mnra_cata:cosmic_bell_frame${i}`, false);
    }
    if (activeState !== null) {
      perm = perm.withState(activeState, true);
    }

    currentBlock.setPermutation(perm);

    step++;

  }, tickSpeed);
}


//block logic
const CooldownMS = 5 * 60 * 1000;
const cooldowns = new Map();

function posKey(block) {
  const p = block.location;
  return `${Math.floor(p.x)},${Math.floor(p.y)},${Math.floor(p.z)}`;
}

function playSoundSafe(sound, block, player, pitch = 1, volume = 1) {
  const loc = block.location;
  const bx = Math.floor(loc.x);
  const by = Math.floor(loc.y);
  const bz = Math.floor(loc.z);

  if (typeof world.playSound === "function") {
    try {
      world.playSound(sound, { location: loc, pitch, volume });
      return;
    } catch { }
  }

  if (typeof player.playSound === "function") {
    try {
      player.playSound(sound, { location: loc, pitch, volume });
      return;
    } catch { }
  }

  try {
    const dim = block.dimension ?? world.getDimension("overworld");
    dim.runCommand(`playsound ${sound} master @a ${bx} ${by} ${bz} ${volume} ${pitch}`);
  } catch { }
}

system.beforeEvents.startup.subscribe((ev) => {
  ev.blockComponentRegistry.registerCustomComponent("mnra_cata:cosmic_bell_interact", {
    onPlayerInteract(event) {
      const { block, player } = event;
      const key = posKey(block);
      const now = Date.now();

      if (cooldowns.has(key)) {
        const expires = cooldowns.get(key);
        const remaining = expires - now;

        if (remaining > 0) {
          const secondsLeft = Math.ceil(remaining / 1000);
          playSoundSafe("note.harp", block, player, 1.2, 0.5);

          player.onScreenDisplay.setActionBar(
            `§cThe Cosmic Bell is recharging §e${secondsLeft}s §cleft.`
          );
          return;
        }
      }

      playSoundSafe("block.bell.hit", block, player, 0.5, 1);

      const time = world.getTimeOfDay();

      if (time < 13000) {
        world.setTimeOfDay(13000);
        player.onScreenDisplay.setActionBar("§bThe Cosmic Bell hums... §dNight falls.");
        animateCosmicBell(block, 1);

        playSoundSafe("block.bell.use", block, player, 0.75, 1.2);

        block.dimension.spawnParticle("mnra_cata:stellar_greatsword_crit", {
          x: block.location.x,
          y: block.location.y,
          z: block.location.z
        });
        block.dimension.spawnParticle("mnra_cata:stellar_greatsword_star_crit", {
          x: block.location.x,
          y: block.location.y,
          z: block.location.z
        });
        block.dimension.spawnParticle("mnra_cata:cosmic_bell_interact", {
          x: block.location.x,
          y: block.location.y,
          z: block.location.z
        });

      } else {
        world.setTimeOfDay(1000);
        player.onScreenDisplay.setActionBar("§bThe Cosmic Bell resonates... §eDay breaks.");
        animateCosmicBell(block, 1);

        playSoundSafe("block.bell.use", block, player, 1.25, 1.2);

        block.dimension.spawnParticle("mnra_cata:stellar_greatsword_crit", {
          x: block.location.x,
          y: block.location.y,
          z: block.location.z
        });
        block.dimension.spawnParticle("mnra_cata:stellar_greatsword_star_crit", {
          x: block.location.x,
          y: block.location.y,
          z: block.location.z
        });
        block.dimension.spawnParticle("mnra_cata:cosmic_bell_interact", {
          x: block.location.x,
          y: block.location.y,
          z: block.location.z
        });
      }

      cooldowns.set(key, now + CooldownMS);
    }
  });
});
