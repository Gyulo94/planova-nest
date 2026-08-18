import { HttpStatus } from '@nestjs/common';

export enum ErrorCode {
  // 일반적인 에러
  INTERNAL_SERVER_ERROR = 'SERVER_001',
  BAD_REQUEST = 'COMMON_001',
  FORBIDDEN = 'COMMON_002',
  UNAUTHORIZED = 'COMMON_003',

  // 인증 관련 에러
  INVALID_EMAIL_OR_PASSWORD = 'AUTH_001',
  ACCESS_TOKEN_NOT_FOUND = 'AUTH_002',
  INSUFFICIENT_ROLE = 'AUTH_003',
  INVALID_OR_EXPIRED_TOKEN = 'AUTH_004',
  ALREADY_EXIST_LOCAL_USER = 'AUTH_005',
  ALREADY_EXIST_SOCIAL_USER = 'AUTH_006',
  REFRESH_TOKEN_NOT_FOUND = 'AUTH_007',
  INVALID_REFRESH_TOKEN = 'AUTH_008',

  // 사용자 관련 에러
  USER_NOT_FOUND = 'USER_001',

  // 워크스페이스 관련 에러
  WORKSPACE_NOT_FOUND = 'WORKSPACE_001',
  CAN_NOT_DELETE_ONLY_MY_OWN_WORKSPACE = 'WORKSPACE_002',

  // 워크스페이스 멤버관련 에러
  WORKSPACE_MEMBER_NOT_FOUND = 'WORKSPACE_MEMBER_001',
  WORKSPACE_MEMBER_ALREADY_EXISTS = 'WORKSPACE_MEMBER_002',
  INVALID_INVITE_CODE = 'WORKSPACE_MEMBER_003',
  WORKSPACE_MEMBER_ROLE_FORBIDDEN = 'WORKSPACE_MEMBER_004',

  // 프로젝트 관련 에러
  PROJECT_NOT_FOUND = 'PROJECT_001',

  // 프로젝트 멤버 관련 에러
  PROJECT_MEMBER_NOT_FOUND = 'PROJECT_MEMBER_001',
  PROJECT_MEMBER_ROLE_FORBIDDEN = 'PROJECT_MEMBER_002',

  // 하위작업 관련 에러
  SUBTASK_NOT_FOUND = 'SUBTASK_001',

  // 작업 관련 에러
  TASK_NOT_FOUND = 'TASK_001',
  INVALID_TASK_STATUS = 'TASK_002',
  COMMENT_NOT_FOUND = 'COMMENT_001',
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

  // 사용자 관련 에러
  [ErrorCode.USER_NOT_FOUND]: {
    status: HttpStatus.BAD_REQUEST,
    message: '사용자를 찾을 수 없습니다.',
  },

  // 워크스페이스 관련 에러
  [ErrorCode.WORKSPACE_NOT_FOUND]: {
    status: HttpStatus.BAD_REQUEST,
    message: '워크스페이스를 찾을 수 없습니다.',
  },
  [ErrorCode.CAN_NOT_DELETE_ONLY_MY_OWN_WORKSPACE]: {
    status: HttpStatus.BAD_REQUEST,
    message: '소유자인 유일한 워크스페이스는 삭제할 수 없습니다.',
  },

  // 워크스페이스 멤버관련 에러
  [ErrorCode.WORKSPACE_MEMBER_NOT_FOUND]: {
    status: HttpStatus.BAD_REQUEST,
    message: '워크스페이스 멤버를 찾을 수 없습니다.',
  },
  [ErrorCode.WORKSPACE_MEMBER_ALREADY_EXISTS]: {
    status: HttpStatus.BAD_REQUEST,
    message: '이미 참여한 워크스페이스입니다.',
  },
  [ErrorCode.INVALID_INVITE_CODE]: {
    status: HttpStatus.BAD_REQUEST,
    message: '유효하지 않은 초대 코드입니다.',
  },
  [ErrorCode.WORKSPACE_MEMBER_ROLE_FORBIDDEN]: {
    status: HttpStatus.FORBIDDEN,
    message: '해당 작업을 수행할 권한이 없습니다.',
  },

  // 프로젝트 관련 에러
  [ErrorCode.PROJECT_NOT_FOUND]: {
    status: HttpStatus.BAD_REQUEST,
    message: '프로젝트를 찾을 수 없습니다.',
  },

  // 프로젝트 멤버 관련 에러
  [ErrorCode.PROJECT_MEMBER_NOT_FOUND]: {
    status: HttpStatus.BAD_REQUEST,
    message: '프로젝트 멤버를 찾을 수 없습니다.',
  },
  [ErrorCode.PROJECT_MEMBER_ROLE_FORBIDDEN]: {
    status: HttpStatus.FORBIDDEN,
    message: '해당 작업을 수행할 권한이 없습니다.',
  },

  // 하위작업 관련 에러
  [ErrorCode.SUBTASK_NOT_FOUND]: {
    status: HttpStatus.BAD_REQUEST,
    message: '하위 작업을 찾을 수 없습니다.',
  },

  // 작업 관련 에러
  [ErrorCode.TASK_NOT_FOUND]: {
    status: HttpStatus.BAD_REQUEST,
    message: '작업을 찾을 수 없습니다.',
  },
  [ErrorCode.INVALID_TASK_STATUS]: {
    status: HttpStatus.BAD_REQUEST,
    message: '유효하지 않은 작업 상태입니다.',
  },
  [ErrorCode.COMMENT_NOT_FOUND]: {
    status: HttpStatus.BAD_REQUEST,
    message: '댓글을 찾을 수 없습니다.',
  },
};
