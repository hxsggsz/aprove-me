import { IsEmail, IsString, Length } from 'class-validator';

export class AddNewUserDTO {
  @IsString()
  @IsEmail()
  @Length(3, 140)
  login: string;

  @IsString()
  @Length(3, 140)
  password: string;
}
