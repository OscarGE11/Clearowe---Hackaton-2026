import { IsString, MinLength } from 'class-validator';

export class AddParticipantDto {
  @IsString()
  @MinLength(2)
  name: string;
}
