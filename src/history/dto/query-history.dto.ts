import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// 세션 목록 조회
export class QuerySessionsDto {
  @IsOptional() @IsString() keyword?: string; // 키워드
  @IsOptional() @IsString() tag?: string; // 주제 태그
  @IsOptional() @Type(() => Boolean) @IsBoolean() bookmark?: boolean; // 즐겨찾기
  @IsOptional() @Type(() => Boolean) @IsBoolean() archived?: boolean; // 보관 여부
  @IsOptional() @Type(() => Boolean) @IsBoolean() success?: boolean; // 성공 여부

  @IsOptional()
  @IsIn(['score', 'lastMessageAt', 'createdAt']) // 정렬 기준
  sortBy?: 'score' | 'lastMessageAt' | 'createdAt' = 'lastMessageAt';
  @IsOptional()
  @IsIn(['asc', 'desc']) // 정렬 순서
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional() @Type(() => Number) @IsInt() @Min(0) skip?: number = 0;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 50;
}

// 특정 세션의 메시지 조회
export class QueryMessagesDto {
  @IsOptional() @IsString() from?: string; // 시작 날짜
  @IsOptional() @IsString() to?: string; // 종료 날짜
  @IsOptional() @IsString() role?: string; // 역할
  @IsOptional() @IsString() keyword?: string; // 키워드

  @IsOptional() @Type(() => Number) @IsInt() @Min(0) skip?: number = 0;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 50;
}

// 세션 메타 업데이트
export class UpdateSessionMetaDto {
  @IsOptional() @IsString() title?: string; // 대화 제목
  @IsOptional() @IsArray() tags?: string[]; // 주제 태그
  @IsOptional() @Type(() => Boolean) @IsBoolean() bookmark?: boolean; // 즐겨찾기
  @IsOptional() @Type(() => Boolean) @IsBoolean() archived?: boolean; // 보관 여부
  @IsOptional() @Type(() => Boolean) @IsBoolean() success?: boolean; // 성공 여부
}

// 세션 생성
export class CreateSessionDto {
  @IsOptional() @IsString() title?: string; // 대화 제목
  @IsOptional() @IsArray() tags?: string[]; // 주제 태그
  @IsOptional() @Type(() => Boolean) @IsBoolean() bookmark?: boolean; // 즐겨찾기
  @IsOptional() @Type(() => Boolean) @IsBoolean() archived?: boolean; // 보관 여부
  @IsOptional() @Type(() => Boolean) @IsBoolean() success?: boolean; // 성공 여부
}

// 메시지 추가
export class AppendMessageDto {
  @IsOptional() @IsString() messageId?: string;
  @Type(() => Number) @IsInt() seq: number;
  @IsString() role: string;
  @IsString() content: string;
  @IsString() timestamp: string;
}
