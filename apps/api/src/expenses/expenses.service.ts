import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { ExpenseSplit } from './entities/expense-split.entity';
import { Participant } from '../groups/entities/participant.entity';
import { Group } from '../groups/entities/group.entity';
import { AiService } from '../ai/ai.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense) private expensesRepo: Repository<Expense>,
    @InjectRepository(ExpenseSplit)
    private splitsRepo: Repository<ExpenseSplit>,
    @InjectRepository(Participant)
    private participantsRepo: Repository<Participant>,
    @InjectRepository(Group) private groupsRepo: Repository<Group>,
    private aiService: AiService,
  ) {}

  async create(groupId: string, dto: CreateExpenseDto) {
    const group = await this.groupsRepo.findOne({
      where: { id: groupId },
      relations: ['participants'],
    });
    if (!group) throw new NotFoundException('Grupo no encontrado');

    let description: string;
    let amount: number;
    let paidBy: Participant;
    let splitParticipants: Participant[];

    if (dto.rawText) {
      // Modo IA: parsear texto natural
      const parsed = this.aiService.parse(dto.rawText, group.participants);
      description = parsed.description;
      amount = parsed.amount;
      paidBy = parsed.paidBy;
      splitParticipants = parsed.participants;
    } else {
      // Modo manual: validar campos requeridos
      if (
        !dto.description ||
        !dto.amount ||
        !dto.paidById ||
        !dto.participantIds?.length
      ) {
        throw new BadRequestException(
          'En modo manual se requieren: description, amount, paidById, participantIds',
        );
      }

      const paidByEntity = await this.participantsRepo.findOne({
        where: { id: dto.paidById, groupId },
      });
      if (!paidByEntity)
        throw new NotFoundException('El pagador no pertenece al grupo');

      const participants = await this.participantsRepo.find({
        where: { id: In(dto.participantIds), groupId },
      });
      if (participants.length !== dto.participantIds.length) {
        throw new BadRequestException(
          'Algún participante no pertenece al grupo',
        );
      }

      description = dto.description;
      amount = dto.amount;
      paidBy = paidByEntity;
      splitParticipants = participants;
    }

    const shareAmount =
      Math.round((amount / splitParticipants.length) * 100) / 100;

    const expense = await this.expensesRepo.save(
      this.expensesRepo.create({
        groupId,
        rawText: dto.rawText,
        description,
        amount,
        currency: 'EUR',
        paidById: paidBy.id,
      }),
    );

    await this.splitsRepo.save(
      splitParticipants.map((p) =>
        this.splitsRepo.create({
          expenseId: expense.id,
          participantId: p.id,
          amount: shareAmount,
        }),
      ),
    );

    return this.expensesRepo.findOne({
      where: { id: expense.id },
      relations: ['paidBy', 'splits', 'splits.participant'],
    });
  }

  findAll(groupId: string) {
    return this.expensesRepo.find({
      where: { groupId },
      relations: ['paidBy', 'splits', 'splits.participant'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string) {
    const expense = await this.expensesRepo.findOne({ where: { id } });
    if (!expense) throw new NotFoundException('Gasto no encontrado');
    await this.expensesRepo.remove(expense);
    return { ok: true };
  }
}
