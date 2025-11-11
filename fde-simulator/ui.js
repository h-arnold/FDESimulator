/**
 * UI Module: Centralizes all DOM element selectors and accessors.
 * This module provides a single point of access for DOM elements,
 * making it easier to test, mock, and maintain the UI layer.
 */

/**
 * Retrieves all DOM elements needed for the FDE simulator.
 * @param {Document} [root=document] - The document object to query (allows testing with mock DOM)
 * @returns {Object} An object containing all UI element references
 */
export function getElements(root = document) {
  return {
    // Control buttons
    btnStep: root.getElementById("btn-step"),
    btnRun: root.getElementById("btn-run"),
    btnReset: root.getElementById("btn-reset"),

    // Display areas
    currentPhaseEl: root.getElementById("current-phase"),
    stepDescriptionEl: root.getElementById("step-description"),

    // Registers
    pcValueEl: root.getElementById("pc-value"),
    marValueEl: root.getElementById("mar-value"),
    mdrValueEl: root.getElementById("mdr-value"),
    cirValueEl: root.getElementById("cir-value"),
    accValueEl: root.getElementById("acc-value"),

    // Components
    cuEl: root.getElementById("cu"),
    aluEl: root.getElementById("alu"),

    // Buses
    addressBusEl: root.getElementById("address-bus"),
    dataBusEl: root.getElementById("data-bus"),
    controlBusEl: root.getElementById("control-bus"),

    // Memory container
    memoryContainer: root.getElementById("memory-container"),

    // Simulation area (used for layout positioning)
    simulationArea: root.getElementById("simulation-area"),
  };
}

/**
 * Helper to get a memory slot value element by address.
 * @param {Document} root - The document object
 * @param {number} address - The memory address
 * @returns {HTMLElement|null} The memory value element or null if not found
 */
export function getMemoryValueElement(root, address) {
  return root.getElementById(`mem-val-${address}`);
}

/**
 * Helper to get a memory slot element by address.
 * @param {Document} root - The document object
 * @param {number} address - The memory address
 * @returns {HTMLElement|null} The memory slot element or null if not found
 */
export function getMemorySlotElement(root, address) {
  return root.getElementById(`mem-${address}`);
}
