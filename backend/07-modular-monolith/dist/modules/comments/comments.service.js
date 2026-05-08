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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const comments_repository_1 = require("./comments.repository");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
let CommentsService = class CommentsService {
    constructor(commentsRepository, prisma) {
        this.commentsRepository = commentsRepository;
        this.prisma = prisma;
    }
    async assertTaskAccess(taskId, userId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.project.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
    }
    async listByTask(taskId, userId) {
        await this.assertTaskAccess(taskId, userId);
        return this.commentsRepository.findByTaskId(taskId);
    }
    async create(taskId, userId, content) {
        await this.assertTaskAccess(taskId, userId);
        return this.commentsRepository.create({ content, taskId, authorId: userId });
    }
    async delete(id, userId) {
        const comment = await this.commentsRepository.findById(id);
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.authorId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        await this.commentsRepository.delete(id);
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [comments_repository_1.CommentsRepository,
        prisma_service_1.PrismaService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map