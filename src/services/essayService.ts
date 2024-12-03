import { School, ParsedSchoolData } from '../types/essay';

class EssayService {
  private schools: School[] = [];
  private lastUpdate: Date | null = null;

  updateSchools(parsedData: ParsedSchoolData) {
    // Completely replace the existing schools with the new data
    this.schools = parsedData.schools;
    this.lastUpdate = new Date();
  }

  getSchools(): School[] {
    return [...this.schools]; // Return a copy to prevent external modifications
  }

  getSchoolByName(name: string): School | undefined {
    return this.schools.find(school => 
      school.name.toLowerCase() === name.toLowerCase()
    );
  }

  getLastUpdateTime(): Date | null {
    return this.lastUpdate;
  }

  searchSchools(query: string): School[] {
    const searchTerm = query.toLowerCase();
    return this.schools.filter(school => 
      school.name.toLowerCase().includes(searchTerm)
    );
  }
}

export const essayService = new EssayService();
