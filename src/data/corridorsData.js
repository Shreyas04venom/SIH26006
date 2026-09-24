// Master Geographic & Telematics Dataset for Indian Highway Logistics Corridors

export const CORRIDOR_SOURCES = [
  {
    id: "paradip",
    name: "Paradip Port Bulk Jetty Berth MCH-02",
    shortName: "Paradip Port",
    state: "Odisha",
    country: "India",
    lat: 20.2982,
    lon: 86.6710,
    berth: "Berth MCH-02 Bulk Silos",
    gate: "In-Gate Weighbridge #3",
    defaultDestId: "angul",
    defaultHighway: "NH-53 Heavy Industrial Corridor",
    platePrefix: "OD-05",
    flag: "🇮🇳"
  },
  {
    id: "visakhapatnam",
    name: "Visakhapatnam Outer Harbor Coal Berth #4",
    shortName: "Visakhapatnam Port",
    state: "Andhra Pradesh",
    country: "India",
    lat: 17.6868,
    lon: 83.2185,
    berth: "Outer Harbor Deep Bulk Berth #4",
    gate: "Sea Horse Gate Weighbridge #1",
    defaultDestId: "vizag_steel",
    defaultHighway: "NH-16 Coastal Logistics Corridor",
    platePrefix: "AP-31",
    flag: "🇮🇳"
  },
  {
    id: "haldia",
    name: "Haldia Dock Complex Bulk Berth 4A",
    shortName: "Haldia Dock",
    state: "West Bengal",
    country: "India",
    lat: 22.0232,
    lon: 88.0645,
    berth: "Berth 4A Mechanized Coal Jetty",
    gate: "Haldia North Gate Scale #2",
    defaultDestId: "durgapur",
    defaultHighway: "NH-116 / NH-19 Eastern Freight Corridor",
    platePrefix: "WB-29",
    flag: "🇮🇳"
  },
  {
    id: "dhamra",
    name: "Dhamra Port Deepwater Coal Terminal #1",
    shortName: "Dhamra Port",
    state: "Odisha",
    country: "India",
    lat: 20.8145,
    lon: 86.9634,
    berth: "Deepwater Capesize Bulk Berth #1",
    gate: "Dhamra In-Gate Weighbridge Post",
    defaultDestId: "kalinganagar",
    defaultHighway: "Dhamra-Jamujhadi / NH-16 Expressway",
    platePrefix: "OD-22",
    flag: "🇮🇳"
  },
  {
    id: "krishnapatnam",
    name: "Krishnapatnam Port Coal Terminal Berth #2",
    shortName: "Krishnapatnam Port",
    state: "Andhra Pradesh",
    country: "India",
    lat: 14.2541,
    lon: 80.1245,
    berth: "Capesize Bulk Berth #2",
    gate: "KPCL Smart Weighbridge Terminal",
    defaultDestId: "ballari",
    defaultHighway: "NH-67 Deccan Mineral Corridor",
    platePrefix: "AP-26",
    flag: "🇮🇳"
  },
  {
    id: "chennai",
    name: "Chennai Port Jawahar Dock Bulk Jetty",
    shortName: "Chennai Port",
    state: "Tamil Nadu",
    country: "India",
    lat: 13.0827,
    lon: 80.2707,
    berth: "Jawahar Dock Coal & Ore Berth #3",
    gate: "Gate 1 Zero Point Weighbridge",
    defaultDestId: "sricity",
    defaultHighway: "NH-16 Northern Express Corridor",
    platePrefix: "TN-04",
    flag: "🇮🇳"
  },
  {
    id: "gangavaram",
    name: "Gangavaram Super Capesize Coal Berth #1",
    shortName: "Gangavaram Port",
    state: "Andhra Pradesh",
    country: "India",
    lat: 17.6214,
    lon: 83.2369,
    berth: "Super Capesize Bulk Berth #1",
    gate: "Gangavaram Gate Scale #4",
    defaultDestId: "raipur",
    defaultHighway: "NH-26 / AH-45 Trans-Deccan Corridor",
    platePrefix: "AP-32",
    flag: "🇮🇳"
  },
  {
    id: "kamarajar",
    name: "Kamarajar Port Bulk Coal Terminal CB-01",
    shortName: "Kamarajar (Ennore)",
    state: "Tamil Nadu",
    country: "India",
    lat: 13.2592,
    lon: 80.3344,
    berth: "Coal Berth CB-01 Mechanized",
    gate: "North Gate Computerized Scale",
    defaultDestId: "nctps",
    defaultHighway: "Ennore Port Access / Minjur Highway",
    platePrefix: "TN-18",
    flag: "🇮🇳"
  },
  {
    id: "kakinada",
    name: "Kakinada Deepwater Coal Berth #3",
    shortName: "Kakinada Port",
    state: "Andhra Pradesh",
    country: "India",
    lat: 16.9891,
    lon: 82.2789,
    berth: "Deepwater Bulk Berth #3",
    gate: "Kakinada In-Gate Weighbridge Post",
    defaultDestId: "rajahmundry",
    defaultHighway: "ADB Road / NH-216 Freight Corridor",
    platePrefix: "AP-05",
    flag: "🇮🇳"
  },
  {
    id: "gopalpur",
    name: "Gopalpur Port Bulk Jetty Berth #1",
    shortName: "Gopalpur Port",
    state: "Odisha",
    country: "India",
    lat: 19.2612,
    lon: 84.9084,
    berth: "Bulk Quay Berth #1",
    gate: "Gopalpur Port Outer Weighbridge",
    defaultDestId: "gopalpur_sez",
    defaultHighway: "NH-516A Port Link Expressway",
    platePrefix: "OD-07",
    flag: "🇮🇳"
  },
  {
    id: "kolkata",
    name: "Kolkata Port Kidderpore Netaji Subhas Dock",
    shortName: "Kolkata Port (SMP)",
    state: "West Bengal",
    country: "India",
    lat: 22.5726,
    lon: 88.3639,
    berth: "NSD Bulk Discharge Berth #5",
    gate: "Hyde Road Coal In-Gate Scale",
    defaultDestId: "howrah",
    defaultHighway: "Vidyasagar Setu / Kona Heavy Route",
    platePrefix: "WB-02",
    flag: "🇮🇳"
  },
  {
    id: "tuticorin",
    name: "VOC Port Tuticorin North Cargo Berth #2",
    shortName: "VOC Port (Tuticorin)",
    state: "Tamil Nadu",
    country: "India",
    lat: 8.7642,
    lon: 78.1348,
    berth: "North Cargo Berth NCB-II",
    gate: "Green Gate Automatic Weighbridge",
    defaultDestId: "madurai",
    defaultHighway: "NH-38 Southern Industrial Corridor",
    platePrefix: "TN-69",
    flag: "🇮🇳"
  },
  {
    id: "hunter_valley",
    name: "Hunter Valley Mine Siding #4",
    shortName: "Hunter Valley Mine",
    state: "NSW",
    country: "Australia",
    lat: -32.4820,
    lon: 151.0520,
    berth: "Coal Pithead Loading Silo #4",
    gate: "Hunter Valley Out-Gate Scale",
    defaultDestId: "newcastle_port",
    defaultHighway: "M15 Hunter Expressway Corridor",
    platePrefix: "NSW-48",
    flag: "🇦🇺"
  }
];

