const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DTAM database seeding...');

  // Clean existing tables in correct dependency order
  await prisma.sensorReading.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.failurePrediction.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.digitalTwin.deleteMany();
  await prisma.assetComponent.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.location.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // 1. Seed Demo Users
  const passwordAdmin = await bcrypt.hash('Admin@123', 10);
  const passwordManager = await bcrypt.hash('Manager@123', 10);
  const passwordTech = await bcrypt.hash('Tech@123', 10);
  const passwordViewer = await bcrypt.hash('Viewer@123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: passwordAdmin,
      name: 'Alex Vance (Chief Architect)',
      role: 'ADMIN',
      department: 'Executive Operations',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      password: passwordManager,
      name: 'Sarah Connor (Plant Manager)',
      role: 'MANAGER',
      department: 'Plant Operations',
    },
  });

  const technician = await prisma.user.create({
    data: {
      email: 'technician@example.com',
      password: passwordTech,
      name: 'Marcus Brody (Lead Technician)',
      role: 'TECHNICIAN',
      department: 'Mechanical Maintenance',
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@example.com',
      password: passwordViewer,
      name: 'Elena Rostova (Quality Auditor)',
      role: 'VIEWER',
      department: 'Safety & Compliance',
    },
  });

  console.log('✅ Demo users created.');

  // 2. Seed Factory Locations
  const locFactoryA = await prisma.location.create({
    data: {
      name: 'Primary Processing Hall',
      building: 'Building 1 - Heavy Machining',
      floor: 'Floor 1',
      room: 'Bay 104',
      coordinates: 'Grid A-12',
    },
  });

  const locFactoryB = await prisma.location.create({
    data: {
      name: 'Precision CNC Line',
      building: 'Building 2 - Advanced Manufacturing',
      floor: 'Floor 2',
      room: 'Cleanroom Wing C',
      coordinates: 'Grid B-07',
    },
  });

  const locPowerhouse = await prisma.location.create({
    data: {
      name: 'Central Energy Substation',
      building: 'Building 4 - Utilities & Power',
      floor: 'Ground',
      room: 'Turbine Room 1',
      coordinates: 'Grid P-01',
    },
  });

  const locCooling = await prisma.location.create({
    data: {
      name: 'External HVAC Roof Deck',
      building: 'Roof Deck 3',
      floor: 'Roof Level',
      room: 'Cooling Deck',
      coordinates: 'Grid R-09',
    },
  });

  console.log('✅ Locations created.');

  // 3. Asset Specifications and Definitions
  const assetDefinitions = [
    {
      name: 'Centrifugal Slurry Pump',
      assetCode: 'PUMP-001',
      type: 'PUMP',
      manufacturer: 'FlowServe Corp',
      model: 'Durco Mark 3 ISO',
      serialNumber: 'FS-2023-88910',
      locationId: locFactoryA.id,
      criticality: 'CRITICAL',
      status: 'HEALTHY',
      healthScore: 94.5,
      operatingHours: 4210.5,
      description: 'Heavy duty centrifugal horizontal slurry pump circulating industrial coolant in primary closed-loop loop.',
      sensors: [
        { type: 'TEMPERATURE', unit: '°C', min: 20, max: 110, warn: 72, crit: 86, curr: 54.2, code: 'PUMP-001-TEMP' },
        { type: 'VIBRATION', unit: 'mm/s', min: 0, max: 15, warn: 4.8, crit: 7.5, curr: 2.1, code: 'PUMP-001-VIB' },
        { type: 'PRESSURE', unit: 'bar', min: 1, max: 12, warn: 7.8, crit: 9.8, curr: 4.6, code: 'PUMP-001-PRESS' },
        { type: 'FLOW', unit: 'L/min', min: 50, max: 600, warn: 120, crit: 80, curr: 410.0, code: 'PUMP-001-FLOW' },
        { type: 'ENERGY', unit: 'kW', min: 5, max: 45, warn: 35, crit: 42, curr: 21.8, code: 'PUMP-001-PWR' },
      ],
      components: [
        { name: 'Ceramic Impeller Vanes', type: 'Impeller', status: 'HEALTHY', healthScore: 96 },
        { name: 'Drive End Ball Bearings', type: 'Bearing', status: 'HEALTHY', healthScore: 92 },
        { name: 'Mechanical Carbon Seal', type: 'Seal', status: 'HEALTHY', healthScore: 95 },
      ],
    },
    {
      name: '5-Axis CNC Milling Center',
      assetCode: 'CNC-002',
      type: 'CNC_MACHINE',
      manufacturer: 'DMG MORI',
      model: 'DMU 50 3rd Gen',
      serialNumber: 'DMG-M-90214',
      locationId: locFactoryB.id,
      criticality: 'CRITICAL',
      status: 'HEALTHY',
      healthScore: 89.0,
      operatingHours: 3120.0,
      description: 'High-precision 5-axis vertical machining center producing aerospace-grade aluminum turbine housings.',
      sensors: [
        { type: 'TEMPERATURE', unit: '°C', min: 15, max: 85, warn: 60, crit: 75, curr: 42.0, code: 'CNC-002-TEMP' },
        { type: 'VIBRATION', unit: 'mm/s', min: 0, max: 10, warn: 3.5, crit: 6.0, curr: 1.4, code: 'CNC-002-VIB' },
        { type: 'RPM', unit: 'RPM', min: 0, max: 20000, warn: 16000, crit: 18500, curr: 12400, code: 'CNC-002-RPM' },
        { type: 'ENERGY', unit: 'kW', min: 2, max: 35, warn: 28, crit: 32, curr: 16.5, code: 'CNC-002-PWR' },
      ],
      components: [
        { name: 'High-Speed Spindle Core', type: 'Spindle', status: 'HEALTHY', healthScore: 91 },
        { name: 'Linear X/Y Axis Guideways', type: 'Guideway', status: 'HEALTHY', healthScore: 88 },
        { name: 'Automatic Tool Changer Arm', type: 'Actuator', status: 'HEALTHY', healthScore: 90 },
      ],
    },
    {
      name: 'Three-Phase Heavy Induction Motor',
      assetCode: 'MTR-003',
      type: 'ELECTRIC_MOTOR',
      manufacturer: 'Siemens AG',
      model: 'SIMOTICS SD 1LE5',
      serialNumber: 'SIE-MOT-44109',
      locationId: locFactoryA.id,
      criticality: 'HIGH',
      status: 'WARNING',
      healthScore: 68.5,
      operatingHours: 7850.2,
      description: 'Continuous duty squirrel-cage powertrain motor driving intake transfer conveyor with thermal drift.',
      sensors: [
        { type: 'TEMPERATURE', unit: '°C', min: 20, max: 120, warn: 75, crit: 95, curr: 77.4, code: 'MTR-003-TEMP' },
        { type: 'VIBRATION', unit: 'mm/s', min: 0, max: 15, warn: 5.5, crit: 8.5, curr: 5.9, code: 'MTR-003-VIB' },
        { type: 'RPM', unit: 'RPM', min: 0, max: 3600, warn: 3200, crit: 3500, curr: 1780, code: 'MTR-003-RPM' },
        { type: 'ENERGY', unit: 'kW', min: 10, max: 90, warn: 72, crit: 85, curr: 62.0, code: 'MTR-003-PWR' },
      ],
      components: [
        { name: 'Stator Copper Windings', type: 'Stator', status: 'WARNING', healthScore: 65 },
        { name: 'Non-Drive End Rolling Bearings', type: 'Bearing', status: 'WARNING', healthScore: 62 },
        { name: 'Integrated Cooling Fan', type: 'Fan', status: 'HEALTHY', healthScore: 80 },
      ],
    },
    {
      name: 'Rotary Screw Air Compressor',
      assetCode: 'CMP-004',
      type: 'COMPRESSOR',
      manufacturer: 'Atlas Copco',
      model: 'GA 75 VSD+ FF',
      serialNumber: 'AC-GA75-2022',
      locationId: locPowerhouse.id,
      criticality: 'CRITICAL',
      status: 'HEALTHY',
      healthScore: 92.0,
      operatingHours: 5400.0,
      description: 'Variable speed drive oil-injected screw compressor supplying 7.5 bar compressed air to all automated assembly stations.',
      sensors: [
        { type: 'TEMPERATURE', unit: '°C', min: 20, max: 100, warn: 78, crit: 92, curr: 62.5, code: 'CMP-004-TEMP' },
        { type: 'PRESSURE', unit: 'bar', min: 2, max: 13, warn: 8.5, crit: 11.0, curr: 7.4, code: 'CMP-004-PRESS' },
        { type: 'VIBRATION', unit: 'mm/s', min: 0, max: 12, warn: 4.5, crit: 7.0, curr: 1.9, code: 'CMP-004-VIB' },
        { type: 'ENERGY', unit: 'kW', min: 10, max: 75, warn: 65, crit: 72, curr: 44.0, code: 'CMP-004-PWR' },
      ],
      components: [
        { name: 'Twin Helical Screws (Male/Female)', type: 'Rotors', status: 'HEALTHY', healthScore: 94 },
        { name: 'Oil Separation Cartridge', type: 'Filter', status: 'HEALTHY', healthScore: 90 },
        { name: 'Inlet Modulation Valve', type: 'Valve', status: 'HEALTHY', healthScore: 93 },
      ],
    },
    {
      name: 'Emergency Backup Diesel Generator',
      assetCode: 'GEN-005',
      type: 'GENERATOR',
      manufacturer: 'Caterpillar Inc',
      model: 'CAT C18 ACERT',
      serialNumber: 'CAT-GEN-90812',
      locationId: locPowerhouse.id,
      criticality: 'CRITICAL',
      status: 'HEALTHY',
      healthScore: 97.0,
      operatingHours: 640.0,
      description: 'Standby 600 ekW diesel generator ensuring continuous power for critical cooling and safety telemetry.',
      sensors: [
        { type: 'TEMPERATURE', unit: '°C', min: 20, max: 115, warn: 85, crit: 102, curr: 48.0, code: 'GEN-005-TEMP' },
        { type: 'VIBRATION', unit: 'mm/s', min: 0, max: 18, warn: 6.0, crit: 9.5, curr: 2.2, code: 'GEN-005-VIB' },
        { type: 'RPM', unit: 'RPM', min: 0, max: 2200, warn: 1900, crit: 2100, curr: 1500, code: 'GEN-005-RPM' },
        { type: 'ENERGY', unit: 'kW', min: 0, max: 600, warn: 520, crit: 580, curr: 120.0, code: 'GEN-005-PWR' },
      ],
      components: [
        { name: 'V12 Turbocharged Engine Block', type: 'Engine', status: 'HEALTHY', healthScore: 98 },
        { name: 'Brushless Synchronous Alternator', type: 'Alternator', status: 'HEALTHY', healthScore: 96 },
        { name: 'Dual Fuel Injection Rails', type: 'Fuel System', status: 'HEALTHY', healthScore: 97 },
      ],
    },
    {
      name: 'Centrifugal Water Chiller Unit',
      assetCode: 'HVAC-006',
      type: 'HVAC',
      manufacturer: 'Trane Technologies',
      model: 'CenTraVac CVHE',
      serialNumber: 'TRN-CHL-11029',
      locationId: locCooling.id,
      criticality: 'MEDIUM',
      status: 'HEALTHY',
      healthScore: 88.0,
      operatingHours: 6920.0,
      description: 'Direct-drive low pressure refrigerant centrifugal chiller providing precision temperature control for cleanrooms.',
      sensors: [
        { type: 'TEMPERATURE', unit: '°C', min: 2, max: 65, warn: 48, crit: 58, curr: 14.2, code: 'HVAC-006-TEMP' },
        { type: 'PRESSURE', unit: 'bar', min: 0.5, max: 8, warn: 5.5, crit: 7.2, curr: 3.1, code: 'HVAC-006-PRESS' },
        { type: 'VIBRATION', unit: 'mm/s', min: 0, max: 8, warn: 3.2, crit: 5.0, curr: 1.1, code: 'HVAC-006-VIB' },
        { type: 'ENERGY', unit: 'kW', min: 15, max: 120, warn: 95, crit: 110, curr: 58.5, code: 'HVAC-006-PWR' },
      ],
      components: [
        { name: 'Multi-Stage Semi-Hermetic Compressor', type: 'Compressor', status: 'HEALTHY', healthScore: 89 },
        { name: 'Shell-and-Tube Evaporator', type: 'Heat Exchanger', status: 'HEALTHY', healthScore: 87 },
      ],
    },
    {
      name: 'High-Pressure Gas Steam Boiler',
      assetCode: 'BLR-007',
      type: 'BOILER',
      manufacturer: 'Cleaver-Brooks',
      model: 'CB-EX 200HP',
      serialNumber: 'CB-BLR-66519',
      locationId: locPowerhouse.id,
      criticality: 'CRITICAL',
      status: 'HEALTHY',
      healthScore: 91.5,
      operatingHours: 8900.0,
      description: 'Firetube steam generation system supplying continuous thermal energy for manufacturing autoclaves.',
      sensors: [
        { type: 'TEMPERATURE', unit: '°C', min: 50, max: 280, warn: 210, crit: 245, curr: 178.0, code: 'BLR-007-TEMP' },
        { type: 'PRESSURE', unit: 'bar', min: 1, max: 25, warn: 18, crit: 22, curr: 12.4, code: 'BLR-007-PRESS' },
        { type: 'FLOW', unit: 'L/min', min: 100, max: 1200, warn: 950, crit: 1100, curr: 620.0, code: 'BLR-007-FLOW' },
        { type: 'ENERGY', unit: 'kW', min: 20, max: 200, warn: 160, crit: 185, curr: 88.0, code: 'BLR-007-PWR' },
      ],
      components: [
        { name: 'Corrugated Furnace Flue Tube', type: 'Flue Tube', status: 'HEALTHY', healthScore: 92 },
        { name: 'Low-NOx Gas Modulating Burner', type: 'Burner', status: 'HEALTHY', healthScore: 90 },
      ],
    },
    {
      name: 'Main Assembly Conveyor Powertrain',
      assetCode: 'CNV-008',
      type: 'CONVEYOR',
      manufacturer: 'Dorner Conveyors',
      model: 'AquaGard 7350',
      serialNumber: 'DOR-CNV-33201',
      locationId: locFactoryA.id,
      criticality: 'MEDIUM',
      status: 'HEALTHY',
      healthScore: 84.0,
      operatingHours: 6100.0,
      description: 'Continuous modular plastic chain conveyor routing intermediate workpieces across automated robotic stations.',
      sensors: [
        { type: 'TEMPERATURE', unit: '°C', min: 15, max: 75, warn: 52, crit: 65, curr: 38.0, code: 'CNV-008-TEMP' },
        { type: 'VIBRATION', unit: 'mm/s', min: 0, max: 10, warn: 3.8, crit: 6.2, curr: 1.8, code: 'CNV-008-VIB' },
        { type: 'RPM', unit: 'RPM', min: 0, max: 1800, warn: 1400, crit: 1650, curr: 920, code: 'CNV-008-RPM' },
        { type: 'ENERGY', unit: 'kW', min: 1, max: 18, warn: 14, crit: 16.5, curr: 7.2, code: 'CNV-008-PWR' },
      ],
      components: [
        { name: 'Bevel Helical Gearbox', type: 'Gearbox', status: 'HEALTHY', healthScore: 85 },
        { name: 'Acetal Polymer Belt Links', type: 'Belt', status: 'HEALTHY', healthScore: 83 },
      ],
    },
    {
      name: '500-Ton Hydraulic Stamping Press',
      assetCode: 'PRS-009',
      type: 'HYDRAULIC_PRESS',
      manufacturer: 'Schuler Group',
      model: 'MSD2-500 Servo',
      serialNumber: 'SCH-PRS-00512',
      locationId: locFactoryA.id,
      criticality: 'CRITICAL',
      status: 'CRITICAL',
      healthScore: 38.0,
      operatingHours: 11450.0,
      description: 'Heavy servo-electric hydraulic forming press stamping high-tensile structural vehicle chassis brackets.',
      sensors: [
        { type: 'TEMPERATURE', unit: '°C', min: 20, max: 130, warn: 82, crit: 98, curr: 102.5, code: 'PRS-009-TEMP' },
        { type: 'PRESSURE', unit: 'bar', min: 10, max: 350, warn: 290, crit: 330, curr: 336.0, code: 'PRS-009-PRESS' },
        { type: 'VIBRATION', unit: 'mm/s', min: 0, max: 20, warn: 7.5, crit: 12.0, curr: 13.8, code: 'PRS-009-VIB' },
        { type: 'ENERGY', unit: 'kW', min: 20, max: 250, warn: 195, crit: 230, curr: 238.0, code: 'PRS-009-PWR' },
      ],
      components: [
        { name: 'High-Pressure Hydraulic Cylinder Ram', type: 'Cylinder', status: 'CRITICAL', healthScore: 35 },
        { name: 'Proportional Servo Control Valves', type: 'Valves', status: 'CRITICAL', healthScore: 40 },
      ],
    },
    {
      name: 'Induced Draft Evaporative Cooling Tower',
      assetCode: 'CTW-010',
      type: 'COOLING_TOWER',
      manufacturer: 'SPX Marley',
      model: 'NC Everest 8400',
      serialNumber: 'SPX-CTW-77890',
      locationId: locCooling.id,
      criticality: 'MEDIUM',
      status: 'HEALTHY',
      healthScore: 93.0,
      operatingHours: 4900.0,
      description: 'Crossflow fiberglass cooling tower dissipating thermal process loads from building chiller condenser loops.',
      sensors: [
        { type: 'TEMPERATURE', unit: '°C', min: 10, max: 70, warn: 45, crit: 55, curr: 26.5, code: 'CTW-010-TEMP' },
        { type: 'VIBRATION', unit: 'mm/s', min: 0, max: 10, warn: 3.5, crit: 5.5, curr: 1.2, code: 'CTW-010-VIB' },
        { type: 'FLOW', unit: 'L/min', min: 200, max: 2500, warn: 400, crit: 250, curr: 1650.0, code: 'CTW-010-FLOW' },
        { type: 'ENERGY', unit: 'kW', min: 5, max: 55, warn: 42, crit: 48, curr: 24.0, code: 'CTW-010-PWR' },
      ],
      components: [
        { name: 'Variable Pitch Fan Impeller Blades', type: 'Fan', status: 'HEALTHY', healthScore: 94 },
        { name: 'PVC Film Fill Thermal Media', type: 'Fill Media', status: 'HEALTHY', healthScore: 92 },
      ],
    },
  ];

  for (const def of assetDefinitions) {
    const { sensors: sensorList, components: compList, ...assetData } = def;

    // Create Asset
    const createdAsset = await prisma.asset.create({
      data: {
        ...assetData,
        installationDate: new Date(Date.now() - (Math.random() * 800 + 200) * 24 * 60 * 60 * 1000),
      },
    });

    // Create Components
    for (const comp of compList) {
      await prisma.assetComponent.create({
        data: {
          assetId: createdAsset.id,
          name: comp.name,
          type: comp.type,
          status: comp.status,
          healthScore: comp.healthScore,
          lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Create Sensors and Historical Readings (past 30 days)
    const sensorMap = {};
    const createdSensorRecords = [];

    for (const s of sensorList) {
      const createdSensor = await prisma.sensor.create({
        data: {
          assetId: createdAsset.id,
          sensorCode: s.code,
          type: s.type,
          unit: s.unit,
          minThreshold: s.min,
          maxThreshold: s.max,
          warningThreshold: s.warn,
          criticalThreshold: s.crit,
          currentReading: s.curr,
          status: s.curr >= s.crit ? 'CRITICAL' : s.curr >= s.warn ? 'WARNING' : 'NORMAL',
          sampleRate: 3000,
        },
      });

      createdSensorRecords.push(createdSensor);

      sensorMap[s.type] = {
        sensorId: createdSensor.id,
        code: s.code,
        value: s.curr,
        unit: s.unit,
        status: s.curr >= s.crit ? 'CRITICAL' : s.curr >= s.warn ? 'WARNING' : 'NORMAL',
        warningThreshold: s.warn,
        criticalThreshold: s.crit,
      };

      // Generate 25 historical data points over past 30 days
      const readingsBatch = [];
      const isCriticalAsset = createdAsset.status === 'CRITICAL';
      const isWarningAsset = createdAsset.status === 'WARNING';

      for (let i = 25; i >= 0; i--) {
        const timePoint = new Date(Date.now() - i * 1.2 * 24 * 60 * 60 * 1000);
        let val = s.curr;

        // Add gradual progression for warning/critical assets
        if (isCriticalAsset && (s.type === 'TEMPERATURE' || s.type === 'VIBRATION' || s.type === 'PRESSURE')) {
          const progress = (25 - i) / 25; // 0 to 1
          val = s.warn * 0.8 + (s.curr - s.warn * 0.8) * progress + (Math.random() * 4 - 2);
        } else if (isWarningAsset && (s.type === 'TEMPERATURE' || s.type === 'VIBRATION')) {
          const progress = (25 - i) / 25;
          val = s.min * 1.2 + (s.curr - s.min * 1.2) * progress + (Math.random() * 2 - 1);
        } else {
          // Normal sinusoidal daily variation + noise
          const dailyCycle = Math.sin((i / 25) * Math.PI * 4) * (s.warn - s.min) * 0.15;
          val = s.curr + dailyCycle + (Math.random() * 2 - 1);
        }

        val = Math.max(s.min * 0.9, Math.min(s.max * 1.1, val));
        val = s.type === 'VIBRATION' || s.type === 'PRESSURE' ? Math.round(val * 100) / 100 : Math.round(val * 10) / 10;

        let status = 'NORMAL';
        if (val >= s.crit) status = 'CRITICAL';
        else if (val >= s.warn) status = 'WARNING';

        readingsBatch.push({
          sensorId: createdSensor.id,
          assetId: createdAsset.id,
          value: val,
          status,
          isAnomaly: status !== 'NORMAL',
          timestamp: timePoint,
        });
      }

      await prisma.sensorReading.createMany({ data: readingsBatch });
    }

    // Determine failure risk
    const failureProb = createdAsset.status === 'CRITICAL' ? 88.5 : createdAsset.status === 'WARNING' ? 52.0 : 8.5;
    const failureRiskObj = {
      failureProbability: failureProb,
      riskLevel: failureProb >= 75 ? 'CRITICAL' : failureProb >= 50 ? 'HIGH' : failureProb >= 25 ? 'MEDIUM' : 'LOW',
      estimatedMaintenanceWindow: failureProb >= 75 ? 'Immediate action required (< 24 hours)' : failureProb >= 50 ? 'Schedule maintenance within 48-72 hours' : 'Standard schedule (within 6 months)',
      recommendation: failureProb >= 75
        ? 'Urgent: High vibration and hydraulic pressure surge detected on cylinder seals. Dispatch technician.'
        : failureProb >= 50
        ? 'Inspect motor stator insulation and re-lubricate non-drive bearings during next planned shift.'
        : 'Asset operating nominally within calibrated ISO tolerances.',
      factors: [
        { factor: 'Operational Hours Degradation', severity: 'INFO', description: 'Cumulative hours within design limits.' },
      ],
      timestamp: new Date(),
    };

    // Create Digital Twin
    await prisma.digitalTwin.create({
      data: {
        assetId: createdAsset.id,
        currentState: createdAsset.status === 'CRITICAL' ? 'FAULT' : createdAsset.status === 'WARNING' ? 'DEGRADED' : 'OPERATIONAL',
        sensorValues: JSON.stringify(sensorMap),
        healthScore: createdAsset.healthScore,
        operatingHours: createdAsset.operatingHours,
        maintenanceStatus: createdAsset.status === 'CRITICAL' ? 'DUE_SOON' : createdAsset.status === 'WARNING' ? 'DUE_SOON' : 'UP_TO_DATE',
        failureRisk: JSON.stringify(failureRiskObj),
        anomalyStatus: createdAsset.status === 'CRITICAL' ? 'ANOMALY_DETECTED' : createdAsset.status === 'WARNING' ? 'WARNING' : 'NORMAL',
        lastSync: new Date(),
      },
    });

    // Create Initial Failure Prediction Record
    await prisma.failurePrediction.create({
      data: {
        assetId: createdAsset.id,
        failureProbability: failureRiskObj.failureProbability,
        riskLevel: failureRiskObj.riskLevel,
        estimatedMaintenanceWindow: failureRiskObj.estimatedMaintenanceWindow,
        recommendation: failureRiskObj.recommendation,
        factors: JSON.stringify(failureRiskObj.factors),
        timestamp: new Date(),
      },
    });

    // Create Alerts for Warning/Critical assets
    if (createdAsset.status === 'CRITICAL') {
      await prisma.alert.create({
        data: {
          assetId: createdAsset.id,
          sensorId: createdSensorRecords[0]?.id,
          type: 'CRITICAL_THRESHOLD_EXCEEDED',
          severity: 'CRITICAL',
          message: `CRITICAL hydraulic pressure and temperature threshold breached on ${createdAsset.name} (${createdAsset.assetCode})!`,
          acknowledged: false,
          resolved: false,
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
        },
      });
    } else if (createdAsset.status === 'WARNING') {
      await prisma.alert.create({
        data: {
          assetId: createdAsset.id,
          sensorId: createdSensorRecords[0]?.id,
          type: 'WARNING_THRESHOLD_EXCEEDED',
          severity: 'WARNING',
          message: `Elevated winding temperature (77.4°C) detected on ${createdAsset.name}`,
          acknowledged: true,
          acknowledgedAt: new Date(Date.now() - 60 * 60 * 1000),
          acknowledgedBy: 'Marcus Brody',
          resolved: false,
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
      });
    }

    // Create Maintenance Records (Historical Completed, Active In Progress, Scheduled, Overdue)
    if (createdAsset.assetCode === 'PRS-009') {
      // Urgent scheduled maintenance for failing press
      await prisma.maintenance.create({
        data: {
          assetId: createdAsset.id,
          title: 'Emergency Cylinder Seal Replacement & Servo Recalibration',
          description: 'High pressure spike and vibration degradation requires urgent hydraulic seal teardown.',
          priority: 'URGENT',
          status: 'SCHEDULED',
          scheduledDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
          assignedToId: technician.id,
          cost: 1450.0,
          notes: 'Prepare high-pressure nitrile O-ring kit and 500-ton torque wrenches.',
        },
      });
    } else if (createdAsset.assetCode === 'MTR-003') {
      await prisma.maintenance.create({
        data: {
          assetId: createdAsset.id,
          title: 'Bearing Lubrication and Thermal Inspection',
          description: 'Re-pack non-drive end ball bearings with synthetic high-temp polyurea grease.',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          scheduledDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
          assignedToId: technician.id,
          cost: 320.0,
          notes: 'Currently in bay dismantling fan cowl.',
        },
      });
    } else if (createdAsset.assetCode === 'PUMP-001') {
      // Completed past maintenance
      await prisma.maintenance.create({
        data: {
          assetId: createdAsset.id,
          title: 'Quarterly Impeller Clearance & Dynamic Balancing',
          description: 'Routine 4,000-hour mechanical inspection and casing wear-ring inspection.',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          scheduledDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
          completedDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
          assignedToId: technician.id,
          cost: 680.0,
          notes: 'Clearance verified within 0.25mm. Mechanical seal replaced with silicon carbide variant.',
          replacedComponents: JSON.stringify(['Mechanical Carbon Seal', 'Wear Ring Gaskets']),
        },
      });
    } else if (createdAsset.assetCode === 'BLR-007') {
      // Overdue routine inspection
      await prisma.maintenance.create({
        data: {
          assetId: createdAsset.id,
          title: 'Annual Flue Gas Emissions & Safety Relief Valve Pop Test',
          description: 'Mandatory statutory safety valve recertification and combustion efficiency tune-up.',
          priority: 'HIGH',
          status: 'OVERDUE',
          scheduledDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          assignedToId: technician.id,
          cost: 950.0,
          notes: 'Technician was re-assigned to press emergency.',
        },
      });
    }
  }

  // Seed default System Settings
  const defaultSettings = [
    { key: 'simulation_interval_ms', value: '3000', description: 'IoT sensor simulator broadcast frequency (ms)' },
    { key: 'simulation_enabled', value: 'true', description: 'Global telemetry simulator state' },
    { key: 'alert_sound_enabled', value: 'true', description: 'Audible alert chime on critical anomalies' },
    { key: 'dark_theme_contrast', value: 'high', description: 'Industrial UI color palette mode' },
    { key: 'auto_overdue_detection', value: 'true', description: 'Automatically flag overdue maintenance tasks' },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.create({ data: s });
  }

  // Seed Initial Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'System',
      details: JSON.stringify({ message: 'DTAM Enterprise Digital Twin Platform initialized with demo assets and sensors.' }),
      ipAddress: '127.0.0.1',
    },
  });

  console.log('🎉 Seeding successfully completed! 10 assets, 42 sensors, and rich telemetry history populated.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
