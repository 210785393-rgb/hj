/*
  My Classroom VR Model
  参照用户提供的教室照片，用 A-Frame 代码建模。
  结构与老师参考包一致：index.html + script.js + style.css + assets。
*/

AFRAME.registerComponent("smooth-teleport", {
  schema: { target: { type: "vec3" } },
  init: function () {
    this.el.addEventListener("click", function () {
      var data = this.components["smooth-teleport"].data;
      var rig = document.querySelector("#rig");
      rig.removeAttribute("animation");
      rig.setAttribute("animation", {
        property: "position",
        to: data.target.x + " " + data.target.y + " " + data.target.z,
        dur: 1200,
        easing: "easeInOutQuad"
      });
    });
  }
});

window.addEventListener("load", function () {
  const root = document.querySelector("#classroomRoot");

  // -----------------------------
  // Helper functions
  // -----------------------------
  const idCount = {};
  function add(tag, attrs, parent = root) {
    const el = document.createElement(tag);
    attrs = attrs || {};
    if (attrs.id) {
      const baseId = attrs.id;
      idCount[baseId] = (idCount[baseId] || 0) + 1;
      attrs.id = idCount[baseId] === 1 ? baseId : `${baseId}-${idCount[baseId]}`;
    }
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    parent.appendChild(el);
    return el;
  }

  function box(name, position, size, materialOrColor, parent = root) {
    const attrs = {
      id: name,
      position: position,
      width: size[0],
      height: size[1],
      depth: size[2]
    };
    if (typeof materialOrColor === "string" && materialOrColor.trim().startsWith("material:")) {
      attrs["material"] = materialOrColor.replace(/^material:\s*/, "");
    } else if (typeof materialOrColor === "string" && materialOrColor.trim().startsWith("src:")) {
      attrs["material"] = materialOrColor;
    } else {
      attrs["color"] = materialOrColor || "#ffffff";
    }
    return add("a-box", attrs, parent);
  }

  function plane(name, position, rotation, width, height, material, parent = root) {
    return add("a-plane", {
      id: name,
      position: position,
      rotation: rotation,
      width: width,
      height: height,
      material: material
    }, parent);
  }

  function cylinder(name, position, radius, height, color, rotation = "0 0 0", parent = root) {
    return add("a-cylinder", {
      id: name,
      position: position,
      rotation: rotation,
      radius: radius,
      height: height,
      color: color
    }, parent);
  }

  function sphere(name, position, radius, color, parent = root) {
    return add("a-sphere", {
      id: name,
      position: position,
      radius: radius,
      color: color
    }, parent);
  }

  function text(name, value, position, rotation, width, color = "#333") {
    return add("a-text", {
      id: name,
      value: value,
      position: position,
      rotation: rotation,
      width: width,
      align: "center",
      color: color,
      font: "kelsonsans"
    });
  }

  // -----------------------------
  // Room base: long white classroom
  // -----------------------------
  const ROOM_W = 10;
  const ROOM_D = 20;
  const ROOM_H = 4.2;

  // Floor / ceiling
  plane(
    "light-wood-floor",
    "0 0 0",
    "-90 0 0",
    ROOM_W,
    ROOM_D,
    "src: #colorFloorTexture; roughnessMap: #roughnessFloorTexture; metalnessMap: #metalnessFloorTexture; normalMap: #normalFloorTexture; repeat: 5 8; roughness: 1"
  );
  plane("white-ceiling", "0 4.2 0", "90 0 0", ROOM_W, ROOM_D, "color: #eeeeec; side: double");

  // Walls with vertical-rib texture impression
  box("front-projection-wall", "0 2 -10", [ROOM_W, ROOM_H, 0.18], "src: #wallTexture; repeat: 4 2");
  box("back-display-wall", "0 2 10", [ROOM_W, ROOM_H, 0.18], "src: #wallTexture; repeat: 4 2");
  box("left-ribbed-wall", "-5 2 0", [0.18, ROOM_H, ROOM_D], "src: #wallTexture; repeat: 4 2");
  box("right-ribbed-wall", "5 2 0", [0.18, ROOM_H, ROOM_D], "src: #wallTexture; repeat: 4 2");

  // Wall grooves: thin vertical black-gray lines, matching the photo's ribbed walls
  for (let side of [-1, 1]) {
    for (let z = -9.2; z <= 9.2; z += 0.38) {
      box("side-wall-rib-" + side + "-" + z.toFixed(1), `${side * 4.905} 2 ${z}`, [0.02, 3.8, 0.012], "#2e2e2e");
    }
  }

  // -----------------------------
  // Large side windows + white blinds
  // -----------------------------
  function makeWindow(side, z) {
    const x = side * 4.88;
    box("window-glass", `${x} 2.55 ${z}`, [0.06, 1.55, 2.2], "material: color: #bfefff; opacity: 0.38; transparent: true");
    box("window-frame-vertical-a", `${x - side * 0.01} 2.55 ${z - 1.1}`, [0.09, 1.7, 0.04], "#ffffff");
    box("window-frame-vertical-b", `${x - side * 0.01} 2.55 ${z + 1.1}`, [0.09, 1.7, 0.04], "#ffffff");
    box("window-frame-horizontal-a", `${x - side * 0.01} 1.78 ${z}`, [0.09, 0.04, 2.3], "#ffffff");
    box("window-frame-horizontal-b", `${x - side * 0.01} 3.32 ${z}`, [0.09, 0.04, 2.3], "#ffffff");
    box("half-down-white-blind", `${x - side * 0.012} 3.05 ${z}`, [0.05, 0.55, 2.05], "material: color: #f3f3ef; opacity: 0.82; transparent: true");
  }
  [-7.2, -3.6, 0, 3.6, 7.2].forEach(z => {
    makeWindow(-1, z);
    makeWindow(1, z);
  });

  // -----------------------------
  // Front wall: projector screen, yellow doors, clock, teacher area
  // -----------------------------
  box("projector-screen", "0 2.35 -9.88", [3.8, 1.85, 0.06], "#dfe3e7");
  box("screen-top-border", "0 3.3 -9.82", [4.0, 0.06, 0.06], "#111");
  box("screen-bottom-border", "0 1.38 -9.82", [4.0, 0.06, 0.06], "#111");
  text("screen-title", "Part 4.3  App 功能架构", "0 2.45 -9.75", "0 0 0", 3.2, "#6680a0");

  box("left-yellow-door", "-4.1 1.12 -9.86", [0.8, 2.1, 0.08], "#d79b00");
  box("right-yellow-door", "4.1 1.12 -9.86", [0.8, 2.1, 0.08], "#d79b00");
  sphere("left-door-handle", "-3.8 1.1 -9.72", 0.06, "#333");
  sphere("right-door-handle", "3.8 1.1 -9.72", 0.06, "#333");

  box("teacher-desk-top", "-2.7 0.8 -8.6", [1.8, 0.1, 0.75], "#d9c3a4");
  box("teacher-desk-front", "-2.7 0.48 -8.95", [1.65, 0.55, 0.05], "#eeeeee");
  box("teacher-computer", "-2.7 1.05 -8.6", [0.55, 0.38, 0.04], "#111");

  cylinder("front-wall-clock", "2.5 2.55 -9.77", 0.23, 0.04, "#ffffff", "90 0 0");
  box("clock-hand-vertical", "2.5 2.62 -9.72", [0.025, 0.22, 0.025], "#111");
  box("clock-hand-horizontal", "2.59 2.55 -9.72", [0.2, 0.025, 0.025], "#111");

  // Front wall paper sheets
  for (let i = 0; i < 12; i++) {
    let x = 1.2 + (i % 4) * 0.28;
    let y = 1.45 + Math.floor(i / 4) * 0.32;
    box("front-wall-paper-" + i, `${x} ${y} -9.76`, [0.20, 0.25, 0.02], i % 2 ? "#f7f4df" : "#ffffff");
  }

  // -----------------------------
  // Back wall: students' work / poster board
  // -----------------------------
  for (let i = 0; i < 46; i++) {
    let x = -3.2 + (i % 12) * 0.55;
    let y = 2.1 + Math.floor(i / 12) * 0.28;
    let color = ["#ffffff", "#e7f0ff", "#fff1dc", "#e9ffe5", "#f2e7ff"][i % 5];
    box("back-wall-work-" + i, `${x} ${y} 9.78`, [0.36, 0.22, 0.025], color);
  }

  // -----------------------------
  // Ceiling black rectangular light frames + glowing white strips
  // -----------------------------
  function makeCeilingFrame(z) {
    box("black-light-frame-left-" + z, `-3.5 3.95 ${z}`, [0.05, 0.05, 2.0], "#111111");
    box("black-light-frame-right-" + z, `3.5 3.95 ${z}`, [0.05, 0.05, 2.0], "#111111");
    box("black-light-frame-front-" + z, `0 3.95 ${z - 1.0}`, [7.0, 0.05, 0.05], "#111111");
    box("black-light-frame-back-" + z, `0 3.95 ${z + 1.0}`, [7.0, 0.05, 0.05], "#111111");
    box("emissive-light-strip-" + z, `0 3.92 ${z}`, [6.7, 0.05, 0.08], "material: color: #ffffff; emissive: #ffffff; emissiveIntensity: 0.85");
  }
  [-8, -5.2, -2.4, 0.4, 3.2, 6.0, 8.4].forEach(makeCeilingFrame);

  // White hanging acoustic/pipe strips seen on the ceiling
  for (let z of [-8.2, -4.9, -1.6, 1.7, 5.0]) {
    for (let x = -3.3; x <= 3.3; x += 0.24) {
      box("white-ceiling-strip-" + x.toFixed(1) + "-" + z, `${x} 3.82 ${z}`, [0.045, 0.28, 0.035], "#f6f6f2");
    }
  }

  // -----------------------------
  // Student desks, chairs, laptops and objects
  // -----------------------------
  function makeDeskSet(x, z, index) {
    const group = add("a-entity", { id: "desk-set-" + index, position: `${x} 0 ${z}` });

    // Desk: light wood top + white metal legs/front panel, matching photos
    box("desk-top-" + index, "0 0.78 0", [1.55, 0.08, 0.72], "#d8c3a5", group);
    box("desk-front-panel-" + index, "0 0.54 -0.34", [1.38, 0.38, 0.04], "#ededed", group);
    [-0.62, 0.62].forEach(dx => {
      [-0.25, 0.25].forEach(dz => {
        cylinder("desk-leg-" + index, `${dx} 0.38 ${dz}`, 0.028, 0.72, "#f5f5f5", "0 0 0", group);
        cylinder("desk-wheel-" + index, `${dx} 0.07 ${dz}`, 0.045, 0.035, "#222", "90 0 0", group);
      });
    });

    // Chair: black back and seat
    box("chair-seat-" + index, "0 0.45 0.68", [0.55, 0.08, 0.48], "#111111", group);
    box("chair-back-" + index, "0 0.9 0.93", [0.60, 0.68, 0.06], "#111111", group);
    [-0.22, 0.22].forEach(dx => {
      [0.55, 0.80].forEach(dz => cylinder("chair-leg-" + index, `${dx} 0.24 ${dz}`, 0.02, 0.45, "#111", "0 0 0", group));
    });

    // Random classroom objects: laptops, books, bottles, paper
    if (index % 2 === 0) {
      box("laptop-keyboard-" + index, "-0.2 0.86 -0.04", [0.52, 0.025, 0.34], "#111", group);
      box("laptop-screen-" + index, "-0.2 1.08 -0.23", [0.52, 0.40, 0.025], "#1c1c1c", group);
    }
    if (index % 3 === 0) {
      cylinder("water-bottle-" + index, "0.45 1.0 0.05", 0.065, 0.32, "#b9f2ff", "0 0 0", group);
    }
    if (index % 4 === 0) {
      box("book-a-" + index, "0.25 0.86 -0.1", [0.42, 0.03, 0.28], "#d43a24", group);
      box("book-b-" + index, "0.27 0.90 -0.1", [0.46, 0.03, 0.30], "#ffffff", group);
    }
    if (index % 5 === 0) {
      box("paper-sheet-" + index, "0.0 0.855 0.18", [0.6, 0.012, 0.36], "#f7f7f0", group);
    }

    // A few generic seated students: simplified, non-identifying silhouettes
    if ([2, 3, 9, 13, 18, 27].includes(index)) {
      makePerson(0, 1.08, true, group, index % 2 ? "#f4f4ee" : "#111111");
    }

    return group;
  }

  function makePerson(x, z, sitting, parent, color) {
    cylinder("student-body", `${x} 0.95 ${z}`, 0.13, sitting ? 0.48 : 0.78, color || "#eeeeee", "0 0 0", parent);
    sphere("student-head", `${x} 1.28 ${z}`, 0.12, "#d8b08c", parent);
    box("student-hair", `${x} 1.38 ${z}`, [0.22, 0.08, 0.20], "#1e1e1e", parent);
  }

  const xs = [-3.55, -1.75, 0, 1.75, 3.55];
  const zs = [-7.2, -5.4, -3.6, -1.8, 0, 1.8, 3.6, 5.4, 7.2];
  let count = 0;
  zs.forEach((z, r) => {
    xs.forEach((x, c) => {
      // leave slight gaps like the photo, not a perfectly full grid
      if ((r === 0 && (c === 0 || c === 4)) || (r === 4 && c === 2) || (r === 8 && c === 1)) return;
      makeDeskSet(x, z, count++);
    });
  });

  // Foreground desk at camera side, like the user's third/fourth photo
  const fg = add("a-entity", { id: "foreground-photographer-desk", position: "0 0 9.05" });
  box("foreground-desk-top", "0 0.78 0", [3.0, 0.08, 0.92], "#d8c3a5", fg);
  box("foreground-desk-front-panel", "0 0.52 -0.42", [2.7, 0.36, 0.05], "#ededed", fg);
  box("foreground-laptop-keyboard", "0 0.86 0", [0.78, 0.03, 0.48], "#151515", fg);
  box("foreground-laptop-screen", "0 1.18 -0.26", [0.78, 0.52, 0.03], "#151515", fg);
  cylinder("foreground-water-bottle", "-1.0 1.03 -0.05", 0.075, 0.38, "#dff9ff", "0 0 0", fg);
  box("foreground-red-tape", "1.1 0.9 0.05", [0.38, 0.09, 0.28], "#e53935", fg);
  box("foreground-paper", "-0.25 0.855 0.35", [0.9, 0.012, 0.38], "#ffffff", fg);

  // Mini fan on a desk, visible in photo
  const fanGroup = add("a-entity", { id: "mini-desk-fan", position: "3.4 0 5.6" });
  cylinder("fan-round-cover", "0 1.05 0", 0.16, 0.035, "#cde8e5", "90 0 0", fanGroup);
  cylinder("fan-pole", "0 0.88 0.04", 0.02, 0.28, "#cde8e5", "0 0 0", fanGroup);
  box("fan-base", "0 0.77 0.06", [0.28, 0.04, 0.18], "#cde8e5", fanGroup);

  // -----------------------------
  // Side storage / cleaning corner: trash bin, brooms, dustpan, cardboard box
  // -----------------------------
  cylinder("black-trash-bin", "-4.35 0.38 7.9", 0.32, 0.76, "#111111", "0 0 0");
  box("trash-bag-top", "-4.35 0.82 7.9", [0.48, 0.12, 0.48], "#050505");
  cylinder("broom-stick-1", "-4.55 0.78 6.95", 0.018, 1.5, "#9a5d2d", "8 0 0");
  cylinder("broom-stick-2", "-4.35 0.78 6.85", 0.018, 1.5, "#bd1c1c", "-10 0 0");
  box("broom-head", "-4.45 0.08 6.75", [0.35, 0.10, 0.12], "#8b5a2b");
  box("blue-dustpan", "-3.95 0.08 7.12", [0.42, 0.12, 0.34], "#1e5aa8");
  box("cardboard-box", "-3.35 0.28 7.45", [0.7, 0.55, 0.55], "#9a6a3d");

  // A few black cables on floor
  for (let i = 0; i < 8; i++) {
    box("floor-cable-" + i, `${-4.3 + i * 0.18} 0.025 ${6.25 + Math.sin(i) * 0.12}`, [0.25, 0.02, 0.025], "#0b0b0b");
  }

  // -----------------------------
  // Two standing figures near aisle / wall, simplified silhouettes only
  // -----------------------------
  const stand1 = add("a-entity", { id: "standing-student-left", position: "-2.8 0 -8.1" });
  cylinder("standing-body", "0 1.10 0", 0.14, 0.86, "#f0f0ee", "0 0 0", stand1);
  sphere("standing-head", "0 1.62 0", 0.12, "#d8b08c", stand1);
  cylinder("standing-leg-a", "-0.06 0.45 0", 0.035, 0.82, "#111", "0 0 0", stand1);
  cylinder("standing-leg-b", "0.08 0.45 0", 0.035, 0.82, "#111", "0 0 0", stand1);

  const stand2 = add("a-entity", { id: "standing-student-right", position: "4.25 0 -2.0" });
  cylinder("standing-body", "0 1.10 0", 0.14, 0.86, "#f7f7f3", "0 0 0", stand2);
  sphere("standing-head", "0 1.62 0", 0.12, "#d8b08c", stand2);
  cylinder("standing-leg-a", "-0.06 0.45 0", 0.035, 0.82, "#466080", "0 0 0", stand2);
  cylinder("standing-leg-b", "0.08 0.45 0", 0.035, 0.82, "#466080", "0 0 0", stand2);

  // -----------------------------
  // Navigation markers: gaze-based teleport like teacher's reference
  // -----------------------------
  function teleportMarker(name, z) {
    add("a-cylinder", {
      id: name,
      position: `0 0.055 ${z}`,
      radius: 0.45,
      height: 0.05,
      material: "color: #00d8ff; opacity: 0.35; transparent: true; emissive: #00d8ff",
      "smooth-teleport": `target: 0 1.6 ${z}`
    });
  }
  teleportMarker("teleport-back", 8.2);
  teleportMarker("teleport-middle", 1.0);
  teleportMarker("teleport-front", -6.8);

  text("model-label", "My Classroom VR Model", "0 0.03 9.5", "-90 0 0", 4.5, "#222");
});