export const CORRIDOR_DESTINATIONS = [
  {
    id: "angul",
    name: "Angul Integrated Steel Complex (WH-07)",
    shortName: "Angul Steel Works",
    state: "Odisha",
    country: "India",
    lat: 20.8402,
    lon: 85.1404,
    type: "STEEL_PLANT",
    defaultSourceId: "paradip",
    desc: "Consignee Raw Material Unloading Hoppers & Blast Furnace"
  },
  {
    id: "vizag_steel",
    name: "Vizag Steel & Energy Plant (RINL Kurmannapalem)",
    shortName: "Vizag Steel (RINL)",
    state: "Andhra Pradesh",
    country: "India",
    lat: 17.6320,
    lon: 83.1550,
    type: "STEEL_PLANT",
    defaultSourceId: "visakhapatnam",
    desc: "Blast Furnace Raw Material Silos & Thermal Captive Plant"
  },
  {
    id: "durgapur",
    name: "Durgapur Steel Hub (DSP Central Works)",
    shortName: "Durgapur Steel Hub",
    state: "West Bengal",
    country: "India",
    lat: 23.5204,
    lon: 87.3119,
    type: "STEEL_PLANT",
    defaultSourceId: "haldia",
    desc: "SAIL Durgapur Raw Material Stockyard & Sinter Plant"
  },
  {
    id: "kalinganagar",
    name: "Kalinganagar Industrial Hub (Tata Steel KPO)",
    shortName: "Kalinganagar Hub",
    state: "Odisha",
    country: "India",
    lat: 20.9500,
    lon: 86.0200,
    type: "STEEL_PLANT",
    defaultSourceId: "dhamra",
    desc: "Tata Steel Phase II High-Speed Rotary Tipplers"
  },
  {
    id: "ballari",
    name: "Ballari Metal Siding (JSW Vijayanagar Works)",
    shortName: "Ballari Metal Siding",
    state: "Karnataka / AP",
    country: "India",
    lat: 15.1850,
    lon: 76.6720,
    type: "STEEL_PLANT",
    defaultSourceId: "krishnapatnam",
    desc: "Toranagallu Mega Steel Works Wagon & Truck Unloading Hoppers"
  },
  {
    id: "sricity",
    name: "Sri City Integrated Industrial Zone",
    shortName: "Sri City Zone",
    state: "AP / TN Border",
    country: "India",
    lat: 13.5270,
    lon: 80.0380,
    type: "MANUFACTURING",
    defaultSourceId: "chennai",
    desc: "Multi-Product Industrial Zone & High-Tech Manufacturing"
  },
  {
    id: "raipur",
    name: "Raipur Sponge Iron & Pellet Complex",
    shortName: "Raipur Sponge Iron",
    state: "Chhattisgarh",
    country: "India",
    lat: 21.2514,
    lon: 81.6296,
    type: "SPONGE_IRON",
    defaultSourceId: "gangavaram",
    desc: "Urla & Siltara Heavy Industrial Belt Direct Reduction Furnaces"
  },
  {
    id: "nctps",
    name: "North Chennai Thermal Power Station (NCTPS)",
    shortName: "NCTPS Power Plant",
    state: "Tamil Nadu",
    country: "India",
    lat: 13.2030,
    lon: 80.3150,
    type: "THERMAL_POWER",
    defaultSourceId: "kamarajar",
    desc: "TANGEDCO Coal Stockpile & Continuous Feeder Conveyor"
  },
  {
    id: "rajahmundry",
    name: "Rajahmundry Industrial Belt (Paper & Power)",
    shortName: "Rajahmundry Belt",
    state: "Andhra Pradesh",
    country: "India",
    lat: 17.0005,
    lon: 81.8040,
    type: "MANUFACTURING",
    defaultSourceId: "kakinada",
    desc: "Godavari Basin Industrial Hub & Gas/Coal Thermal Units"
  },
  {
    id: "gopalpur_sez",
    name: "Tata Steel SEZ Gopalpur Complex",
    shortName: "Tata Steel SEZ",
    state: "Odisha",
    country: "India",
    lat: 19.3100,
    lon: 84.9200,
    type: "STEEL_PLANT",
    defaultSourceId: "gopalpur",
    desc: "Special Economic Zone Heavy Industrial Park & Ferroalloys"
  },
  {
    id: "howrah",
    name: "Howrah Heavy Foundry & Rail Feeder Siding",
    shortName: "Howrah Heavy Foundry",
    state: "West Bengal",
    country: "India",
    lat: 22.5958,
    lon: 88.2636,
    type: "MANUFACTURING",
    defaultSourceId: "kolkata",
    desc: "Foundry Park & Industrial Raw Material Consolidation Depot"
  },
  {
    id: "madurai",
    name: "Madurai Logistics Park & Spinning Mills",
    shortName: "Madurai Logistics Hub",
    state: "Tamil Nadu",
    country: "India",
    lat: 9.9252,
    lon: 78.1198,
    type: "LOGISTICS_PARK",
    defaultSourceId: "tuticorin",
    desc: "Inland Freight Station & Industrial Manufacturing Park"
  },
  {
    id: "newcastle_port",
    name: "Newcastle Port Jetty Berth #2",
    shortName: "Newcastle Port",
    state: "NSW",
    country: "Australia",
    lat: -32.9280,
    lon: 151.7810,
    type: "PORT",
    defaultSourceId: "hunter_valley",
    desc: "NCIG Bulk Conveyor Terminal & Deepwater Export Jetty"
  }
];

