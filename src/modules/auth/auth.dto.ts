import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
export class LoginDto {
  @ApiProperty({ example: 'nirjara@gmail.com' })
  email: string;

  @ApiProperty({ example: 'Nirjara' })
  password: string;
}

export class RegisterDto extends LoginDto {
  @ApiProperty({ example: 'Nirjara' })
  name: string;
}

export class UpdateProfileDto {
  @ApiProperty({ example: 'New Display Name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'nirjara@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'nirjara11' })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({ example: '42a230dc586c70a714972424f8d734e13717ca64f7bff0744b452a0ab63201c8' })
  @IsString()
  token: string;
}