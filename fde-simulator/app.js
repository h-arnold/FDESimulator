import {
  getElements,
  getMemoryValueElement,
  getMemorySlotElement,
} from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const ui = getElements(document);
  const {
    btnStep,
    btnRun,
    btnReset,
    currentPhaseEl,
    stepDescriptionEl,
    pcValueEl,
    marValueEl,
    mdrValueEl,
    cirValueEl,
    accValueEl,
    cuEl,
    aluEl,
    addressBusEl,
    dataBusEl,
    controlBusEl,
    memoryContainer,
    simulationArea,
  } = ui;

  // --- Initial State ---
  const MEMORY_SIZE = 16;
  const initialMemory = [
    "LOAD 5",
    "ADD 6",
    "STO 7",
    "HLT", // 0-3
    "",
    "12",
    "8",
    "", // 4-7
    "",
    "",
    "",
    "", // 8-11
    "",
    "",
    "",
    "", // 12-15
  ];

  let memory = [];
  let registers = {};
  let currentState = "idle";
  let decodedInstruction = { opcode: null, operand: null };
  let isRunning = false;
  let runTimer = null;
  const runSpeed = 1000; // 1 second per step

  // --- Core Functions ---

  /**
   * Initializes or resets the simulation to its starting state.
   */
  function reset() {
    if (runTimer) {
      clearInterval(runTimer);
      runTimer = null;
    }
    isRunning = false;

    memory = [...initialMemory];
    registers = {
      pc: 0,
      mar: "",
      mdr: "",
      cir: "",
      acc: "",
    };
    currentState = "idle";
    decodedInstruction = { opcode: null, operand: null };

    initMemoryUI();
    updateUI();

    currentPhaseEl.textContent = "IDLE";
    stepDescriptionEl.textContent =
      "Click 'Step' or 'Run' to begin the simulation.";

    btnStep.disabled = false;
    btnRun.disabled = false;
    btnRun.textContent = "Run";
  }

  /**
   * Generates the memory slots in the UI.
   */
  function initMemoryUI() {
    memoryContainer.innerHTML = "";
    for (let i = 0; i < MEMORY_SIZE; i++) {
      const slot = document.createElement("div");
      slot.className = "memory-slot";
      slot.id = `mem-${i}`;

      const addr = document.createElement("span");
      addr.className = "memory-addr";
      addr.textContent = `${i}:`;

      const val = document.createElement("span");
      val.className = "memory-val";
      val.id = `mem-val-${i}`;
      val.textContent = memory[i];

      slot.appendChild(addr);
      slot.appendChild(val);
      memoryContainer.appendChild(slot);
    }
  }

  /**
   * Helper to get a memory value element by address (wraps ui.js helper).
   */
  function getMemoryVal(address) {
    return getMemoryValueElement(document, address);
  }

  /**
   * Helper to get a memory slot element by address (wraps ui.js helper).
   */
  function getMemorySlot(address) {
    return getMemorySlotElement(document, address);
  }

  /**
   * Updates all UI elements to reflect the current state.
   */
  function updateUI() {
    pcValueEl.textContent = registers.pc;
    marValueEl.textContent = registers.mar;
    mdrValueEl.textContent = registers.mdr;
    cirValueEl.textContent = registers.cir;
    accValueEl.textContent = registers.acc;

    // Update memory UI
    for (let i = 0; i < MEMORY_SIZE; i++) {
      const memValEl = getMemoryVal(i);
      if (memValEl && memValEl.textContent !== memory[i]) {
        memValEl.textContent = memory[i];
      }
    }

    // Update Run/Pause button text
    btnRun.textContent = isRunning ? "Pause" : "Run";
  }

  /**
   * Removes all highlight classes from components.
   */
  function clearHighlights() {
    const components = document.querySelectorAll(".component, .memory-slot");
    components.forEach((el) => {
      el.classList.remove("highlight", "highlight-active");
    });

    // Clear bus highlights
    addressBusEl.classList.remove(
      "bus-active",
      "bus-flow-right",
      "bus-flow-left"
    );
    dataBusEl.classList.remove("bus-active", "bus-flow-right", "bus-flow-left");
    controlBusEl.classList.remove(
      "bus-active",
      "bus-flow-right",
      "bus-flow-left"
    );
  }

  /**
   * Activates a bus with directional flow animation.
   * @param {HTMLElement} busElement - The bus element to activate.
   * @param {string} direction - The flow direction: 'right' (CPU->RAM) or 'left' (RAM->CPU).
   */
  function activateBus(busElement, direction) {
    busElement.classList.add("bus-active");
    if (direction === "right") {
      busElement.classList.add("bus-flow-right");
    } else if (direction === "left") {
      busElement.classList.add("bus-flow-left");
    }
  }

  /**
   * Highlights a specific set of components.
   * @param {string[]} ids - Array of element IDs to highlight.
   * @param {string} [className='highlight'] - The highlight class to apply.
   */
  function highlight(ids, className = "highlight") {
    ids.forEach((id) => {
      // Check if it's a memory address or a regular element ID
      if (id.startsWith("mem-")) {
        const el = getMemorySlot(parseInt(id.substring(4)));
        if (el) el.classList.add(className);
      } else {
        const el = document.getElementById(id);
        if (el) el.classList.add(className);
      }
    });
  }

  /**
   * Toggles the 'Run' state.
   */
  function toggleRun() {
    isRunning = !isRunning;
    if (isRunning) {
      step(); // Run the first step immediately
      runTimer = setInterval(step, runSpeed);
    } else {
      if (runTimer) {
        clearInterval(runTimer);
        runTimer = null;
      }
    }
    updateUI(); // Update button text
  }

  // --- FDE Cycle Handler Functions ---

  /**
   * Initial idle state; transitions to fetch-1.
   */
  function handleIdle() {
    currentState = "fetch-1";
    step(); // Immediately proceed to fetch
  }

  // --- FETCH PHASE HANDLERS ---

  /**
   * Fetch-1: Copy PC to MAR
   */
  function handleFetch1() {
    currentPhaseEl.textContent = "FETCH";
    registers.mar = registers.pc;
    stepDescriptionEl.textContent =
      "The Program Counter (PC) holds the address of the next instruction (" +
      registers.pc +
      "). This address is copied to the Memory Address Register (MAR).";
    highlight(["pc", "mar"]);
    currentState = "fetch-2";
  }

  /**
   * Fetch-2: Send address to RAM via address bus
   */
  function handleFetch2() {
    stepDescriptionEl.textContent =
      "The address (" +
      registers.mar +
      ") is sent to RAM via the address bus. Control signals are sent to request a read operation.";
    highlight(["mar", `mem-${registers.mar}`]);
    activateBus(addressBusEl, "left");
    activateBus(controlBusEl, "left");
    currentState = "fetch-3";
  }

  /**
   * Fetch-3: Transfer data from RAM to MDR via data bus
   */
  function handleFetch3() {
    registers.mdr = memory[registers.mar];
    stepDescriptionEl.textContent =
      "The instruction at memory address " +
      registers.mar +
      " ('" +
      registers.mdr +
      "') travels from RAM to the Memory Data Register (MDR) via the data bus.";
    highlight(["mdr", `mem-${registers.mar}`]);
    activateBus(addressBusEl, "left");
    activateBus(dataBusEl, "right");
    activateBus(controlBusEl, "left");
    currentState = "fetch-4";
  }

  /**
   * Fetch-4: Transfer instruction from MDR to CIR
   */
  function handleFetch4() {
    registers.cir = registers.mdr;
    stepDescriptionEl.textContent =
      "The instruction ('" +
      registers.cir +
      "') is transferred from the MDR to the Current Instruction Register (CIR).";
    highlight(["mdr", "cir"]);
    currentState = "fetch-5";
  }

  /**
   * Fetch-5: Increment PC
   */
  function handleFetch5() {
    registers.pc++;
    stepDescriptionEl.textContent =
      "The Program Counter (PC) is incremented to " +
      registers.pc +
      ", pointing to the next instruction.";
    highlight(["pc"]);
    currentState = "decode-1";
  }

  // --- DECODE PHASE HANDLERS ---

  /**
   * Decode-1: Control Unit decodes the instruction
   */
  function handleDecode1() {
    currentPhaseEl.textContent = "DECODE";
    const instruction = registers.cir.split(" ");
    decodedInstruction.opcode = instruction[0];
    decodedInstruction.operand = instruction[1]
      ? parseInt(instruction[1])
      : null;

    stepDescriptionEl.textContent =
      "The Control Unit (CU) decodes the instruction in the CIR ('" +
      registers.cir +
      "').";
    highlight(["cir", "cu"], "highlight-active");

    // Branch based on opcode
    switch (decodedInstruction.opcode) {
      case "LOAD":
      case "ADD":
      case "STO":
        stepDescriptionEl.textContent +=
          " It's an instruction ('" +
          decodedInstruction.opcode +
          "') that requires data/address (" +
          decodedInstruction.operand +
          ").";
        currentState = "decode-2-addr";
        break;
      case "HLT":
        stepDescriptionEl.textContent += " It is a 'HLT' (Halt) instruction.";
        currentState = "execute-hlt-1";
        break;
      default:
        stepDescriptionEl.textContent =
          "Error: Unknown instruction '" + registers.cir + "'. Resetting.";
        currentState = "idle";
    }
  }

  /**
   * Decode-2-addr: Copy operand (address) to MAR
   */
  function handleDecode2Addr() {
    registers.mar = decodedInstruction.operand;
    stepDescriptionEl.textContent =
      "The address part of the instruction (" +
      registers.mar +
      ") is copied to the MAR, ready to access memory.";
    highlight(["cir", "cu", "mar"], "highlight-active");

    // Branch to execute phase based on opcode
    switch (decodedInstruction.opcode) {
      case "LOAD":
        currentState = "execute-load-1";
        break;
      case "ADD":
        currentState = "execute-add-1";
        break;
      case "STO":
        currentState = "execute-sto-1";
        break;
    }
  }

  // --- EXECUTE PHASE: LOAD ---

  /**
   * Execute-Load-1: Send address to RAM for read
   */
  function handleExecuteLoad1() {
    currentPhaseEl.textContent = "EXECUTE";
    stepDescriptionEl.textContent =
      "The address (" +
      registers.mar +
      ") is sent to RAM via the address bus. Control signals request a read operation.";
    highlight(["mar", `mem-${registers.mar}`]);
    activateBus(addressBusEl, "left");
    activateBus(controlBusEl, "left");
    currentState = "execute-load-2";
  }

  /**
   * Execute-Load-2: Transfer data from RAM to MDR
   */
  function handleExecuteLoad2() {
    registers.mdr = memory[registers.mar];
    stepDescriptionEl.textContent =
      "The data at memory address " +
      registers.mar +
      " ('" +
      registers.mdr +
      "') travels from RAM to the MDR via the data bus.";
    highlight(["mdr", `mem-${registers.mar}`]);
    activateBus(addressBusEl, "left");
    activateBus(dataBusEl, "right");
    activateBus(controlBusEl, "left");
    currentState = "execute-load-3";
  }

  /**
   * Execute-Load-3: Transfer data from MDR to ACC
   */
  function handleExecuteLoad3() {
    registers.acc = registers.mdr;
    stepDescriptionEl.textContent =
      "The data ('" +
      registers.acc +
      "') is copied from the MDR to the Accumulator (ACC).";
    highlight(["mdr", "acc"]);
    currentState = "fetch-1";
  }

  // --- EXECUTE PHASE: ADD ---

  /**
   * Execute-Add-1: Send address to RAM for read
   */
  function handleExecuteAdd1() {
    currentPhaseEl.textContent = "EXECUTE";
    stepDescriptionEl.textContent =
      "The address (" +
      registers.mar +
      ") is sent to RAM via the address bus. Control signals request a read operation.";
    highlight(["mar", `mem-${registers.mar}`]);
    activateBus(addressBusEl, "left");
    activateBus(controlBusEl, "left");
    currentState = "execute-add-2";
  }

  /**
   * Execute-Add-2: Transfer data from RAM to MDR
   */
  function handleExecuteAdd2() {
    registers.mdr = memory[registers.mar];
    stepDescriptionEl.textContent =
      "The data at memory address " +
      registers.mar +
      " ('" +
      registers.mdr +
      "') travels from RAM to the MDR via the data bus.";
    highlight(["mdr", `mem-${registers.mar}`]);
    activateBus(addressBusEl, "left");
    activateBus(dataBusEl, "right");
    activateBus(controlBusEl, "left");
    currentState = "execute-add-3";
  }

  /**
   * Execute-Add-3: Perform addition via ALU
   */
  function handleExecuteAdd3() {
    const val1 = parseInt(registers.acc);
    const val2 = parseInt(registers.mdr);
    registers.acc = val1 + val2;
    stepDescriptionEl.textContent =
      "The ALU adds the value in the ACC (" +
      val1 +
      ") and the MDR (" +
      val2 +
      "). The result (" +
      registers.acc +
      ") is stored back in the Accumulator.";
    highlight(["acc", "mdr", "alu"], "highlight-active");
    currentState = "fetch-1";
  }

  // --- EXECUTE PHASE: STO ---

  /**
   * Execute-Sto-1: Copy ACC to MDR
   */
  function handleExecuteSto1() {
    currentPhaseEl.textContent = "EXECUTE";
    registers.mdr = registers.acc;
    stepDescriptionEl.textContent =
      "The value from the Accumulator (" +
      registers.mdr +
      ") is copied to the MDR, preparing to store it in memory.";
    highlight(["acc", "mdr"]);
    currentState = "execute-sto-2";
  }

  /**
   * Execute-Sto-2: Send address and control signals to RAM
   */
  function handleExecuteSto2() {
    stepDescriptionEl.textContent =
      "The address (" +
      registers.mar +
      ") is sent via the address bus, and control signals request a write operation.";
    highlight(["mar", "mdr", `mem-${registers.mar}`]);
    activateBus(addressBusEl, "left");
    activateBus(controlBusEl, "left");
    currentState = "execute-sto-3";
  }

  /**
   * Execute-Sto-3: Write data to RAM
   */
  function handleExecuteSto3() {
    memory[registers.mar] = registers.mdr.toString();
    stepDescriptionEl.textContent =
      "The value in the MDR (" +
      registers.mdr +
      ") travels via the data bus and is written to memory at address " +
      registers.mar +
      ".";
    highlight(["mdr", `mem-${registers.mar}`]);
    activateBus(addressBusEl, "left");
    activateBus(dataBusEl, "left");
    activateBus(controlBusEl, "left");
    currentState = "fetch-1";
  }

  // --- EXECUTE PHASE: HLT ---

  /**
   * Execute-Hlt-1: Halt execution
   */
  function handleExecuteHlt1() {
    currentPhaseEl.textContent = "HALTED";
    stepDescriptionEl.textContent =
      "Program execution is stopped by the HLT instruction. Click 'Reset' to start over.";
    highlight(["cir", "cu"], "highlight-active");

    // Stop simulation
    if (runTimer) {
      clearInterval(runTimer);
      runTimer = null;
    }
    isRunning = false;
    btnStep.disabled = true;
  }

  // --- State Handler Dispatch Map ---
  const stateHandlers = {
    idle: handleIdle,
    "fetch-1": handleFetch1,
    "fetch-2": handleFetch2,
    "fetch-3": handleFetch3,
    "fetch-4": handleFetch4,
    "fetch-5": handleFetch5,
    "decode-1": handleDecode1,
    "decode-2-addr": handleDecode2Addr,
    "execute-load-1": handleExecuteLoad1,
    "execute-load-2": handleExecuteLoad2,
    "execute-load-3": handleExecuteLoad3,
    "execute-add-1": handleExecuteAdd1,
    "execute-add-2": handleExecuteAdd2,
    "execute-add-3": handleExecuteAdd3,
    "execute-sto-1": handleExecuteSto1,
    "execute-sto-2": handleExecuteSto2,
    "execute-sto-3": handleExecuteSto3,
    "execute-hlt-1": handleExecuteHlt1,
  };

  /**
   * Executes the next step in the FDE cycle state machine.
   */
  function step() {
    clearHighlights();

    // Dispatch to the appropriate handler based on current state
    const handler = stateHandlers[currentState];
    if (handler) {
      handler();
    } else {
      // Unknown state; reset to idle
      console.warn(`Unknown state: ${currentState}. Resetting to idle.`);
      currentState = "idle";
      step();
    }

    updateUI();
  }

  // --- UI wiring ---
  btnStep.addEventListener("click", () => {
    step();
  });

  btnRun.addEventListener("click", () => {
    toggleRun();
  });

  btnReset.addEventListener("click", () => {
    reset();
  });

  // Initialize
  // Position buses initially and whenever layout changes
  function positionBuses() {
    const sim = simulationArea;
    if (!sim) return;
    const simRect = sim.getBoundingClientRect();

    const busEntries = [
      { el: addressBusEl, targetId: addressBusEl.dataset.cpuTarget },
      { el: dataBusEl, targetId: dataBusEl.dataset.cpuTarget },
      { el: controlBusEl, targetId: controlBusEl.dataset.cpuTarget },
    ];

    busEntries.forEach(({ el, targetId }) => {
      if (!el) return;
      // Default to aligning with CPU center if target not found
      const targetEl = targetId ? document.getElementById(targetId) : null;
      const memoryRect = memoryContainer.getBoundingClientRect();

      let cpuRect = null;
      if (targetEl) cpuRect = targetEl.getBoundingClientRect();
      else {
        // fallback to CPU container: first element with id 'pc' exists
        const fallback = pcValueEl;
        cpuRect = fallback
          ? fallback.getBoundingClientRect()
          : {
              right: simRect.left + 40,
              top: simRect.top + 40,
              bottom: simRect.top + 64,
            };
      }
      // compute positions relative to the simulation area's coordinate space
      const left = Math.round(cpuRect.right - simRect.left);
      const rightEdge = Math.round(memoryRect.left - simRect.left);
      const width = Math.max(24, rightEdge - left);

      const top = Math.round(
        (cpuRect.top + cpuRect.bottom) / 2 - simRect.top - 4
      ); // center the 8px bus

      el.style.position = "absolute";
      el.style.left = left + "px";
      el.style.top = top + "px";
      el.style.width = width + "px";
      el.style.height = "8px";
      // make sure inner line fills parent
      const line = el.querySelector(".bus-line");
      if (line) {
        line.style.width = "100%";
        line.style.height = "100%";
      }
    });
  }

  // Position buses after the DOM has been initialized and after resets
  window.addEventListener("resize", () => {
    // throttle slightly
    clearTimeout(window.__positionBusesTimeout);
    window.__positionBusesTimeout = setTimeout(positionBuses, 50);
  });

  // Call positionBuses whenever we reset or update layout
  const originalReset = reset;
  reset = function () {
    originalReset();
    // allow layout to settle then position buses
    setTimeout(positionBuses, 20);
  };

  // initial reset (will call positionBuses via overwritten reset)
  reset();
});