// Popular Predefined Corridors with rich authentic Indian Waypoints
export const PREDEFINED_CORRIDORS = {
  "paradip_angul": {
    highway: "NH-53 HEAVY INDUSTRIAL CORRIDOR",
    distanceKm: 182,
    durationHours: 3.6,
    tollCount: 2,
    waypoints: [
      { id: "wp-origin", name: "Paradip Port Bulk Jetty Berth MCH-02", type: "PORT", lat: 20.2982, lon: 86.6710, desc: "Direct Vessel Discharge Silos", km: 0 },
      { id: "wp-gate", name: "Paradip Port In-Gate Weighbridge #3", type: "WEIGHBRIDGE", lat: 20.3120, lon: 86.6450, desc: "NABL Gross/Tare Digital Scale", km: 4 },
      { id: "wp-marshaghai", name: "Marshaghai FASTag Toll Plaza (KM 32)", type: "TOLL", lat: 20.4385, lon: 86.4320, desc: "NH-53 Automatic 6-Lane Barrier", km: 32 },
      { id: "wp-kendrapara", name: "Kendrapara Bypass Junction", type: "JUNCTION", lat: 20.5010, lon: 86.4180, desc: "Industrial Corridor Intersection", km: 48 },
      { id: "wp-cuttack", name: "Cuttack Mahanadi Bypass Bridge", type: "BRIDGE", lat: 20.5300, lon: 85.9100, desc: "Heavy Vehicle Crossing", km: 92 },
      { id: "wp-manguli", name: "Manguli NH-16/NH-53 Interchange", type: "JUNCTION", lat: 20.5620, lon: 85.9080, desc: "NHAI National Highway Node", km: 98 },
      { id: "wp-chaudwar", name: "Chaudwar FASTag Toll Plaza (KM 105)", type: "TOLL", lat: 20.5780, lon: 85.8750, desc: "NH-53 Dedicated Multi-Axle Lanes", km: 105 },
      { id: "wp-dhenkanal", name: "Dhenkanal Industrial Bypass", type: "CHECKPOST", lat: 20.6580, lon: 85.6020, desc: "Commercial Tax Checkpost & Telematics", km: 134 },
      { id: "wp-hindol", name: "Hindol Road Industrial Junction", type: "JUNCTION", lat: 20.7320, lon: 85.3850, desc: "Coal Link Highway Node", km: 156 },
      { id: "wp-banarpal", name: "Banarpal Siding Checkpoint (KM 172)", type: "CHECKPOST", lat: 20.8010, lon: 85.1950, desc: "Steel Plant Outer In-Gate", km: 172 },
      { id: "wp-dest", name: "Angul Integrated Steel Complex (WH-07)", type: "PLANT", lat: 20.8402, lon: 85.1404, desc: "Consignee Unloading Hoppers & Blast Furnace", km: 182 }
    ]
  },

  "visakhapatnam_vizag_steel": {
    highway: "NH-16 COASTAL LOGISTICS CORRIDOR",
    distanceKm: 28,
    durationHours: 0.8,
    tollCount: 1,
    waypoints: [
      { id: "wp-v-origin", name: "Visakhapatnam Outer Harbor Coal Berth #4", type: "PORT", lat: 17.6868, lon: 83.2185, desc: "Deep Berth Vessel Discharge Conveyors", km: 0 },
      { id: "wp-v-gate", name: "Sea Horse Gate Weighbridge Scale #1", type: "WEIGHBRIDGE", lat: 17.6800, lon: 83.2050, desc: "Port Gate Gross/Tare 100T Scale", km: 3 },
      { id: "wp-v-scindia", name: "Scindia Flyover Highway Link", type: "BRIDGE", lat: 17.6650, lon: 83.1900, desc: "Dedicated Heavy Freight Elevated Corrdior", km: 7 },
      { id: "wp-v-convent", name: "Convent Junction NH-16 Node", type: "JUNCTION", lat: 17.6580, lon: 83.1780, desc: "Port Access Road to Golden Quadrilateral", km: 11 },
      { id: "wp-v-toll", name: "Aganampudi FASTag Toll Plaza", type: "TOLL", lat: 17.6480, lon: 83.1650, desc: "NHAI Automatic RFID FASTag Lane", km: 18 },
      { id: "wp-v-kurmanna", name: "Kurmannapalem Steel Plant Bypass", type: "CHECKPOST", lat: 17.6390, lon: 83.1600, desc: "Industrial Security Inspection Post", km: 23 },
      { id: "wp-v-dest", name: "Vizag Steel & Energy Plant (RINL)", type: "PLANT", lat: 17.6320, lon: 83.1550, desc: "Blast Furnace Raw Material Wagon Silos", km: 28 }
    ]
  },

  "haldia_durgapur": {
    highway: "NH-116 / NH-19 EASTERN INDUSTRIAL CORRIDOR",
    distanceKm: 245,
    durationHours: 4.8,
    tollCount: 3,
    waypoints: [
      { id: "wp-h-origin", name: "Haldia Dock Complex Bulk Berth 4A", type: "PORT", lat: 22.0232, lon: 88.0645, desc: "Bulk Coal Jetty & Stacker-Reclaimer", km: 0 },
      { id: "wp-h-gate", name: "Haldia North Gate Weighbridge Scale #2", type: "WEIGHBRIDGE", lat: 22.0510, lon: 88.0420, desc: "Computerized Tare & Gross Scale", km: 5 },
      { id: "wp-h-mecheda", name: "Mecheda FASTag Toll Plaza (KM 58)", type: "TOLL", lat: 22.4280, lon: 87.8540, desc: "NH-116 Dedicated FASTag Barrier Lane", km: 58 },
      { id: "wp-h-kolaghat", name: "Kolaghat Rupnarayan Heavy Bridge", type: "BRIDGE", lat: 22.4380, lon: 87.8680, desc: "Four-Lane Heavy Haul River Bridge", km: 64 },
      { id: "wp-h-dankuni", name: "Dankuni Freight Interchange Node", type: "JUNCTION", lat: 22.6850, lon: 88.2910, desc: "Eastern Dedicated Freight Corridor Link", km: 110 },
      { id: "wp-h-palsit", name: "Palsit FASTag Toll Plaza (KM 162)", type: "TOLL", lat: 23.1250, lon: 88.0120, desc: "NH-19 High Speed Automatic FASTag", km: 162 },
      { id: "wp-h-burdwan", name: "Burdwan Industrial Bypass Junction", type: "JUNCTION", lat: 23.2420, lon: 87.8650, desc: "Heavy Vehicle Bypass Interchange", km: 184 },
      { id: "wp-h-panagarh", name: "Panagarh Heavy Freight Checkpost", type: "CHECKPOST", lat: 23.4480, lon: 87.4520, desc: "Commercial Tax & Axle Load Inspection", km: 226 },
      { id: "wp-h-dest", name: "Durgapur Steel Hub (DSP Central Works)", type: "PLANT", lat: 23.5204, lon: 87.3119, desc: "SAIL Raw Material Stockyard & Sinter Plant", km: 245 }
    ]
  },

  "dhamra_kalinganagar": {
    highway: "DHAMRA-JAMUJHADI / NH-16 EXPRESSWAY",
    distanceKm: 135,
    durationHours: 2.8,
    tollCount: 2,
    waypoints: [
      { id: "wp-dh-origin", name: "Dhamra Port Deepwater Coal Terminal #1", type: "PORT", lat: 20.8145, lon: 86.9634, desc: "Capesize Bulk Discharge Jetty", km: 0 },
      { id: "wp-dh-gate", name: "Dhamra Security In-Gate Weighbridge Post", type: "WEIGHBRIDGE", lat: 20.8350, lon: 86.9240, desc: "RFID Electronic Gross/Tare Scale", km: 6 },
      { id: "wp-dh-jamujhadi", name: "Jamujhadi NH-16 Highway Junction", type: "JUNCTION", lat: 21.0500, lon: 86.6800, desc: "Port Feeder Link to Golden Quadrilateral", km: 45 },
      { id: "wp-dh-bhadrak", name: "Bhadrak FASTag Toll Plaza (KM 64)", type: "TOLL", lat: 21.0850, lon: 86.5120, desc: "NHAI Automatic Heavy Vehicle Barrier", km: 64 },
      { id: "wp-dh-panikoili", name: "Panikoili NH-16 / NH-20 Interchange", type: "JUNCTION", lat: 20.9580, lon: 86.2050, desc: "Industrial Siding Highway Node", km: 102 },
      { id: "wp-dh-duburi", name: "Duburi Steel Link Toll Barrier", type: "TOLL", lat: 20.9420, lon: 86.0850, desc: "Kalinganagar Dedicated Industrial Toll", km: 122 },
      { id: "wp-dh-dest", name: "Kalinganagar Industrial Hub (Tata Steel KPO)", type: "PLANT", lat: 20.9500, lon: 86.0200, desc: "Rotary Tippler Hopper Unloading Bay", km: 135 }
    ]
  },

  "krishnapatnam_ballari": {
    highway: "NH-67 DECCAN MINERAL CORRIDOR",
    distanceKm: 395,
    durationHours: 7.2,
    tollCount: 3,
    waypoints: [
      { id: "wp-k-origin", name: "Krishnapatnam Port Coal Berth #2", type: "PORT", lat: 14.2541, lon: 80.1245, desc: "Capesize Rapid Discharge Conveyors", km: 0 },
      { id: "wp-k-gate", name: "KPCL Smart Weighbridge Terminal", type: "WEIGHBRIDGE", lat: 14.2850, lon: 80.0820, desc: "NABL 120T Computerized Gross Scale", km: 6 },
      { id: "wp-k-muthukur", name: "Muthukur Port Access Expressway", type: "JUNCTION", lat: 14.3320, lon: 80.0210, desc: "Heavy Vehicle Freight Link", km: 18 },
      { id: "wp-k-venkat", name: "Venkatachalam NH-16 Junction", type: "JUNCTION", lat: 14.3210, lon: 79.9250, desc: "Golden Quadrilateral Crossing", km: 32 },
      { id: "wp-k-nellore", name: "Nellore South FASTag Toll Plaza", type: "TOLL", lat: 14.3680, lon: 79.8240, desc: "NHAI Automatic RFID FASTag Lane", km: 48 },
      { id: "wp-k-badvel", name: "Badvel NH-67 Highway Toll Plaza", type: "TOLL", lat: 14.7450, lon: 79.0520, desc: "Heavy Mineral Haul FASTag Corridor", km: 165 },
      { id: "wp-k-kadapa", name: "Kadapa Ring Road Heavy Checkpost", type: "CHECKPOST", lat: 14.4980, lon: 78.8450, desc: "Commercial Tax & Axle Load Node", km: 198 },
      { id: "wp-k-gooty", name: "Gooty National Highway Interchange", type: "JUNCTION", lat: 15.1120, lon: 77.6320, desc: "NH-44 / NH-67 Major Highway Crossing", km: 320 },
      { id: "wp-k-dest", name: "Ballari Metal Siding (JSW Toranagallu)", type: "PLANT", lat: 15.1850, lon: 76.6720, desc: "Mega Steel Works Hopper & Tippler Intake", km: 395 }
    ]
  },

  "chennai_sricity": {
    highway: "NH-16 NORTHERN INDUSTRIAL EXPRESSWAY",
    distanceKm: 72,
    durationHours: 1.8,
    tollCount: 2,
    waypoints: [
      { id: "wp-c-origin", name: "Chennai Port Jawahar Dock Bulk Jetty", type: "PORT", lat: 13.0827, lon: 80.2707, desc: "Bulk Coal & Minerals Berth #3", km: 0 },
      { id: "wp-c-gate", name: "Gate 1 Zero Point Weighbridge Post", type: "WEIGHBRIDGE", lat: 13.0950, lon: 80.2810, desc: "Port Outer Gate Gross/Tare Scale", km: 3 },
      { id: "wp-c-elevated", name: "Port Elevated Freight Corridor", type: "BRIDGE", lat: 13.1250, lon: 80.2520, desc: "Dedicated Port Heavy Vehicle Flyover", km: 9 },
      { id: "wp-c-madhavaram", name: "Madhavaram Heavy Vehicle Roundabout", type: "JUNCTION", lat: 13.1480, lon: 80.2180, desc: "NH-16 Northbound Highway Ramp", km: 16 },
      { id: "wp-c-toll1", name: "Karanodai FASTag Toll Plaza (KM 32)", type: "TOLL", lat: 13.2650, lon: 80.1450, desc: "NHAI Automatic RFID Toll Lane", km: 32 },
      { id: "wp-c-checkpost", name: "Tada Border Commercial Checkpost", type: "CHECKPOST", lat: 13.4850, lon: 80.0520, desc: "TN-AP State Border Telematics Node", km: 62 },
      { id: "wp-c-dest", name: "Sri City Integrated Industrial Zone", type: "PLANT", lat: 13.5270, lon: 80.0380, desc: "Multi-Product Manufacturing In-Gate Siding", km: 72 }
    ]
  },

  "hunter_valley_newcastle_port": {
    highway: "M15 HUNTER EXPRESSWAY CORRIDOR",
    distanceKm: 120,
    durationHours: 2.1,
    tollCount: 1,
    waypoints: [
      { id: "wp-fm-mine", name: "Hunter Valley Mine Siding #4", type: "MINE", lat: -32.4820, lon: 151.0520, desc: "Coal Pithead Loading Silo", km: 0 },
      { id: "wp-fm-singleton", name: "Singleton Bypass Checkpoint", type: "CHECKPOST", lat: -32.5640, lon: 151.1780, desc: "NHVR Heavy Vehicle Scale", km: 24 },
      { id: "wp-fm-branxton", name: "Branxton Hunter Expressway Interchange", type: "JUNCTION", lat: -32.6510, lon: 151.3520, desc: "M15 Highway Access Ramp", km: 46 },
      { id: "wp-fm-kurri", name: "Kurri Kurri Highway Checkpoint", type: "CHECKPOST", lat: -32.8120, lon: 151.4880, desc: "Expressway Telematics Node", km: 74 },
      { id: "wp-fm-hexham", name: "Hexham Coal Siding", type: "JUNCTION", lat: -32.8350, lon: 151.6850, desc: "Rail/Road Feeder Link", km: 98 },
      { id: "wp-fm-port", name: "Newcastle Port Jetty Berth #2", type: "PORT", lat: -32.9280, lon: 151.7810, desc: "NCIG Bulk Conveyor Terminal", km: 120 }
    ]
  }
};

