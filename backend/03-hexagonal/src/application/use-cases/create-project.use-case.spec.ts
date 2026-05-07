import { CreateProjectUseCase } from './create-project.use-case';
import { ProjectRepositoryPort } from '../../ports/out/project-repository.port';
import { Project } from '../../domain/entities/project.entity';

describe('CreateProjectUseCase', () => {
  let useCase: CreateProjectUseCase;
  let mockProjectRepo: jest.Mocked<ProjectRepositoryPort>;

  beforeEach(() => {
    mockProjectRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOwnerId: jest.fn(),
      findByName: jest.fn(),
    };

    useCase = new CreateProjectUseCase(mockProjectRepo);
  });

  it('should create a project when name is unique', async () => {
    mockProjectRepo.findByName.mockResolvedValue(null);
    mockProjectRepo.create.mockImplementation((p: Project) => Promise.resolve(p));

    const command = {
      name: 'TaskFlow',
      description: 'A great app',
      ownerId: 'user1',
    };

    const result = await useCase.execute(command);

    expect(result).toBeInstanceOf(Project);
    expect(result.name).toBe('TaskFlow');
    expect(result.description).toBe('A great app');
    expect(result.ownerId).toBe('user1');
    expect(mockProjectRepo.findByName).toHaveBeenCalledWith('TaskFlow');
    expect(mockProjectRepo.create).toHaveBeenCalledTimes(1);
  });

  it('should throw ConflictException when project name already exists', async () => {
    const existingProject = Project.create('existing', 'TaskFlow', null, 'user2');
    mockProjectRepo.findByName.mockResolvedValue(existingProject);

    const command = {
      name: 'TaskFlow',
      ownerId: 'user1',
    };

    await expect(useCase.execute(command)).rejects.toThrow('Project with this name already exists');
    expect(mockProjectRepo.create).not.toHaveBeenCalled();
  });
});
