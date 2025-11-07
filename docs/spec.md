# **Specification & Plan: Interactive FDE Cycle Applet**

## **1\. Project Goal**

To create a single-file HTML/CSS/JS web applet that provides a step-by-step, interactive visual demonstration of the Fetch-Decode-Execute (FDE) cycle. The applet will visualize the movement of data between a simplified RAM and the key CPU registers (PC, MAR, MDR, CIR, ACC), as well as the roles of the Control Unit (CU) and Arithmetic Logic Unit (ALU).

## **2\. Core Components (Visual Layout)**

The UI will be divided into three main sections, mimicking the provided screenshot:

1. **CPU Block:** A container for all internal CPU components.  
   * **Registers:**  
     * **PC (Program Counter):** Displays the address of the next instruction.  
     * **MAR (Memory Address Register):** Displays the address being accessed in RAM.  
     * **MDR (Memory Data Register):** Temporarily holds data/instructions fetched from or being sent to RAM.  
     * **CIR (Current Instruction Register):** Holds the instruction currently being decoded.  
     * **ACC (Accumulator):** Holds data for processing by the ALU and stores the results.  
   * **Control Unit (CU):** A visual block that will be highlighted during the Decode phase.  
   * **Arithmetic Logic Unit (ALU):** A visual block that will be highlighted during the Execute phase for calculations.  
2. **Memory (RAM) Block:**  
   * A list of addressable memory slots (e.g., 0-15).  
   * Each slot will display its address (index) and its current content (either an instruction or data).  
   * This block will be pre-filled with a simple program.  
3. **Information & Control Block:**  
   * **Controls:**  
     * **Step Button:** Manually executes the *next individual step* of the FDE cycle. This is the primary learning tool.  
     * **Run Button:** Automatically runs through all steps with a set delay (e.g., 1 second) per step.  
     * **Reset Button:** Resets the simulation to its initial state (registers cleared, PC at 0, memory reloaded).  
   * **Status Display:**  
     * **Current Phase:** A large text element that clearly states "FETCH", "DECODE", or "EXECUTE".  
     * **Step Description:** A text area that provides a plain-English explanation of the *exact* action just performed (e.g., "The value from the PC is copied to the MAR.").

## **3\. Sample Program (Pre-loaded in RAM)**

To demonstrate the cycle, the app will use a simple program.

* Address 0: LOAD 5 (Load data from address 5 into ACC)  
* Address 1: ADD 6 (Add data from address 6 to the value in ACC)  
* Address 2: STO 7 (Store the value from ACC into address 7\)  
* Address 3: HLT (Halt the program)  
* Address 4: (empty)  
* Address 5: 12 (Data)  
* Address 6: 8 (Data)  
* Address 7: (empty \- will be written to)

## **4\. Interaction & Logic (JavaScript)**

The app will be driven by a state machine that tracks the current step of the cycle.

* **State:** A central state object will hold the current values of all registers (pc, mar, mdr, cir, acc), the contents of memory, and the current step in the simulation (e.g., fetch\_1, decode\_1, etc.).  
* **step() Function:** This is the core function, called by both the Step and Run buttons.  
  * It will use a switch statement based on the current step.  
  * Each case will:  
    1. Perform a single micro-operation (e.g., state.mar \= state.pc).  
    2. Update the UI to reflect this change (e.g., set the text of the MAR component).  
    3. Update the "Step Description" text.  
    4. Update the "Current Phase" display.  
    5. Set the *next* step in the state (e.g., state.currentStep \= 'fetch\_2').  
* **run() Function:** Will use setInterval() to call the step() function repeatedly until the HLT instruction is reached.  
* **reset() Function:** Will restore the state object to its default initial values and update the UI.

## **5\. FDE Cycle Walkthrough (App Logic)**

This is the detailed step-by-step logic the step() function will follow, based on the user-provided text.

**Initial State:** PC: 0, all other registers empty. Phase: IDLE.

### **Cycle 1: LOAD 5 (PC=0)**

1. **(FETCH 1\)**  
   * **Phase:** FETCH  
   * **Action:** Copy PC to MAR. (state.mar \= state.pc)  
   * **Description:** "The Program Counter (PC) holds the address of the next instruction (0). This address is copied to the Memory Address Register (MAR)."  
