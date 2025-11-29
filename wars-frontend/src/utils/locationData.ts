/**
 * Rwanda Location Data
 * Hierarchical structure: Province -> District -> Sector -> Cell -> Village
 */

export interface Location {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

// Rwanda Provinces and their districts
// Note: This is a simplified structure. In production, this should be loaded from an API or comprehensive database
export const locationData = {
  'Kigali City': {
    districts: {
      'Gasabo': {
        sectors: {
          'Bumbogo': {
            cells: {
              'Bumbogo': {
                villages: ['Bumbogo', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              },
              'Gikomero': {
                villages: ['Gikomero', 'Kabeza', 'Kacyiru', 'Nyagatare', 'Rwampara']
              },
              'Gisozi': {
                villages: ['Gisozi', 'Kacyiru', 'Kagarama', 'Kimisagara', 'Nyagatare']
              },
              'Jabana': {
                villages: ['Jabana', 'Kacyiru', 'Kagarama', 'Kimisagara', 'Nyagatare']
              },
              'Jali': {
                villages: ['Jali', 'Kacyiru', 'Kagarama', 'Kimisagara', 'Nyagatare']
              }
            }
          },
          'Gatsata': {
            cells: {
              'Gatsata': {
                villages: ['Gatsata', 'Kacyiru', 'Kagarama', 'Kimisagara', 'Nyagatare']
              },
              'Jabana': {
                villages: ['Jabana', 'Kacyiru', 'Kagarama', 'Kimisagara', 'Nyagatare']
              }
            }
          },
          'Jali': {
            cells: {
              'Jali': {
                villages: ['Jali', 'Kacyiru', 'Kagarama', 'Kimisagara', 'Nyagatare']
              }
            }
          }
        }
      },
      'Kicukiro': {
        sectors: {
          'Gikondo': {
            cells: {
              'Gikondo': {
                villages: ['Gikondo', 'Kacyiru', 'Kagarama', 'Kimisagara', 'Nyagatare']
              },
              'Kagarama': {
                villages: ['Kagarama', 'Kacyiru', 'Kagarama', 'Kimisagara', 'Nyagatare']
              }
            }
          },
          'Kicukiro': {
            cells: {
              'Kicukiro': {
                villages: ['Kicukiro', 'Kacyiru', 'Kagarama', 'Kimisagara', 'Nyagatare']
              }
            }
          }
        }
      },
      'Nyarugenge': {
        sectors: {
          'Kacyiru': {
            cells: {
              'Kacyiru': {
                villages: ['Kacyiru', 'Kacyiru', 'Kagarama', 'Kimisagara', 'Nyagatare']
              },
              'Kimisagara': {
                villages: ['Kimisagara', 'Kacyiru', 'Kagarama', 'Kimisagara', 'Nyagatare']
              }
            }
          },
          'Nyamirambo': {
            cells: {
              'Nyamirambo': {
                villages: ['Nyamirambo', 'Kacyiru', 'Kagarama', 'Kimisagara', 'Nyagatare']
              }
            }
          }
        }
      }
    }
  },
  'Northern Province': {
    districts: {
      'Burera': {
        sectors: {
          'Bungwe': {
            cells: {
              'Bungwe': {
                villages: ['Bungwe', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              },
              'Butaro': {
                villages: ['Butaro', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          },
          'Butaro': {
            cells: {
              'Butaro': {
                villages: ['Butaro', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Gakenke': {
        sectors: {
          'Gakenke': {
            cells: {
              'Gakenke': {
                villages: ['Gakenke', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Gicumbi': {
        sectors: {
          'Gicumbi': {
            cells: {
              'Gicumbi': {
                villages: ['Gicumbi', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Musanze': {
        sectors: {
          'Musanze': {
            cells: {
              'Musanze': {
                villages: ['Musanze', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Rulindo': {
        sectors: {
          'Rulindo': {
            cells: {
              'Rulindo': {
                villages: ['Rulindo', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      }
    }
  },
  'Southern Province': {
    districts: {
      'Gisagara': {
        sectors: {
          'Gisagara': {
            cells: {
              'Gisagara': {
                villages: ['Gisagara', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Huye': {
        sectors: {
          'Huye': {
            cells: {
              'Huye': {
                villages: ['Huye', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Kamonyi': {
        sectors: {
          'Kamonyi': {
            cells: {
              'Kamonyi': {
                villages: ['Kamonyi', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Muhanga': {
        sectors: {
          'Muhanga': {
            cells: {
              'Muhanga': {
                villages: ['Muhanga', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Nyamagabe': {
        sectors: {
          'Nyamagabe': {
            cells: {
              'Nyamagabe': {
                villages: ['Nyamagabe', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Nyanza': {
        sectors: {
          'Nyanza': {
            cells: {
              'Nyanza': {
                villages: ['Nyanza', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Nyaruguru': {
        sectors: {
          'Nyaruguru': {
            cells: {
              'Nyaruguru': {
                villages: ['Nyaruguru', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Ruhango': {
        sectors: {
          'Ruhango': {
            cells: {
              'Ruhango': {
                villages: ['Ruhango', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      }
    }
  },
  'Eastern Province': {
    districts: {
      'Bugesera': {
        sectors: {
          'Bugesera': {
            cells: {
              'Bugesera': {
                villages: ['Bugesera', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Gatsibo': {
        sectors: {
          'Gatsibo': {
            cells: {
              'Gatsibo': {
                villages: ['Gatsibo', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Kayonza': {
        sectors: {
          'Kayonza': {
            cells: {
              'Kayonza': {
                villages: ['Kayonza', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Kirehe': {
        sectors: {
          'Kirehe': {
            cells: {
              'Kirehe': {
                villages: ['Kirehe', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Ngoma': {
        sectors: {
          'Ngoma': {
            cells: {
              'Ngoma': {
                villages: ['Ngoma', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Nyagatare': {
        sectors: {
          'Nyagatare': {
            cells: {
              'Nyagatare': {
                villages: ['Nyagatare', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Rwamagana': {
        sectors: {
          'Rwamagana': {
            cells: {
              'Rwamagana': {
                villages: ['Rwamagana', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      }
    }
  },
  'Western Province': {
    districts: {
      'Karongi': {
        sectors: {
          'Karongi': {
            cells: {
              'Karongi': {
                villages: ['Karongi', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Ngororero': {
        sectors: {
          'Ngororero': {
            cells: {
              'Ngororero': {
                villages: ['Ngororero', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Nyabihu': {
        sectors: {
          'Nyabihu': {
            cells: {
              'Nyabihu': {
                villages: ['Nyabihu', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Nyamasheke': {
        sectors: {
          'Nyamasheke': {
            cells: {
              'Nyamasheke': {
                villages: ['Nyamasheke', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Rubavu': {
        sectors: {
          'Rubavu': {
            cells: {
              'Rubavu': {
                villages: ['Rubavu', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Rusizi': {
        sectors: {
          'Rusizi': {
            cells: {
              'Rusizi': {
                villages: ['Rusizi', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      },
      'Rutsiro': {
        sectors: {
          'Rutsiro': {
            cells: {
              'Rutsiro': {
                villages: ['Rutsiro', 'Gahanga', 'Gatare', 'Kacyiru', 'Kagarama']
              }
            }
          }
        }
      }
    }
  }
};

/**
 * Get all provinces
 */
export const getProvinces = (): string[] => {
  return Object.keys(locationData);
};

/**
 * Get districts for a province
 */
export const getDistricts = (province: string): string[] => {
  if (!province) return [];
  const provinceData = locationData[province as keyof typeof locationData];
  if (!provinceData) return [];
  return Object.keys(provinceData.districts);
};

/**
 * Get sectors for a district
 */
export const getSectors = (province: string, district: string): string[] => {
  if (!province || !district) return [];
  const provinceData = locationData[province as keyof typeof locationData];
  if (!provinceData) return [];
  const districtData = (provinceData.districts as any)[district];
  if (!districtData) return [];
  return Object.keys(districtData.sectors);
};

/**
 * Get cells for a sector
 */
export const getCells = (province: string, district: string, sector: string): string[] => {
  if (!province || !district || !sector) return [];
  const provinceData = locationData[province as keyof typeof locationData];
  if (!provinceData) return [];
  const districtData = (provinceData.districts as any)[district];
  if (!districtData) return [];
  const sectorData = (districtData.sectors as any)[sector];
  if (!sectorData) return [];
  return Object.keys(sectorData.cells);
};

/**
 * Get villages for a cell
 */
export const getVillages = (province: string, district: string, sector: string, cell: string): string[] => {
  if (!province || !district || !sector || !cell) return [];
  const provinceData = locationData[province as keyof typeof locationData];
  if (!provinceData) return [];
  const districtData = (provinceData.districts as any)[district];
  if (!districtData) return [];
  const sectorData = (districtData.sectors as any)[sector];
  if (!sectorData) return [];
  const cellData = (sectorData.cells as any)[cell];
  if (!cellData) return [];
  return cellData.villages;
};

/**
 * Format location object to string
 */
export const formatLocation = (location: Location): string => {
  return `${location.village}, ${location.cell}, ${location.sector}, ${location.district}, ${location.province}`;
};

