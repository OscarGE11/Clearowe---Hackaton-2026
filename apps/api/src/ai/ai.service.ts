import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Participant } from '../groups/entities/participant.entity';

export interface ParsedExpense {
  description: string;
  amount: number;
  currency: string;
  paidBy: Participant;
  participants: Participant[];
}

@Injectable()
export class AiService {
  parse(rawText: string, participants: Participant[]): ParsedExpense {
    // Extract amount: "60€", "€60", "60 euros", "60 EUR"
    const amountMatch =
      rawText.match(/(\d+(?:[.,]\d{1,2})?)\s*€/) ||
      rawText.match(/€\s*(\d+(?:[.,]\d{1,2})?)/) ||
      rawText.match(/(\d+(?:[.,]\d{1,2})?)\s*euros?/i) ||
      rawText.match(/(\d+(?:[.,]\d{1,2})?)\s*eur/i);

    if (!amountMatch) {
      throw new UnprocessableEntityException({
        field: 'amount',
        message: 'No se pudo extraer el importe del texto',
      });
    }

    const amount = parseFloat(amountMatch[1].replace(',', '.'));

    // Detect who paid
    let paidBy: Participant | undefined;
    const payPatterns = [
      /pagad[oa]\s+por\s+(\w+)/i,
      /pag[oó]\s+(\w+)/i,
      /(\w+)\s+pag[oó]/i,
      /paga\s+(\w+)/i,
      /(\w+)\s+paga/i,
      /lo\s+pag[oó]\s+(\w+)/i,
    ];

    for (const pattern of payPatterns) {
      const match = rawText.match(pattern);
      if (match) {
        paidBy = this.fuzzyFind(match[1], participants);
        if (paidBy) break;
      }
    }

    // Find all mentioned participants
    const mentioned = participants.filter((p) =>
      rawText.toLowerCase().includes(p.name.toLowerCase()),
    );

    if (mentioned.length === 0) {
      throw new UnprocessableEntityException({
        field: 'participants',
        message: 'No se encontraron participantes del grupo en el texto',
      });
    }

    // If no explicit payer found, use first mentioned participant
    if (!paidBy) paidBy = mentioned[0];

    // Build description by stripping amount and currency symbols
    const description = rawText
      .replace(/\d+(?:[.,]\d{1,2})?\s*€/g, '')
      .replace(/€\s*\d+(?:[.,]\d{1,2})?/g, '')
      .replace(/\d+(?:[.,]\d{1,2})?\s*euros?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      description: description || rawText,
      amount,
      currency: 'EUR',
      paidBy,
      participants: mentioned,
    };
  }

  private fuzzyFind(
    name: string,
    participants: Participant[],
  ): Participant | undefined {
    const lower = name.toLowerCase();
    return participants.find(
      (p) =>
        p.name.toLowerCase() === lower ||
        p.name.toLowerCase().includes(lower) ||
        lower.includes(p.name.toLowerCase()),
    );
  }
}
