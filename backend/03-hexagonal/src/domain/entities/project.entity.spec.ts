import { Project } from './project.entity';

describe('Project Entity', () => {
  describe('create', () => {
    it('should create a project with valid data', () => {
      const project = Project.create('123', 'TaskFlow', 'A great app', 'user1');

      expect(project.id).toBe('123');
      expect(project.name).toBe('TaskFlow');
      expect(project.description).toBe('A great app');
      expect(project.ownerId).toBe('user1');
      expect(project.createdAt).toBeInstanceOf(Date);
      expect(project.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('isOwnedBy', () => {
    it('should return true if user is the owner', () => {
      const project = Project.create('123', 'TaskFlow', null, 'user1');
      expect(project.isOwnedBy('user1')).toBe(true);
    });

    it('should return false if user is not the owner', () => {
      const project = Project.create('123', 'TaskFlow', null, 'user1');
      expect(project.isOwnedBy('user2')).toBe(false);
    });
  });

  describe('updateInfo', () => {
    it('should update name and description', () => {
      const project = Project.create('123', 'TaskFlow', 'Old desc', 'user1');

      // Small delay to ensure different timestamp
      const updated = project.updateInfo('NewName', 'New desc');

      expect(updated.name).toBe('NewName');
      expect(updated.description).toBe('New desc');
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(project.updatedAt.getTime());
    });

    it('should preserve unchanged fields', () => {
      const project = Project.create('123', 'TaskFlow', null, 'user1');
      const updated = project.updateInfo('NewName');

      expect(updated.name).toBe('NewName');
      expect(updated.description).toBeNull();
      expect(updated.ownerId).toBe('user1');
    });
  });
});
