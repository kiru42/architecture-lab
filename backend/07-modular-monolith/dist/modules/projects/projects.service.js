"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const projects_repository_1 = require("./projects.repository");
let ProjectsService = class ProjectsService {
    constructor(projectsRepository) {
        this.projectsRepository = projectsRepository;
    }
    async listByUser(userId) {
        return this.projectsRepository.findByUserId(userId);
    }
    async create(userId, name) {
        return this.projectsRepository.create({ name, userId });
    }
    async update(id, userId, data) {
        const project = await this.projectsRepository.findById(id);
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return this.projectsRepository.update(id, data);
    }
    async findByIdForUser(id, userId) {
        const project = await this.projectsRepository.findById(id);
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return project;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [projects_repository_1.ProjectsRepository])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map