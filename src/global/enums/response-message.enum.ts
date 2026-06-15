export enum ResponseMessage {
  REGISTER_SUCCESS = '회원가입에 성공했습니다.',
  VERIFICATION_EMAIL_SENT = '인증 이메일이 발송되었습니다. 이메일을 확인해 주세요.',
  VERIFICATION_SUCCESS = '이메일 인증이 완료되었습니다.',
  PASSWORD_RESET_SUCCESS = '비밀번호 재설정이 완료되었습니다. 다시 로그인해주세요.',

  CREATE_WORKSPACE_SUCCESS = '워크스페이스가 성공적으로 생성되었습니다.',
  UPDATE_WORKSPACE_SUCCESS = '워크스페이스가 성공적으로 업데이트되었습니다.',
  DELETE_WORKSPACE_SUCCESS = '워크스페이스가 성공적으로 삭제되었습니다.',
  RESET_INVITE_CODE_SUCCESS = '초대 코드가 성공적으로 재설정되었습니다.',

  CREATE_PROJECT_SUCCESS = '프로젝트가 성공적으로 생성되었습니다.',
  UPDATE_PROJECT_SUCCESS = '프로젝트가 성공적으로 업데이트되었습니다.',
  DELETE_PROJECT_SUCCESS = '프로젝트가 성공적으로 삭제되었습니다.',

  CREATE_LABEL_SUCCESS = '라벨이 성공적으로 생성되었습니다.',

  CREATE_TASK_SUCCESS = '작업이 성공적으로 생성되었습니다.',
  UPDATE_TASK_SUCCESS = '작업이 성공적으로 수정되었습니다.',
  DELETE_TASK_SUCCESS = '작업이 성공적으로 삭제되었습니다.',
  APPROVE_TASK_SUCCESS = '작업이 성공적으로 승인되었습니다.',

  INVITE_PROJECT_MEMBER_SUCCESS = '프로젝트 멤버 초대가 완료되었습니다.',
  UPDATE_PROJECT_MEMBER_SUCCESS = '프로젝트 멤버가 성공적으로 업데이트되었습니다.',
  DELETE_PROJECT_MEMBER_SUCCESS = '프로젝트 멤버가 성공적으로 추방되었습니다.',

  JOIN_WORKSPACE_SUCCESS = '워크스페이스에 성공적으로 참여했습니다.',
  UPDATE_WORKSPACE_MEMBER_SUCCESS = '워크스페이스 멤버가 성공적으로 업데이트되었습니다.',
  DELETE_WORKSPACE_MEMBER_SUCCESS = '워크스페이스 멤버가 성공적으로 추방되었습니다.',

  CREATE_COMMENT_SUCCESS = '댓글이 성공적으로 작성되었습니다.',
  UPDATE_COMMENT_SUCCESS = '댓글이 성공적으로 수정되었습니다.',
  DELETE_COMMENT_SUCCESS = '댓글이 성공적으로 삭제되었습니다.',

  CREATE_EPIC_SUCCESS = '에픽이 성공적으로 생성되었습니다.',
  UPDATE_EPIC_SUCCESS = '에픽이 성공적으로 수정되었습니다.',
  DELETE_EPIC_SUCCESS = '에픽이 성공적으로 삭제되었습니다.',

  CREATE_MILESTONE_SUCCESS = '마일스톤이 성공적으로 생성되었습니다.',
  UPDATE_MILESTONE_SUCCESS = '마일스톤이 성공적으로 수정되었습니다.',
  DELETE_MILESTONE_SUCCESS = '마일스톤이 성공적으로 삭제되었습니다.',

  UPDATE_PROFILE_SUCCESS = '프로필이 성공적으로 업데이트되었습니다.',
  DELETE_USER_SUCCESS = '회원 탈퇴가 완료되었습니다.',
}
