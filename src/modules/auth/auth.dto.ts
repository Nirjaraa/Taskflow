import { ApiProperty } from '@nestjs/swagger';

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