// Great-circle Haversine distance in KM
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Generate intermediate waypoints between any arbitrary source and destination
export function generateGenericWaypoints(source, dest) {
  const crowKm = calculateHaversineDistanceKm(source.lat, source.lon, dest.lat, dest.lon);
  const highwayDistanceKm = Math.round(crowKm * 1.25); // road factor
  const estHours = (highwayDistanceKm / 52).toFixed(1);

  // Intermediate point interpolator
  const interpolate = (pct) => ({
    lat: source.lat + (dest.lat - source.lat) * pct,
    lon: source.lon + (dest.lon - source.lon) * pct
  });

  const pGate = interpolate(0.04);
  const pJunction1 = interpolate(0.25);
  const pToll = interpolate(0.50);
  const pJunction2 = interpolate(0.78);
  const pCheckpost = interpolate(0.92);

  const highwayCode = source.defaultHighway || `NH-${Math.floor(Math.random() * 40 + 16)}`;

  return {
    highway: `${highwayCode} INDUSTRIAL FREIGHT CORRIDOR`,
    distanceKm: highwayDistanceKm,
    durationHours: parseFloat(estHours),
    tollCount: 2,
    waypoints: [
      {
        id: `wp-${source.id}-origin`,
        name: source.name,
        type: source.id === "hunter_valley" ? "MINE" : "PORT",
        lat: source.lat,
        lon: source.lon,
        desc: `${source.berth} · Loading & Discharge Silos`,
        km: 0
      },
      {
        id: `wp-${source.id}-gate`,
        name: `${source.shortName} In-Gate Weighbridge`,
        type: "WEIGHBRIDGE",
        lat: pGate.lat,
        lon: pGate.lon,
        desc: "Automated 120T Digital Weighbridge & Tare Scale",
        km: Math.round(highwayDistanceKm * 0.04)
      },
      {
        id: `wp-${source.id}-junc1`,
        name: `${source.shortName} Port Access Highway Interchange`,
        type: "JUNCTION",
        lat: pJunction1.lat,
        lon: pJunction1.lon,
        desc: "National Highway Multi-Axle Feeder Link",
        km: Math.round(highwayDistanceKm * 0.25)
      },
      {
        id: `wp-${source.id}-toll`,
        name: `${source.state} FASTag Highway Toll Plaza`,
        type: "TOLL",
        lat: pToll.lat,
        lon: pToll.lon,
        desc: "Automatic RFID FASTag Lane & Overload Scanner",
        km: Math.round(highwayDistanceKm * 0.50)
      },
      {
        id: `wp-${dest.id}-junc2`,
        name: `${dest.shortName} Highway Bypass Intersection`,
        type: "JUNCTION",
        lat: pJunction2.lat,
        lon: pJunction2.lon,
        desc: "Industrial Ring Road Junction",
        km: Math.round(highwayDistanceKm * 0.78)
      },
      {
        id: `wp-${dest.id}-checkpost`,
        name: `${dest.state} Commercial Freight Inspection Post`,
        type: "CHECKPOST",
        lat: pCheckpost.lat,
        lon: pCheckpost.lon,
        desc: "Electronic Tax Transit Verification & Telematics",
        km: Math.round(highwayDistanceKm * 0.92)
      },
      {
        id: `wp-${dest.id}-dest`,
        name: dest.name,
        type: dest.type === "PORT" ? "PORT" : "PLANT",
        lat: dest.lat,
        lon: dest.lon,
        desc: dest.desc || "Consignee Raw Material Discharge Siding",
        km: highwayDistanceKm
      }
    ]
  };
}

