import { ConflictException, Injectable } from '@nestjs/common';
import { MemberService } from 'src/member/member.service';
import { CreateMemberDto } from 'src/member/dto/create-member.dto';

@Injectable()
export class AuthService {
  constructor(private readonly memberService: MemberService) {}
  createMember(createMemberDto: CreateMemberDto) {
    const member = this.memberService.findByEmail(createMemberDto.email);
    if (!member) throw new ConflictException('User_ID already exists.');
    return this.memberService.create(createMemberDto);
  }

  loginMember() {}
}
