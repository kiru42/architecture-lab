import { Test } from '@nestjs/testing';
import { CreateProjectUseCase } from './create-project.use-case';
import { ProjectRepository, Project } from '../../domain';

describe('CreateProjectUseCase', () => {
  let useCase: CreateProjectUseCase;
  let mockProjectRepo: jest.Mocked<ProjectRepository>;

  beforeEach(async () => {
    // Mock the repository interface (not Prisma!)
    mockProjectRepo = {
      findById: jest.fn(),
      findAllByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ProjectRepository>;

    const module = await Test.createTestingModule({
      providers: [
        CreateProjectUseCase,
        {
          provide: ProjectRepository,
          useValue: mockProjectRepo,
        },
      ],
    }).compile();

    useCase = module.get(CreateProjectUseCase);
  });

  it('should create a project', async () => {
    const savedProject = new Project(
      'proj-123',
      'My Project',
      false,
      'user-123',
      new Date(),
      new Date(),
    );
    mockProjectRepo.save.mockResolvedValue(savedProject);

    const result = await useCase.execute({
      name: 'My Project',
      userId: 'user-123',
    });

    expect(result).toEqual({
      id: 'proj-123',
      name: 'My Project',
      archived: false,
      userId: 'user-123',
      createdAt: savedProject.createdAt,
      updatedAt: savedProject.updatedAt,
    });
    expect(mockProjectRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should enforce domain validation (empty name)', async () => {
    await expect(
      useCase.execute({
        name: '',
        userId: 'user-123',
      }),
    ).rejects.toThrow('Project name cannot be empty');

    expect(mockProjectRepo.save).not.toHaveBeenCalled();
  });
});
