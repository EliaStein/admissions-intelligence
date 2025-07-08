import { EssayPrompt } from '../types/prompt';

export interface EssayWizardProgress {
  essayType: 'personal' | 'supplemental' | null;
  currentStep: 'type' | 'school' | 'prompt' | 'essay' | 'info' | 'confirm';
  selectedSchool: string;
  selectedPrompt: EssayPrompt | null;
  essay: string;
}

const STORAGE_KEY = 'essayWizardProgress';

export const essayStorageService = {
  /**
   * Save essay wizard progress to localStorage
   */
  saveProgress(progress: Omit<EssayWizardProgress, 'savedAt'>): boolean {
    try {
      const progressWithTimestamp: EssayWizardProgress = {
        ...progress,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressWithTimestamp));
      console.log('Essay progress saved to localStorage');
      return true;
    } catch (error) {
      console.error('Error saving essay progress to localStorage:', error);
      return false;
    }
  },

  /**
   * Restore essay wizard progress from localStorage
   */
  restoreProgress(): EssayWizardProgress | null {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) {
        return null;
      }

      const parsedData = JSON.parse(savedData) as EssayWizardProgress;

      console.log('Essay progress restored from localStorage');
      return parsedData;
    } catch (error) {
      console.error('Error restoring essay progress from localStorage:', error);
      // Clear corrupted data
      this.clearProgress();
      return null;
    }
  },

  /**
   * Clear essay wizard progress from localStorage
   */
  clearProgress(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Essay progress cleared from localStorage');
      return true;
    } catch (error) {
      console.error('Error clearing essay progress from localStorage:', error);
      return false;
    }
  },

  /**
   * Check if there is saved progress in localStorage
   */
  hasProgress(): boolean {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      return savedData !== null;
    } catch (error) {
      console.error('Error checking for saved progress:', error);
      return false;
    }
  },

  /**
   * Update specific fields in saved progress without overwriting everything
   */
  updateProgress(updates: Partial<Omit<EssayWizardProgress, 'savedAt'>>): boolean {
    try {
      const currentProgress = this.restoreProgress();
      if (!currentProgress) {
        console.warn('No existing progress to update');
        return false;
      }

      const updatedProgress = {
        ...currentProgress,
        ...updates
      };

      return this.saveProgress(updatedProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  },

  /**
   * Get a summary of saved progress for display purposes
   */
  getProgressSummary(): { hasProgress: boolean; lastSaved?: string; essayType?: string; stepCount?: number } {
    try {
      const progress = this.restoreProgress();
      if (!progress) {
        return { hasProgress: false };
      }

      const stepOrder = ['type', 'school', 'prompt', 'essay', 'info', 'confirm'];
      const currentStepIndex = stepOrder.indexOf(progress.currentStep);

      return {
        hasProgress: true,
        essayType: progress.essayType || undefined,
        stepCount: currentStepIndex >= 0 ? currentStepIndex + 1 : 0
      };
    } catch (error) {
      console.error('Error getting progress summary:', error);
      return { hasProgress: false };
    }
  }
};
