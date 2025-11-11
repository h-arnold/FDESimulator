document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const btnStep = document.getElementById("btn-step");
  const btnRun = document.getElementById("btn-run");
  const btnReset = document.getElementById("btn-reset");

  const currentPhaseEl = document.getElementById("current-phase");
  const stepDescriptionEl = document.getElementById("step-description");

  const pcValueEl = document.getElementById("pc-value");
  const marValueEl = document.getElementById("mar-value");
  const mdrValueEl = document.getElementById("mdr-value");
  const cirValueEl = document.getElementById("cir-value");
  const accValueEl = document.getElementById("acc-value");

  const cuEl = document.getElementById("cu");
  const aluEl = document.getElementById("alu");

  const addressBusEl = document.getElementById("address-bus");
  const dataBusEl = document.getElementById("data-bus");
  const controlBusEl = document.getElementById("control-bus");

  const memoryContainer = document.getElementById("memory-container");

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
      const memValEl = document.getElementById(`mem-val-${i}`);
      if (memValEl.textContent !== memory[i]) {
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
    addressBusEl.classList.remove("bus-active");
    dataBusEl.classList.remove("bus-active");
    controlBusEl.classList.remove("bus-active");
  }

  /**
   * Highlights a specific set of components.
   * @param {string[]} ids - Array of element IDs to highlight.
   * @param {string} [className='highlight'] - The highlight class to apply.
   */
  function highlight(ids, className = "highlight") {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add(className);
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

  /**
   * Executes the next step in the FDE cycle state machine.
   */
  function step() {
    clearHighlights();

    switch (currentState) {
      case "idle":
        currentState = "fetch-1";
        // Immediately call the next step
        step();
        break;

      // --- FETCH PHASE ---

      case "fetch-1":
        currentPhaseEl.textContent = "FETCH";
        // 1. PC -> MAR
        registers.mar = registers.pc;
        stepDescriptionEl.textContent =
          "The Program Counter (PC) holds the address of the next instruction (" +
          registers.pc +
          "). This address is copied to the Memory Address Register (MAR).";
        highlight(["pc", "mar"]);
        currentState = "fetch-2";
        break;

      case "fetch-2":
        // 2. Address sent on address bus, control signals sent
        stepDescriptionEl.textContent =
          "The address (" +
          registers.mar +
          ") is sent to RAM via the address bus. Control signals are sent to request a read operation.";
        highlight(["mar", `mem-${registers.mar}`]);
        addressBusEl.classList.add("bus-active");
        controlBusEl.classList.add("bus-active");
        currentState = "fetch-3";
        break;

      case "fetch-3":
        // 3. RAM[MAR] -> MDR (data travels on data bus)
        registers.mdr = memory[registers.mar];
        stepDescriptionEl.textContent =
          "The instruction at memory address " +
          registers.mar +
          " ('" +
          registers.mdr +
          "') travels from RAM to the Memory Data Register (MDR) via the data bus.";
        highlight(["mdr", `mem-${registers.mar}`]);
        addressBusEl.classList.add("bus-active");
        dataBusEl.classList.add("bus-active");
        controlBusEl.classList.add("bus-active");
        currentState = "fetch-4";
        break;

      case "fetch-4":
        // 4. MDR -> CIR
        registers.cir = registers.mdr;
        stepDescriptionEl.textContent =
          "The instruction ('" +
          registers.cir +
          "') is transferred from the MDR to the Current Instruction Register (CIR).";
        highlight(["mdr", "cir"]);
        currentState = "fetch-5";
        break;

      case "fetch-5":
        // 5. PC++
        registers.pc++;
        stepDescriptionEl.textContent =
          "The Program Counter (PC) is incremented to " +
          registers.pc +
          ", pointing to the next instruction.";
        highlight(["pc"]);
        currentState = "decode-1";
        break;

      // --- DECODE PHASE ---

      case "decode-1":
        currentPhaseEl.textContent = "DECODE";
        // 1. CU decodes CIR
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

        // Branch to next state based on opcode
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
            stepDescriptionEl.textContent +=
              " It is a 'HLT' (Halt) instruction.";
            currentState = "execute-hlt-1";
            break;
          default:
            stepDescriptionEl.textContent =
              "Error: Unknown instruction '" + registers.cir + "'. Resetting.";
            currentState = "idle";
        }
        break;

      case "decode-2-addr":
        // 2. Operand (address) -> MAR
        registers.mar = decodedInstruction.operand;
        stepDescriptionEl.textContent =
          "The address part of the instruction (" +
          registers.mar +
          ") is copied to the MAR, ready to access memory.";
        highlight(["cir", "cu", "mar"], "highlight-active");

        // Branch to execute phase
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
        break;

      // --- EXECUTE PHASE ---

      // LOAD
      case "execute-load-1":
        currentPhaseEl.textContent = "EXECUTE";
        // 1. Address sent to RAM, read requested
        stepDescriptionEl.textContent =
          "The address (" +
          registers.mar +
          ") is sent to RAM via the address bus. Control signals request a read operation.";
        highlight(["mar", `mem-${registers.mar}`]);
        addressBusEl.classList.add("bus-active");
        controlBusEl.classList.add("bus-active");
        currentState = "execute-load-2";
        break;

      case "execute-load-2":
        // 2. RAM[MAR] -> MDR (data travels on data bus)
        registers.mdr = memory[registers.mar];
        stepDescriptionEl.textContent =
          "The data at memory address " +
          registers.mar +
          " ('" +
          registers.mdr +
          "') travels from RAM to the MDR via the data bus.";
        highlight(["mdr", `mem-${registers.mar}`]);
        addressBusEl.classList.add("bus-active");
        dataBusEl.classList.add("bus-active");
        controlBusEl.classList.add("bus-active");
        currentState = "execute-load-3";
        break;

      case "execute-load-3":
        // 3. MDR -> ACC
        registers.acc = registers.mdr;
        stepDescriptionEl.textContent =
          "The data ('" +
          registers.acc +
          "') is copied from the MDR to the Accumulator (ACC).";
        highlight(["mdr", "acc"]);
        currentState = "fetch-1"; // End of cycle
        break;

      // ADD
      case "execute-add-1":
        currentPhaseEl.textContent = "EXECUTE";
        // 1. Address sent to RAM, read requested
        stepDescriptionEl.textContent =
          "The address (" +
          registers.mar +
          ") is sent to RAM via the address bus. Control signals request a read operation.";
        highlight(["mar", `mem-${registers.mar}`]);
        addressBusEl.classList.add("bus-active");
        controlBusEl.classList.add("bus-active");
        currentState = "execute-add-2";
        break;

      case "execute-add-2":
        // 2. RAM[MAR] -> MDR (data travels on data bus)
        registers.mdr = memory[registers.mar];
        stepDescriptionEl.textContent =
          "The data at memory address " +
          registers.mar +
          " ('" +
          registers.mdr +
          "') travels from RAM to the MDR via the data bus.";
        highlight(["mdr", `mem-${registers.mar}`]);
        addressBusEl.classList.add("bus-active");
        dataBusEl.classList.add("bus-active");
        controlBusEl.classList.add("bus-active");
        currentState = "execute-add-3";
        break;

      case "execute-add-3":
        // 3. ACC + MDR -> ACC (via ALU)
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
        currentState = "fetch-1"; // End of cycle
        break;

      // STO
      case "execute-sto-1":
        currentPhaseEl.textContent = "EXECUTE";
        // 1. ACC -> MDR
        registers.mdr = registers.acc;
        stepDescriptionEl.textContent =
          "The value from the Accumulator (" +
          registers.mdr +
          ") is copied to the MDR, preparing to store it in memory.";
        highlight(["acc", "mdr"]);
        currentState = "execute-sto-2";
        break;

      case "execute-sto-2":
        // 2. Address and control signals sent to RAM
        stepDescriptionEl.textContent =
          "The address (" +
          registers.mar +
          ") is sent via the address bus, and control signals request a write operation.";
        highlight(["mar", "mdr", `mem-${registers.mar}`]);
        addressBusEl.classList.add("bus-active");
        controlBusEl.classList.add("bus-active");
        currentState = "execute-sto-3";
        break;

      case "execute-sto-3":
        // 3. MDR -> RAM[MAR] (data travels on data bus)
        memory[registers.mar] = registers.mdr.toString(); // Store as string
        stepDescriptionEl.textContent =
          "The value in the MDR (" +
          registers.mdr +
          ") travels via the data bus and is written to memory at address " +
          registers.mar +
          ".";
        highlight(["mdr", `mem-${registers.mar}`]);
        addressBusEl.classList.add("bus-active");
        dataBusEl.classList.add("bus-active");
        controlBusEl.classList.add("bus-active");
        currentState = "fetch-1"; // End of cycle
        break;

      // HLT
      case "execute-hlt-1":
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
        break;
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
  reset();
});
