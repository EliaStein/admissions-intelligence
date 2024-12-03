import { School, ParsedSchoolData } from '../types/essay';

const STORAGE_KEY = 'admissions_intelligence_schools';

class EssayService {
  private schools: School[] = [];
  private lastUpdate: Date | null = null;

  constructor() {
    // Load initial data from localStorage
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const { schools, lastUpdate } = JSON.parse(storedData);
        this.schools = schools;
        this.lastUpdate = new Date(lastUpdate);
      }
    } catch (error) {
      console.error('Error loading schools from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        schools: this.schools,
        lastUpdate: this.lastUpdate
      }));
    } catch (error) {
      console.error('Error saving schools to storage:', error);
    }
  }

  updateSchools(parsedData: ParsedSchoolData) {
    this.schools = parsedData.schools;
    this.lastUpdate = new Date();
    this.saveToStorage();
  }

  getSchools(): School[] {
    return [...this.schools];
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