2. **(FETCH 2\)**  
   * **Phase:** FETCH  
   * **Action:** Fetch instruction from Memory (at address in MAR) to MDR. (state.mdr \= state.memory\[state.mar\])  
   * **Description:** "The instruction at memory address 0 ('LOAD 5') is fetched from RAM and copied to the Memory Data Register (MDR)."  
3. **(FETCH 3\)**  
   * **Phase:** FETCH  
   * **Action:** Copy MDR to CIR. (state.cir \= state.mdr)  
   * **Description:** "The instruction is transferred from the MDR to the Current Instruction Register (CIR)."  
4. **(FETCH 4\)**  
   * **Phase:** FETCH  
   * **Action:** Increment PC. (state.pc++)  
   * **Description:** "The Program Counter (PC) is incremented to 1, pointing to the next instruction."  
5. **(DECODE 1\)**  
   * **Phase:** DECODE  
   * **Action:** Control Unit decodes instruction in CIR. (App will parse "LOAD 5" into opcode: LOAD, operand: 5).  
   * **Description:** "The Control Unit (CU) decodes the instruction in the CIR ('LOAD 5'). It identifies the operation (LOAD) and the data address (5)."  
6. **(DECODE 2 \- Data Fetch Prep)**  
   * **Phase:** DECODE  
   * **Action:** Copy operand (address) to MAR. (state.mar \= 5)  
   * **Description:** "Since the instruction requires data from memory, the address part (5) is copied to the MAR."  
7. **(EXECUTE 1 \- Data Fetch)**  
   * **Phase:** EXECUTE  
   * **Action:** Fetch data from Memory (at address in MAR) to MDR. (state.mdr \= state.memory\[state.mar\])  
   * **Description:** "The data at memory address 5 ('12') is fetched from RAM and copied to the MDR."  
8. **(EXECUTE 2 \- Load to ACC)**  
   * **Phase:** EXECUTE  
   * **Action:** Copy MDR to ACC. (state.acc \= state.mdr)  
   * **Description:** "The data ('12') is copied from the MDR to the Accumulator (ACC) to be processed."

### **Cycle 2: ADD 6 (PC=1)**

* The cycle repeats:  
* **(FETCH 1-4):** PC (1) \-\> MAR (1) \-\> MDR ('ADD 6') \-\> CIR ('ADD 6') \-\> PC incremented to 2\.  
* **(DECODE 1-2):** CU decodes 'ADD 6'. Address (6) is copied to MAR.  
* **(EXECUTE 1):** Data at address 6 ('8') is fetched to MDR.  
* **(EXECUTE 2):** ALU performs addition. (state.acc \= parseInt(state.acc) \+ parseInt(state.mdr))  
  * **Description:** "The Arithmetic Logic Unit (ALU) adds the value in the MDR (8) to the value in the ACC (12). The result (20) is stored back in the Accumulator."

### **Cycle 3: STO 7 (PC=2)**

* **(FETCH 1-4):** PC (2) \-\> MAR (2) \-\> MDR ('STO 7') \-\> CIR ('STO 7') \-\> PC incremented to 3\.  
* **(DECODE 1-2):** CU decodes 'STO 7'. Address (7) is copied to MAR.  
* **(EXECUTE 1):** Copy data from ACC to MDR. (state.mdr \= state.acc)  
  * **Description:** "The value to be stored ('20') is copied from the ACC to the MDR."  
* **(EXECUTE 2):** Store data from MDR into Memory. (state.memory\[state.mar\] \= state.mdr)  
  * **Description:** "The data in the MDR ('20') is written to RAM at the address in the MAR (7)."

### **Cycle 4: HLT (PC=3)**

* **(FETCH 1-4):** PC (3) \-\> MAR (3) \-\> MDR ('HLT') \-\> CIR ('HLT') \-\> PC incremented to 4\.  
* **(DECODE 1):** CU decodes 'HLT'.  
  * **Description:** "The Control Unit (CU) decodes the 'HLT' (Halt) instruction."  
* **(EXECUTE 1):** Stop simulation.  
  * **Description:** "Program execution is stopped. Click 'Reset' to start over."  
  * **Action:** Disable Step and Run buttons.

## **6\. Styling (CSS)**

