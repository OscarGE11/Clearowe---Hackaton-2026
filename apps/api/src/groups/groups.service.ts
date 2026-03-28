import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { Participant } from './entities/participant.entity';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private groupsRepo: Repository<Group>,
    @InjectRepository(Participant)
    private participantsRepo: Repository<Participant>,
  ) {}

  async create(dto: CreateGroupDto, userId: string) {
    const group = await this.groupsRepo.save(
      this.groupsRepo.create({ name: dto.name, createdById: userId }),
    );

    const participants = await this.participantsRepo.save(
      dto.participants.map((name) =>
        this.participantsRepo.create({ name, groupId: group.id }),
      ),
    );

    return { ...group, participants };
  }

  async findOne(id: string) {
    const group = await this.groupsRepo.findOne({
      where: { id },
      relations: ['participants'],
    });
    if (!group) throw new NotFoundException('Grupo no encontrado');
    return group;
  }

  async addParticipant(groupId: string, name: string) {
    await this.findOne(groupId);
    return this.participantsRepo.save(
      this.participantsRepo.create({ name, groupId }),
    );
  }
}
