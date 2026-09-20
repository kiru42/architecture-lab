import { Project } from './project.entity';

describe('Project Entity', () => {
  describe('create', () => {
    it('should create a project with valid name', () => {
      const project = Project.create('My Project', 'user-123');

      expect(project.name).toBe('My Project');
      expect(project.userId).toBe('user-123');
      expect(project.archived).toBe(false);
    });

    it('should throw error for empty name', () => {
      expect(() => Project.create('', 'user-123')).toThrow('Project name cannot be empty');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => Project.create('   ', 'user-123')).toThrow('Project name cannot be empty');
    });
  });

  describe('archive', () => {
    it('should mark project as archived', () => {
      const project = Project.create('My Project', 'user-123');
      const beforeUpdate = project.updatedAt;

      // Small delay to ensure updatedAt changes
      project.archive();

      expect(project.archived).toBe(true);
      expect(project.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });
  });

  describe('rename', () => {
    it('should rename project', () => {
      const project = Project.create('Old Name', 'user-123');

      project.rename('New Name');

      expect(project.name).toBe('New Name');
    });

    it('should throw error for empty name', () => {
      const project = Project.create('Old Name', 'user-123');

      expect(() => project.rename('')).toThrow('Project name cannot be empty');
    });
  });

  describe('isOwnedBy', () => {
    it('should return true for owner', () => {
      const project = Project.create('My Project', 'user-123');

      expect(project.isOwnedBy('user-123')).toBe(true);
    });

    it('should return false for non-owner', () => {
      const project = Project.create('My Project', 'user-123');

      expect(project.isOwnedBy('user-456')).toBe(false);
    });
  });
});
