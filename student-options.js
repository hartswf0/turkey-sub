/* ============================================================================
 * Trout Sub · Student-Friendly 4-Option Porthole Choices (#01–#55)
 * Single crisp, funny, kid-legible noun phrases (3–6 words, <= 36 chars,
 * zero "this or that?" compound questions, zero "or", zero jargon):
 *   - a: Real Creek Object (what is actually outside in the river)
 *   - b: Probable · Turkey (what Turkey inside reasonably suspects)
 *   - c: Plausible · Trout (what Brook the Trout in the creek suspects)
 *   - d: Preposterous · Alien (wild out-of-bounds saucer guess)
 * ============================================================================ */
(function (root) {
  "use strict";

  var STUDENT_OPTIONS = {
    1: {
      station: "#01 · Bow",
      a: "A giant Size 11 rubber boot",
      b: "A sunken wooden shipwreck",
      c: "A pinching crab’s dark cave",
      d: "The Emperor’s lost moon-boot"
    },
    2: {
      station: "#02 · Galley",
      a: "Trout Cook holding a silver baster",
      b: "A friendly submarine air pump",
      c: "A canned roast dinner delivery",
      d: "A warp-core fuel syringe"
    },
    3: {
      station: "#03 · Starbd",
      a: "A sunken Room 4 chalkboard",
      b: "A Most Wanted bandit poster",
      c: "The dreaded creek Hook Monster",
      d: "A galactic bounty-hunter board"
    },
    4: {
      station: "#04 · Belly",
      a: "A snapping turtle on a key",
      b: "A rival iron mini-submarine",
      c: "A grumpy thief’s back-scratcher",
      d: "An ancient starship ignition key"
    },
    5: {
      station: "#05 · Scope",
      a: "A raccoon washing a tin plate",
      b: "A sneaky creek hubcap thief",
      c: "A bubbly floating pie tin",
      d: "A masked UFO saucer polisher"
    },
    6: {
      station: "#06 · Stern",
      a: "Sheriff Carp inspecting a lure",
      b: "A cook measuring my roasting pan",
      c: "An undercover fish police deputy",
      d: "A comet-hook space bounty hunter"
    },
    7: {
      station: "#07 · Hatch",
      a: "A soggy sunken birthday piñata",
      b: "A spiky underwater naval mine",
      c: "A noisy brass birthday kazoo",
      d: "A candy-stuffed alien mothership"
    },
    8: {
      station: "#08 · Gauge",
      a: "A tiny snail crawling on glass",
      b: "A bug eating our treasure map",
      c: "A giant eyeball behind the glass",
      d: "A glowing slime-trail wormhole"
    },
    9: {
      station: "#09 · Port",
      a: "A trout pushing a shopping cart",
      b: "A heavy iron ramming cage",
      c: "A rude grocery aisle blocker",
      d: "A rolling asteroid mining rover"
    },
    10: {
      station: "#10 · PA",
      a: "A clam-shell school loudspeaker",
      b: "A giant snapping monster jaw",
      c: "A stolen metal school lunchbox",
      d: "A telepathic space megaphone"
    },
    11: {
      station: "#11 · Tank",
      a: "A sunken picnic water cooler",
      b: "An emergency air-supply tank",
      c: "A fizzy creek soda dispenser",
      d: "A frozen alien cryo-sleep pod"
    },
    12: {
      station: "#12 · Keel",
      a: "A cardboard stage floor window",
      b: "A spinning creek whirlpool drain",
      c: "A one-dollar sideshow spotlight",
      d: "A secret pocket-universe trapdoor"
    },
    13: {
      station: "#13 · Arch",
      a: "A brass twig-bell on a rock",
      b: "A sneaky tripwire dinner bell",
      c: "A polite creek ferry doorbell",
      d: "A cosmic stargate toll chime"
    },
    14: {
      station: "#14 · Tower",
      a: "A sinking red autumn maple leaf",
      b: "A scary Thanksgiving countdown sign",
      c: "A bright scarlet bird feather",
      d: "A tiny solar-sail landing craft"
    },
    15: {
      station: "#15 · Lens",
      a: "A wall of wavy glass blocks",
      b: "A badly cracked submarine window",
      c: "Nine tiny blurry baby chickens",
      d: "A pixelated alien force-field grid"
    },
    16: {
      station: "#16 · Aft",
      a: "A twin Turkey Sub waving back",
      b: "A shiny sunken pond mirror",
      c: "A two-headed tin creek monster",
      d: "A parallel-universe turkey clone"
    },
    17: {
      station: "#17 · Dorsal",
      a: "Fish arguing around a stone table",
      b: "A stern underwater courtroom jury",
      c: "A shiny new creek parking meter",
      d: "The high Galactic Senate tribunal"
    },
    18: {
      station: "#18 · Vent",
      a: "A star-carved old steamer trunk",
      b: "A sunken pirate treasure chest",
      c: "A stage magician’s trick box",
      d: "A trapped pocket constellation"
    },
    19: {
      station: "#19 · Bilge",
      a: "A potato poked with bendy straws",
      b: "A giant spiky sea urchin",
      c: "A sneaky potato-eating creek bug",
      d: "A ten-antennaed potato satellite"
    },
    20: {
      station: "#20 · Dome",
      a: "A colorful pebble glass window",
      b: "A grand sunken royal palace",
      c: "A glowing angel in a jar",
      d: "A crystal mothership warp beam"
    },
    21: {
      station: "#21 · Fwd",
      a: "Five big trout tapping bus screens",
      b: "Enemy fish hacking our radar",
      c: "A late morning creek city bus",
      d: "Giant hive-mind telepathy Titans"
    },
    22: {
      station: "#22 · Trim",
      a: "A fish coach leading water squats",
      b: "Angry river guards marching closer",
      c: "A heavy iron gym kettlebell",
      d: "Mind-control zero-gravity aerobics"
    },
    23: {
      station: "#23 · Scope B",
      a: "A pink sea-anemone wall clock",
      b: "A hungry underwater monster plant",
      c: "The Principal’s gold pocketwatch",
      d: "A living time-machine dial"
    },
    24: {
      station: "#24 · Rudder",
      a: "A chewed-up green fishing net",
      b: "A sneaky hunter’s turkey trap",
      c: "Giant tin scissors cutting twine",
      d: "Tangled space-kraken dental floss"
    },
    25: {
      station: "#25 · Lock",
      a: "A trout wearing a glass fishbowl",
      b: "A deep-sea diver’s glass helmet",
      c: "A wild bird in a bottle",
      d: "A gill-breathing alien spacesuit"
    },
    26: {
      station: "#26 · Boiler",
      a: "Glowing hot coals on the riverbed",
      b: "A giant pot of turkey soup",
      c: "A camper’s sunken cooking stove",
      d: "A fiery baby star hatchery"
    },
    27: {
      station: "#27 · Port M",
      a: "An old sunken rabbit-ear TV",
      b: "An urgent rescue radio signal",
      c: "The creek cable repairman’s van",
      d: "An alien brainwashing ray-tube"
    },
    28: {
      station: "#28 · Stbd M",
      a: "Silver minnows swimming in a wave",
      b: "A glowing highway exit arrow",
      c: "A flashy holiday parade leader",
      d: "A swarm of liquid-metal nanobots"
    },
    29: {
      station: "#29 · Deck",
      a: "An open sunken family photo album",
      b: "A spilled bag of soggy letters",
      c: "A nosy celebrity camera flash",
      d: "A lost time-traveler’s scrapbook"
    },
    30: {
      station: "#30 · Top",
      a: "Six glowing letter bubbles rising",
      b: "Floating underwater explosive mines",
      c: "A loud school spelling-bee buzzer",
      d: "Planet Earth’s self-destruct code"
    },
    31: {
      station: "#31 · Galley B",
      a: "A dented metal bread-roll baking tin",
      b: "A terrifying Thanksgiving oven pan",
      c: "A cozy heated minnow hot-tub",
      d: "A scorched spaceship heat-shield"
    },
    32: {
      station: "#32 · Beak Arm",
      a: "Metal tongs pinching an old key",
      b: "A giant snapping crab pincer",
      c: "A scary mechanical fish dentist",
      d: "A robotic UFO abduction claw"
    },
    33: {
      station: "#33 · Salon",
      a: "Dark drainpipe bars in the shadows",
      b: "A fancy red theater stage curtain",
      c: "An old-timey creek movie projector",
      d: "Hungry beasts from Shadow Space"
    },
    34: {
      station: "#34 · Organ",
      a: "An old boiler with brass pipes",
      b: "A friendly steamboat rescue crew",
      c: "A loud circus music riverboat",
      d: "A giant planet-breathing space lung"
    },
    35: {
      station: "#35 · Post #44",
      a: "An old canvas sack of letters",
      b: "A bag of dirty crew laundry",
      c: "A sneaky porch-pirate mail thief",
      d: "A secret Sector 44 spy drop"
    },
    36: {
      station: "#36 · Bench",
      a: "A hound statue holding a letter",
      b: "The Governor’s Thanksgiving pardon",
      c: "A shiny brass creekside mailbox",
      d: "A messenger from the Dog Star"
    },
    37: {
      station: "#37 · Bulkhead",
      a: "A folded muddy creek trail map",
      b: "A tricky hidden ambush trap",
      c: "A friendly fin-to-claw handshake",
      d: "A secret wormhole star chart"
    },
    38: {
      station: "#38 · Visor",
      a: "A soggy marker posterboard chart",
      b: "A scary butcher-shop meat diagram",
      c: "A magical creek wish-machine",
      d: "Top-secret Roswell saucer plans"
    },
    39: {
      station: "#39 · Parlor",
      a: "A flooded wallpapered living room",
      b: "Grandma’s cozy dry front parlor",
      c: "A giant noisy rug vacuum",
      d: "An alien zoo’s human cage"
    },
    40: {
      station: "#40 · Reef",
      a: "Spools of old cassette music tape",
      b: "Wiggly ribbons of cranberry sauce",
      c: "A booming underwater jukebox",
      d: "A sparkling sugar-crystal space city"
    },
    41: {
      station: "#41 · Catwalk",
      a: "A fish in sunglasses on stilts",
      b: "A dizzy low-air water mirage",
      c: "A rolling tin can of soup",
      d: "An undercover Men-in-Black agent"
    },
    42: {
      station: "#42 · Ferry",
      a: "Two paper puppets between two trees",
      b: "Grumpy bridge tollbooth guards",
      c: "The brand-new river ferryboat",
      d: "Twin cosmic portal gatekeepers"
    },
    43: {
      station: "#43 · Snout",
      a: "A spotted toy yellow shark nose",
      b: "A hungry lemon-pepper sea monster",
      c: "A friendly giant yellow sunfish",
      d: "A robotic space-banana probe"
    },
    44: {
      station: "#44 · Rotor",
      a: "A spinning striped paper disc",
      b: "A dizzying hypnosis mind-trap",
      c: "The diner’s lucky pie-prize wheel",
      d: "A swirling alien memory-wiper"
    },
    45: {
      station: "#45 · Extruder",
      a: "A plastic funnel full of beads",
      b: "A machine that melts turkey basters",
      c: "A giant creek gravel vacuum",
      d: "An alien atom-pellet replicator"
    },
    46: {
      station: "#46 · Steps",
      a: "Giant brass letters spelling GOBBLE",
      b: "An emergency escape step-ladder",
      c: "A falling store-front metal sign",
      d: "Floating anti-gravity space stairs"
    },
    47: {
      station: "#47 · Armada",
      a: "Glass jars tied into a raft",
      b: "A spooky pickle-jar factory",
      c: "A floating creek trading boat",
      d: "A hundred-dome Mars colony fleet"
    },
    48: {
      station: "#48 · Belfry",
      a: "A flooded tin church steeple",
      b: "A dry roof to roost on",
      c: "A spinning rooster weathervane",
      d: "A sunken silver rocket nose-cone"
    },
    49: {
      station: "#49 · Corner",
      a: "A sunken street traffic stoplight",
      b: "Early twinkling Christmas lights",
      c: "A speeding yellow creek taxicab",
      d: "An intergalactic space checkpoint"
    },
    50: {
      station: "#50 · Riffle",
      a: "One tiny fish guarding a sign",
      b: "A strict government river roadblock",
      c: "A noisy mini creek bulldozer",
      d: "Earth’s supreme force-field guardian"
    },
    51: {
      station: "#51 · Grotto",
      a: "A huge pearl inside a clam",
      b: "A giant peeled hard-boiled egg",
      c: "A stolen white bowling ball",
      d: "A glowing alien moon-egg core"
    },
    52: {
      station: "#52 · Bridge",
      a: "A tight red rope between rocks",
      b: "A giant red squid tentacle",
      c: "A helpful creek tow-truck line",
      d: "An orbital space-elevator cable"
    },
    53: {
      station: "#53 · Flume",
      a: "An old iron watermill wheel",
      b: "A giant kitchen pie-crust crimper",
      c: "A heavy log jamming the creek",
      d: "Planet Earth’s main spin gear"
    },
    54: {
      station: "#54 · Ledge",
      a: "A giant wrinkled creek salamander",
      b: "A ruffled porcelain gravy boat",
      c: "A clunky tin hermit crab",
      d: "The frilly Emperor of Space"
    },
    55: {
      station: "#55 · Eddy",
      a: "A corked brass tube of postcards",
      b: "An angry landlord’s eviction note",
      c: "The lost dead-letter creek dropbox",
      d: "A message pod from 54 galaxies"
    }
  };

  if (root) {
    root.STUDENT_OPTIONS = STUDENT_OPTIONS;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = STUDENT_OPTIONS;
  }
})(typeof window !== "undefined" ? window : globalThis);
