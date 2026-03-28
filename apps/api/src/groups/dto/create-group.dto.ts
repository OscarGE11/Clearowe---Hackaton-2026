import { IsArray, IsString, MinLength, ArrayMinSize } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  participants: string[];
}