// Get or calculate full corridor data for any source and destination combination
export function getCorridorData(sourceId, destId) {
  const source = CORRIDOR_SOURCES.find(s => s.id === sourceId) || CORRIDOR_SOURCES[0];
  const dest = CORRIDOR_DESTINATIONS.find(d => d.id === destId) || CORRIDOR_DESTINATIONS[0];

  const key1 = `${source.id}_${dest.id}`;
  const key2 = `${dest.id}_${source.id}`;

  let corridorInfo;
  if (PREDEFINED_CORRIDORS[key1]) {
    corridorInfo = PREDEFINED_CORRIDORS[key1];
  } else if (PREDEFINED_CORRIDORS[key2]) {
    // Reverse waypoints
    const original = PREDEFINED_CORRIDORS[key2];
    corridorInfo = {
      ...original,
      waypoints: [...original.waypoints].reverse()
    };
  } else {
    corridorInfo = generateGenericWaypoints(source, dest);
  }

  // Generate realistic trucks distributed along this corridor
  const trucks = generateTrucksForCorridor(source, dest, corridorInfo.waypoints, corridorInfo.distanceKm);

  return {
    source,
    dest,
    ...corridorInfo,
    trucks
  };
}

// Generate realistic trucks distributed along the highway corridor
function generateTrucksForCorridor(source, dest, waypoints, totalDistanceKm) {
  if (!waypoints || waypoints.length < 2) return [];

  const prefix = source.platePrefix || "OD-05";
  const driverNames = [
    { name: "Ramesh Kumar", phone: "+91 98451 22801" },
    { name: "Satish Jena", phone: "+91 98451 22802" },
    { name: "Manoj Pradhan", phone: "+91 98451 22803" },
    { name: "Deepak Mohanty", phone: "+91 98451 22804" },
    { name: "Pravat Nayak", phone: "+91 98451 22805" },
    { name: "Sunil Behera", phone: "+91 98451 22806" }
  ];

  // Helper to interpolate coordinate along waypoint segments based on fraction [0, 1]
  const getPointAtFraction = (fraction) => {
    const clamped = Math.max(0, Math.min(1, fraction));
    const totalSegments = waypoints.length - 1;
    const indexFloat = clamped * totalSegments;
    const indexLow = Math.floor(indexFloat);
    const indexHigh = Math.min(totalSegments, indexLow + 1);
    const segFraction = indexFloat - indexLow;

    const p1 = waypoints[indexLow];
    const p2 = waypoints[indexHigh];

    return {
      lat: p1.lat + (p2.lat - p1.lat) * segFraction,
      lon: p1.lon + (p2.lon - p1.lon) * segFraction
    };
  };

  const truckConfigs = [
    { fraction: 0.28, status: "IN TRANSIT", speed: 52, heading: 290, delayMin: 0 },
    { fraction: 0.62, status: "IN TRANSIT", speed: 48, heading: 295, delayMin: 0 },
    { fraction: 0.85, status: "DELAYED", speed: 12, heading: 280, delayMin: 38 },
    { fraction: 0.05, status: "APPROACHING PORT", speed: 18, heading: 90, delayMin: 0 },
    { fraction: 0.98, status: "AT WAREHOUSE", speed: 0, heading: 0, delayMin: 0 }
  ];

  return truckConfigs.map((cfg, idx) => {
    const pt = getPointAtFraction(cfg.fraction);
    const driver = driverNames[idx % driverNames.length];
    const plateNum = 4820 + idx + 1;
    const distCovered = Math.round(cfg.fraction * totalDistanceKm);
    const remainingKm = Math.max(0, totalDistanceKm - distCovered);
    const etaMin = cfg.status === "AT WAREHOUSE" ? 0 : Math.round((remainingKm / (cfg.speed || 45)) * 60) + cfg.delayMin;

    return {
      id: `TRK-${prefix.replace("-", "")}-${plateNum}`,
      leg: source.id === "hunter_valley" ? "first-mile" : "last-mile",
      plate: `${prefix}-AX-${plateNum}`,
      driver: driver.name,
      phone: driver.phone,
      trailer: "40T Hydraulic Multi-Axle Tipper",
      truckModel: "Tata Signa 4825.TK (16-Wheeler, 47.5T GVW)",
      cargoQuantityMt: parseFloat((39.8 + (idx * 0.3) % 1.5).toFixed(1)),
      cargoType: "Thermal Coal",
      originPort: source.name,
      destPlant: dest.name,
      status: cfg.status,
      speedKmh: cfg.speed,
      headingDeg: cfg.heading,
      lat: parseFloat(pt.lat.toFixed(5)),
      lon: parseFloat(pt.lon.toFixed(5)),
      etaMinutes: etaMin,
      etaFormatted: cfg.status === "AT WAREHOUSE" ? "DELIVERED" : `${Math.floor(etaMin / 60)}h ${etaMin % 60}m`,
      fuelPct: 85 - idx * 4,
      gatePassId: `GP-2026-${9040 + idx + 1}`,
      routeCorridor: waypoints[0]?.name?.split(" ")[0] + " ➔ " + dest.shortName,
      plannedDistanceKm: totalDistanceKm,
      distanceCoveredKm: distCovered,
      lastUpdateSecondsAgo: 8 + idx * 3,
      trackingType: idx % 2 === 0 ? "GPS + FASTag" : "AIS-140 GPS",
      exception: cfg.status === "DELAYED" ? { type: "TRUCK_DELAY", delayMinutes: 38, note: "FASTag toll gate congestion" } : null,
      fastag: {
        tagId: `34161FA8203248${idx}`,
        issuer: "ICICI Bank FASTag",
        status: "ACTIVE"
      },
      ewb: {
        ewbNo: `2418903418${idx}1`,
        validUntil: "2026-09-28",
        consignor: `${source.shortName} Terminal Trust (GSTIN: 21AAAGP1209F1ZY)`,
        consignee: `${dest.name} (GSTIN: 21AAACT2940B1ZG)`
      }
    };
  });
}
