export enum ResponseMessage {
  REGISTER_SUCCESS = '회원가입에 성공했습니다.',
  SEND_EMAIL_SUCCESS = '이메일이 성공적으로 전송되었습니다. 이메일을 확인해주세요.',
  VERIFY_EMAIL_SUCCESS = '이메일 인증이 완료되었습니다.',
  RESET_PASSWORD_SUCCESS = '비밀번호 재설정이 완료되었습니다. 다시 로그인해주세요.',

  CREATE_WORKSPACE_SUCCESS = '워크스페이스가 성공적으로 생성되었습니다.',
  UPDATE_WORKSPACE_SUCCESS = '워크스페이스가 성공적으로 업데이트되었습니다.',
  DELETE_WORKSPACE_SUCCESS = '워크스페이스가 성공적으로 삭제되었습니다.',
  RESET_INVITE_CODE_SUCCESS = '초대 코드가 성공적으로 재설정되었습니다.',

  CREATE_PROJECT_SUCCESS = '프로젝트가 성공적으로 생성되었습니다.',
  UPDATE_PROJECT_SUCCESS = '프로젝트가 성공적으로 업데이트되었습니다.',
  DELETE_PROJECT_SUCCESS = '프로젝트가 성공적으로 삭제되었습니다.',

  INVITE_PROJECT_MEMBER_SUCCESS = '프로젝트 멤버 초대가 완료되었습니다.',
  UPDATE_PROJECT_MEMBER_SUCCESS = '프로젝트 멤버가 성공적으로 업데이트되었습니다.',
  DELETE_PROJECT_MEMBER_SUCCESS = '프로젝트 멤버가 성공적으로 추방되었습니다.',

  JOIN_WORKSPACE_SUCCESS = '워크스페이스에 성공적으로 참여했습니다.',
  UPDATE_WORKSPACE_MEMBER_SUCCESS = '워크스페이스 멤버가 성공적으로 업데이트되었습니다.',
  DELETE_WORKSPACE_MEMBER_SUCCESS = '워크스페이스 멤버가 성공적으로 추방되었습니다.',
}
