// Store for zones to persist data between sessions in the absence of a backend
export type Zone = {
  zone_id: string;
  name: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string; // Primary village for summary
  villages?: Array<{ id: number; name: string; sector: string; cell: string }>; // Full list of villages
  pointCount: number;
  health: number;
  status: string;
  notes?: string;
};

const STORAGE_KEY = "wars_zones_data";

const DEFAULT_ZONES: Zone[] = [
  { zone_id: "zone-a", name: "Nyamata Center", province: "Eastern Province", district: "Bugesera", sector: "Nyamata", cell: "Biryogo", village: "Akabahizi", villages: [{id: 1, name: "Akabahizi", sector: "Nyamata", cell: "Biryogo"}], pointCount: 12, health: 98, status: "stable", notes: "Main distribution hub for Nyamata sector." },
  { zone_id: "zone-b", name: "Kabeza Bypass", province: "Eastern Province", district: "Bugesera", sector: "Kabeza", cell: "Kabeza I", village: "Rugarama", villages: [{id: 2, name: "Rugarama", sector: "Kabeza", cell: "Kabeza I"}], pointCount: 8, health: 100, status: "stable" },
  { zone_id: "zone-c", name: "Nyarutarama North", province: "Eastern Province", district: "Gasabo", sector: "Nyarutarama", cell: "Akabeza", village: "Isange", villages: [{id: 3, name: "Isange", sector: "Nyarutarama", cell: "Akabeza"}], pointCount: 15, health: 75, status: "warning", notes: "Experiencing flow anomalies at 3 water points." },
];

export const zoneStore = {
  getAll(): Zone[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      this.saveAll(DEFAULT_ZONES);
      return DEFAULT_ZONES;
    }
    return JSON.parse(data);
  },

  getById(id: string): Zone | undefined {
    return this.getAll().find(z => z.zone_id === id);
  },

  saveAll(zones: Zone[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
  },

  add(zone: Omit<Zone, "zone_id" | "pointCount" | "health" | "status">) {
    const zones = this.getAll();
    const newZone: Zone = {
      ...zone,
      zone_id: `zone-${Date.now()}`,
      pointCount: 0,
      health: 100,
      status: "stable"
    };
    this.saveAll([...zones, newZone]);
    return newZone;
  },

  update(id: string, updates: Partial<Zone>) {
    const zones = this.getAll();
    const updatedZones = zones.map(z => z.zone_id === id ? { ...z, ...updates } : z);
    this.saveAll(updatedZones);
  },

  delete(id: string) {
    const zones = this.getAll();
    this.saveAll(zones.filter(z => z.zone_id !== id));
  }
};
