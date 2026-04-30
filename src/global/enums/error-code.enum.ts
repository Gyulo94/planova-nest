import { HttpStatus } from '@nestjs/common';

export enum ErrorCode {
  // 일반적인 에러
  INTERNAL_SERVER_ERROR = 'SERVER_001',
  BAD_REQUEST = 'COMMON_001',
  FORBIDDEN = 'COMMON_002',
  UNAUTHORIZED = 'COMMON_003',

  // 회원 관련 에러
  ALREADY_EXIST_EMAIL = 'USER_001',
  EMAIL_NOT_FOUND = 'USER_002',
  RESET_PASSWORD_NOT_ALLOWED_SOCIAL_USER = 'USER_003',
  USER_NOT_FOUND = 'USER_004',

  // 인증 관련 에러
  INVALID_EMAIL_OR_PASSWORD = 'AUTH_001',
  ACCESS_TOKEN_NOT_FOUND = 'AUTH_002',
  INSUFFICIENT_ROLE = 'AUTH_003',
  INVALID_OR_EXPIRED_TOKEN = 'AUTH_004',
  ALREADY_EXIST_LOCAL_USER = 'AUTH_005',
  ALREADY_EXIST_SOCIAL_USER = 'AUTH_006',
  REFRESH_TOKEN_NOT_FOUND = 'AUTH_007',
  INVALID_REFRESH_TOKEN = 'AUTH_008',
}

export const ErrorCodeMap: Record<
  ErrorCode,
  { status: HttpStatus; message: string }
> = {
  // 일반적인 에러
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: '서버 내부 오류가 발생했습니다.',
  },
  [ErrorCode.BAD_REQUEST]: {
    status: HttpStatus.BAD_REQUEST,
    message: '잘못된 요청입니다.',
  },
  [ErrorCode.FORBIDDEN]: {
    status: HttpStatus.FORBIDDEN,
    message: '접근이 거부되었습니다.',
  },
  [ErrorCode.UNAUTHORIZED]: {
    status: HttpStatus.UNAUTHORIZED,
    message: '인증이 필요합니다.',
  },

  // 회원 관련 에러
  [ErrorCode.ALREADY_EXIST_EMAIL]: {
    status: HttpStatus.BAD_REQUEST,
    message: '이미 존재하는 이메일입니다.',
  },
  [ErrorCode.EMAIL_NOT_FOUND]: {
    status: HttpStatus.BAD_REQUEST,
    message: '가입되지 않은 이메일입니다.',
  },
  [ErrorCode.RESET_PASSWORD_NOT_ALLOWED_SOCIAL_USER]: {
    status: HttpStatus.BAD_REQUEST,
    message: '소셜 로그인한 사용자는 비밀번호 재설정을 할 수 없습니다.',
  },
  [ErrorCode.USER_NOT_FOUND]: {
    status: HttpStatus.BAD_REQUEST,
    message: '유저를 찾을 수 없습니다.',
  },

  // 인증 관련 에러
  [ErrorCode.INVALID_EMAIL_OR_PASSWORD]: {
    status: HttpStatus.BAD_REQUEST,
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
  },
  [ErrorCode.ACCESS_TOKEN_NOT_FOUND]: {
    status: HttpStatus.UNAUTHORIZED,
    message: '액세스 토큰이 없습니다.',
  },
  [ErrorCode.INSUFFICIENT_ROLE]: {
    status: HttpStatus.FORBIDDEN,
    message: '권한이 없습니다.',
  },
  [ErrorCode.INVALID_OR_EXPIRED_TOKEN]: {
    status: HttpStatus.UNAUTHORIZED,
    message: '유효하지 않거나 만료된 토큰입니다.',
  },
  [ErrorCode.ALREADY_EXIST_LOCAL_USER]: {
    status: HttpStatus.BAD_REQUEST,
    message: '이미 이메일/비밀번호로 가입된 유저입니다.',
  },
  [ErrorCode.ALREADY_EXIST_SOCIAL_USER]: {
    status: HttpStatus.BAD_REQUEST,
    message: '이미 소셜 로그인으로 가입된 유저입니다.',
  },
  [ErrorCode.REFRESH_TOKEN_NOT_FOUND]: {
    status: HttpStatus.UNAUTHORIZED,
    message: '리프레시 토큰이 없습니다.',
  },
  [ErrorCode.INVALID_REFRESH_TOKEN]: {
    status: HttpStatus.UNAUTHORIZED,
    message: '유효하지 않거나 만료된 리프레시 토큰입니다.',
  },
};
