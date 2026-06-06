import type { Equipment } from "./types"

/**
 * A small reusable checklist generator so each seed item has a sensible,
 * branching diagnostic flow without hand-writing 16 unique trees.
 */
function basicChecklist(subject: string, checks: string[]): Equipment["checklist"] {
  const steps = checks.map((text, i) => {
    const id = `s${i + 1}`
    const isLast = i === checks.length - 1
    const next = isLast ? "ok" : `s${i + 2}`
    return {
      id,
      text,
      yes: next,
      no: "escalate",
    }
  })
  return steps.length ? steps : [{ id: "s1", text: `Is the ${subject} operating normally?`, yes: "ok", no: "escalate" }]
}

export const SEED_EQUIPMENT: Equipment[] = [
  {
    id: "eq-victron-multiplus",
    name: "MultiPlus Inverter/Charger",
    brand: "Victron",
    type: "Inverter/Charger",
    category: "Inverters & Chargers",
    subcategory: "Inverter/Chargers",
    checklist: basicChecklist("inverter", [
      "Is shore/DC input power present at the unit?",
      "Are the front panel LEDs showing normal (no fault) status?",
      "Is the output AC voltage within 5% of nominal?",
      "Does the unit hold load without tripping for 2 minutes?",
    ]),
    errorCodes: [
      {
        id: "ec-multiplus-1",
        code: "Err 1",
        explanation:
          "Device temperature too high. Check ventilation and ambient temperature; reduce load and let the unit cool down.",
      },
      {
        id: "ec-multiplus-2",
        code: "Err 8",
        explanation:
          "Inverter overload — connected load exceeds the unit's rated output. Disconnect non-essential loads and restart.",
      },
      {
        id: "ec-multiplus-3",
        code: "Low battery",
        explanation:
          "Battery voltage dropped below the cut-off. Recharge batteries and verify the DC cabling and fuses.",
      },
    ],
  },
  {
    id: "eq-mastervolt-combimaster",
    name: "CombiMaster Inverter/Charger",
    brand: "Mastervolt",
    type: "Inverter/Charger",
    category: "Inverters & Chargers",
    subcategory: "Inverter/Chargers",
    checklist: basicChecklist("inverter", [
      "Is the MasterBus / CAN network communicating?",
      "Is the battery voltage above the low-cutoff threshold?",
      "Are cooling fans running when under load?",
      "Is the charge current ramping correctly?",
    ]),
    errorCodes: [
      {
        id: "ec-combimaster-1",
        code: "Overtemperature",
        explanation:
          "Internal temperature too high — output is reduced or shut down. Improve ventilation, clean air inlets and reduce load until the unit cools.",
      },
      {
        id: "ec-combimaster-2",
        code: "DC input low",
        explanation:
          "Battery voltage below the inverter cut-off. Recharge the bank and check for voltage drop across cables, fuses and terminals.",
      },
      {
        id: "ec-combimaster-3",
        code: "Overload",
        explanation:
          "AC load exceeds the rated output. Switch off non-essential consumers and reset; if it persists, check for a shorted load.",
      },
      {
        id: "ec-combimaster-4",
        code: "MasterBus comm error",
        explanation:
          "No communication on the MasterBus/CAN network. Check terminators at both ends and re-seat the network cables.",
      },
    ],
  },
  {
    id: "eq-victron-quattro",
    name: "Quattro Inverter/Charger",
    brand: "Victron",
    type: "Inverter/Charger",
    category: "Inverters & Chargers",
    subcategory: "Inverter/Chargers",
    checklist: basicChecklist("inverter", [
      "Are both AC inputs detected correctly?",
      "Is the transfer switch engaging on shore power?",
      "Is the output frequency stable at 50/60 Hz?",
    ]),
    errorCodes: [
      {
        id: "ec-quattro-1",
        code: "Err 3",
        explanation:
          "VE.Bus device has no or wrong firmware. Re-program the unit with the correct firmware using VE.Bus System Configurator.",
      },
      {
        id: "ec-quattro-2",
        code: "Err 11",
        explanation:
          "Installation error — AC ripple too high on the DC side. Check battery cable cross-section, length and terminal torque.",
      },
      {
        id: "ec-quattro-3",
        code: "Err 17",
        explanation:
          "Phase master overload / one unit took over as master. Verify VE.Bus cabling between units and even load sharing.",
      },
      {
        id: "ec-quattro-4",
        code: "Overload",
        explanation:
          "Connected load exceeds capacity. Reduce load and restart; inspect for a faulty or shorted consumer if it repeats.",
      },
    ],
  },
  {
    id: "eq-onan-marine-genset",
    name: "MDKBH Marine Genset",
    brand: "Onan",
    type: "Generator",
    category: "Generators",
    subcategory: "Diesel Gensets",
    checklist: basicChecklist("generator", [
      "Is the oil level within the operating range?",
      "Is raw-water cooling flow present at the exhaust?",
      "Does the engine crank and start within 10 seconds?",
      "Is the AC output voltage stable under load?",
      "Are coolant temperature and oil pressure normal?",
    ]),
  },
  {
    id: "eq-victron-genset-control",
    name: "Genset Control Panel",
    brand: "Victron",
    type: "Generator",
    category: "Generators",
    subcategory: "Controls",
    checklist: basicChecklist("controller", [
      "Does the control panel power on?",
      "Are all gauges reading plausible values?",
      "Does the remote start/stop signal work?",
    ]),
  },
  {
    id: "eq-seakeeper-9",
    name: "Seakeeper 9 Gyro Stabilizer",
    brand: "Seakeeper",
    type: "Stabilizer",
    category: "Hydraulic & Stabilizers",
    subcategory: "Gyro Stabilizers",
    checklist: basicChecklist("stabilizer", [
      "Is seawater cooling flow confirmed?",
      "Does the flywheel spool up to full RPM?",
      "Is the brake releasing when at speed?",
      "Are there any alarm codes on the display?",
    ]),
  },
  {
    id: "eq-quick-mc2",
    name: "MC2 Gyro Stabilizer",
    brand: "Quick",
    type: "Stabilizer",
    category: "Hydraulic & Stabilizers",
    subcategory: "Gyro Stabilizers",
    checklist: basicChecklist("stabilizer", [
      "Is the unit receiving stable DC supply?",
      "Is the cooling circuit pressurized?",
      "Does the gyro reach operating speed without vibration?",
    ]),
  },
  {
    id: "eq-besenzoni-passerelle",
    name: "Hydraulic Passerelle",
    brand: "Besenzoni",
    type: "Hydraulic Actuator",
    category: "Hydraulic & Stabilizers",
    subcategory: "Passerelles & Gangways",
    checklist: basicChecklist("passerelle", [
      "Is the hydraulic reservoir at the correct level?",
      "Does the pump build pressure on command?",
      "Do all extension/rotation movements work smoothly?",
      "Are there any visible leaks at the cylinders?",
    ]),
  },
  {
    id: "eq-opacmare-platform",
    name: "Transformer Bathing Platform",
    brand: "Opacmare",
    type: "Hydraulic Actuator",
    category: "Hydraulic & Stabilizers",
    subcategory: "Platforms",
    checklist: basicChecklist("platform", [
      "Is the hydraulic power pack running?",
      "Does the platform raise and lower fully?",
      "Are the limit switches stopping travel correctly?",
    ]),
  },
  {
    id: "eq-condaria-chiller",
    name: "Marine Chiller Unit",
    brand: "Condaria",
    type: "Chiller",
    category: "HVAC & Climate",
    subcategory: "Chillers",
    checklist: basicChecklist("chiller", [
      "Is seawater pump flow present at the condenser?",
      "Is the compressor cycling on a cooling demand?",
      "Are suction/discharge pressures within range?",
      "Is chilled-water temperature reaching setpoint?",
    ]),
  },
  {
    id: "eq-webasto-aircon",
    name: "BlueCool Air Handler",
    brand: "Webasto",
    type: "Air Handler",
    category: "HVAC & Climate",
    subcategory: "Air Handlers",
    checklist: basicChecklist("air handler", [
      "Does the fan run on all speed settings?",
      "Is the chilled-water valve actuating?",
      "Is the cabin reaching the thermostat setpoint?",
    ]),
  },
  {
    id: "eq-dometic-aircon",
    name: "Self-Contained A/C Unit",
    brand: "Dometic",
    type: "Air Conditioner",
    category: "HVAC & Climate",
    subcategory: "Self-Contained",
    checklist: basicChecklist("air conditioner", [
      "Is the unit receiving AC power?",
      "Is raw-water flow confirmed through the unit?",
      "Is the blower moving conditioned air?",
    ]),
  },
  {
    id: "eq-frigomar-chiller",
    name: "Modular Chiller",
    brand: "Frigomar",
    type: "Chiller",
    category: "HVAC & Climate",
    subcategory: "Chillers",
    checklist: basicChecklist("chiller", [
      "Are all modules reporting online?",
      "Is the circulation pump running?",
      "Are any high-pressure faults logged?",
    ]),
  },
  {
    id: "eq-bitifrigo-fridge",
    name: "Galley Refrigeration",
    brand: "Bitifrigo",
    type: "Refrigeration",
    category: "HVAC & Climate",
    subcategory: "Refrigeration",
    checklist: basicChecklist("refrigeration", [
      "Is the compressor running on demand?",
      "Is the box reaching its target temperature?",
      "Is the condenser fan clear and spinning?",
    ]),
  },
  {
    id: "eq-victron-lithium-bank",
    name: "Lithium Battery Bank",
    brand: "Victron",
    type: "Battery Bank",
    category: "Battery Banks",
    subcategory: "Lithium",
    checklist: basicChecklist("battery bank", [
      "Is the BMS reporting all cells balanced?",
      "Is the pack voltage within the normal window?",
      "Are all cell temperatures within range?",
      "Does the bank accept charge current?",
    ]),
  },
  {
    id: "eq-mastervolt-agm-bank",
    name: "AGM House Bank",
    brand: "Mastervolt",
    type: "Battery Bank",
    category: "Battery Banks",
    subcategory: "AGM",
    checklist: basicChecklist("battery bank", [
      "Is the resting voltage above 12.4V (per 12V block)?",
      "Are the terminals clean and torqued?",
      "Does the bank hold voltage under a load test?",
    ]),
  },
  {
    id: "eq-main-switchboard",
    name: "AC/DC Main Switchboard",
    brand: "Victron",
    type: "Distribution",
    category: "Electrical Distribution",
    subcategory: "Switchboards",
    checklist: basicChecklist("switchboard", [
      "Are all main breakers in the correct position?",
      "Are bus voltages reading correctly on the meters?",
      "Are there any tripped or warm breakers?",
      "Is the earth/ground monitor showing normal?",
    ]),
  },
  {
    id: "eq-shore-power-inlet",
    name: "Shore Power Inlet & ELCB",
    brand: "Quick",
    type: "Distribution",
    category: "Electrical Distribution",
    subcategory: "Shore Power",
    checklist: basicChecklist("shore inlet", [
      "Is shore voltage present at the inlet?",
      "Does the ELCB/RCD test trip correctly?",
      "Is polarity correct on the indicator?",
    ]),
  },
]