* **Layout:** Use Flexbox or CSS Grid to create the main layout (CPU block and Memory block side-by-side).  
* **Components:** All components (registers, RAM slots, CU, ALU) will be div elements with clear border, padding, and border-radius for a clean, blocky look.  
* **Highlighting:** A .highlight class (e.g., background-color: \#ffff99; border-color: red;) will be dynamically added and removed by JavaScript to show which components are active in the current step.  
* **Data Flow:** While physical buses won't be drawn, the "flow" will be visualized by highlighting the source component, then highlighting the destination component as the value text appears.  
* **Responsiveness:** Use media queries to stack the CPU and Memory blocks vertically on smaller screens.

## **Knowledge this FDE Applet needs to incorporate:**

The FDE cycle is the basic process the Central Processing Unit (CPU) uses to execute instructions, managed by various components, including the Control Unit (CU), Arithmetic Logic Unit (ALU), and registers such as the Program Counter (PC), Memory Address Register (MAR), Memory Data Register (MDR), Current Instruction Register (CIR), and the Accumulator (ACC).

### **1\. Fetch Phase**

The Fetch phase is concerned with retrieving the next instruction from memory.

1. The Program Counter (PC) holds the memory address of the next instruction to be executed.  
2. This address held in the PC is loaded into the Memory Address Register (MAR).  
3. The CPU checks if the instruction is present in the cache memory.  
4. If the instruction is found in the cache, it is fetched directly from there.  
5. If the instruction is *not* in the cache, it is fetched from the main memory (RAM) and temporarily stored in the Memory Data Register (MDR).  
6. The instruction is then transferred from the MDR and copied into the Current Instruction Register (CIR).  
7. The PC is simultaneously incremented (moved on one) to point to the address of the subsequent instruction. If the instruction was fetched from cache, it is also stored in the cache at this point.

### **2\. Decode Phase**

The Decode phase interprets the instruction held in the CIR to determine what operation needs to be carried out.

1. The Control Unit (CU) translates (decodes) the instruction currently stored in the CIR.  
2. The CU determines the required operations and selects the necessary machine resources, such as the Arithmetic Logic Unit (ALU) or access to other registers.  
3. The CPU checks the cache for any data required by the instruction.  
4. If required data is not in the cache, it is fetched from main memory into the MDR.

### **3\. Execute Phase**

The Execute phase carries out the actions specified by the decoded instruction.

1. The instruction is executed. This may involve mathematical operations (like addition) or logical operations (like comparison) carried out by the ALU.  
2. The Accumulator (ACC) is used to temporarily hold intermediate data during calculations performed by the ALU, and it also stores the result of these operations.  
3. The MDR may be used to transfer data between the CPU and memory during memory access or I/O operations.  
4. The result generated by the operation is stored back into a register or memory location, as specified by the instruction.  
5. Based on feedback from the ALU, the PC may be updated to a new address if necessary (such as in the case of a jump instruction).

The cycle then repeats, returning to the Fetch phase, using the updated address stored in the PC.

### **1\. Fetch Phase**

The Fetch phase is concerned with retrieving the next instruction from memory.

1. The Program Counter (PC) holds the memory address of the next instruction to be executed.  
2. This address held in the PC is loaded into the Memory Address Register (MAR).  
3. The CPU checks if the instruction is present in the cache memory.  
4. If the instruction is found in the cache, it is fetched directly from there.  
5. If the instruction is *not* in the cache, it is fetched from the main memory (RAM) and temporarily stored in the Memory Data Register (MDR).  
6. The instruction is then transferred from the MDR and copied into the Current Instruction Register (CIR).  
7. The PC is simultaneously incremented (moved on one) to point to the address of the subsequent instruction. If the instruction was fetched from cache, it is also stored in the cache at this point.

### **2\. Decode Phase**

The Decode phase interprets the instruction held in the CIR to determine what operation needs to be carried out.

1. The Control Unit (CU) translates (decodes) the instruction currently stored in the CIR.  
2. The CU determines the required operations and selects the necessary machine resources, such as the Arithmetic Logic Unit (ALU) or access to other registers.  
3. The CPU checks the cache for any data required by the instruction.  
4. If required data is not in the cache, it is fetched from main memory into the MDR.

### **3\. Execute Phase**

The Execute phase carries out the actions specified by the decoded instruction.

1. The instruction is executed. This may involve mathematical operations (like addition) or logical operations (like comparison) carried out by the ALU.  
2. The Accumulator (ACC) is used to temporarily hold intermediate data during calculations performed by the ALU, and it also stores the result of these operations.  
3. The MDR may be used to transfer data between the CPU and memory during memory access or I/O operations.  
4. The result generated by the operation is stored back into a register or memory location, as specified by the instruction.  
5. Based on feedback from the ALU, the PC may be updated to a new address if necessary (such as in the case of a jump instruction).

The cycle then repeats, returning to the Fetch phase, using the updated address stored in the PC.

Knowledge this FDE Applet needs to incorporate:

The FDE cycle is the basic process the Central Processing Unit (CPU) uses to execute instructions, managed by various components, including the Control Unit (CU), Arithmetic Logic Unit (ALU), and registers such as the Program Counter (PC), Memory Address Register (MAR), Memory Data Register (MDR), Current Instruction Register (CIR), and the Accumulator (ACC).

### **1\. Fetch Phase**

The Fetch phase is concerned with retrieving the next instruction from memory.

8. The Program Counter (PC) holds the memory address of the next instruction to be executed.  
9. This address held in the PC is loaded into the Memory Address Register (MAR).  
10. The CPU checks if the instruction is present in the cache memory.  
11. If the instruction is found in the cache, it is fetched directly from there.  
12. If the instruction is *not* in the cache, it is fetched from the main memory (RAM) and temporarily stored in the Memory Data Register (MDR).  
13. The instruction is then transferred from the MDR and copied into the Current Instruction Register (CIR).  
14. The PC is simultaneously incremented (moved on one) to point to the address of the subsequent instruction. If the instruction was fetched from cache, it is also stored in the cache at this point.

### **2\. Decode Phase**

The Decode phase interprets the instruction held in the CIR to determine what operation needs to be carried out.

5. The Control Unit (CU) translates (decodes) the instruction currently stored in the CIR.  
6. The CU determines the required operations and selects the necessary machine resources, such as the Arithmetic Logic Unit (ALU) or access to other registers.  
7. The CPU checks the cache for any data required by the instruction.  
8. If required data is not in the cache, it is fetched from main memory into the MDR.

### **3\. Execute Phase**

The Execute phase carries out the actions specified by the decoded instruction.

6. The instruction is executed. This may involve mathematical operations (like addition) or logical operations (like comparison) carried out by the ALU.  
7. The Accumulator (ACC) is used to temporarily hold intermediate data during calculations performed by the ALU, and it also stores the result of these operations.  
8. The MDR may be used to transfer data between the CPU and memory during memory access or I/O operations.  
9. The result generated by the operation is stored back into a register or memory location, as specified by the instruction.  
10. Based on feedback from the ALU, the PC may be updated to a new address if necessary (such as in the case of a jump instruction).

The cycle then repeats, returning to the Fetch phase, using the updated address stored in the PC.

### **1\. Fetch Phase**

The Fetch phase is concerned with retrieving the next instruction from memory.

8. The Program Counter (PC) holds the memory address of the next instruction to be executed.  
9. This address held in the PC is loaded into the Memory Address Register (MAR).  
10. The CPU checks if the instruction is present in the cache memory.  
11. If the instruction is found in the cache, it is fetched directly from there.  
12. If the instruction is *not* in the cache, it is fetched from the main memory (RAM) and temporarily stored in the Memory Data Register (MDR).  
13. The instruction is then transferred from the MDR and copied into the Current Instruction Register (CIR).  
14. The PC is simultaneously incremented (moved on one) to point to the address of the subsequent instruction. If the instruction was fetched from cache, it is also stored in the cache at this point.

### **2\. Decode Phase**

The Decode phase interprets the instruction held in the CIR to determine what operation needs to be carried out.

5. The Control Unit (CU) translates (decodes) the instruction currently stored in the CIR.  
6. The CU determines the required operations and selects the necessary machine resources, such as the Arithmetic Logic Unit (ALU) or access to other registers.  
7. The CPU checks the cache for any data required by the instruction.  
8. If required data is not in the cache, it is fetched from main memory into the MDR.

### **3\. Execute Phase**

The Execute phase carries out the actions specified by the decoded instruction.

6. The instruction is executed. This may involve mathematical operations (like addition) or logical operations (like comparison) carried out by the ALU.  
7. The Accumulator (ACC) is used to temporarily hold intermediate data during calculations performed by the ALU, and it also stores the result of these operations.  
8. The MDR may be used to transfer data between the CPU and memory during memory access or I/O operations.  
9. The result generated by the operation is stored back into a register or memory location, as specified by the instruction.  
10. Based on feedback from the ALU, the PC may be updated to a new address if necessary (such as in the case of a jump instruction).

The cycle then repeats, returning to the Fetch phase, using the updated address stored in the PC.