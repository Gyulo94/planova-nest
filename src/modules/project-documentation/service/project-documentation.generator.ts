import type { ProjectDocumentationSource } from '../repository/project-documentation.repository';

type ProjectTask = ProjectDocumentationSource['task'][number];
type ProjectMember = ProjectDocumentationSource['projectMember'][number];

const DATE_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const STATUS_LABEL: Record<string, string> = {
  TODO: '할 일',
  IN_PROGRESS: '진행 중',
  REVIEW: '검토 중',
  DONE: '완료',
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
  URGENT: '긴급',
};

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function plainText(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function textOrFallback(
  value: string | null | undefined,
  fallback = '작성된 내용이 없습니다.',
) {
  return escapeHtml(plainText(value) || fallback);
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : DATE_FORMATTER.format(date);
}

function formatDateRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
) {
  const startLabel = formatDate(start);
  const endLabel = formatDate(end);
  if (startLabel === endLabel) return startLabel;
  if (startLabel === '-') return endLabel;
  if (endLabel === '-') return startLabel;
  return `${startLabel} ~ ${endLabel}`;
}

function taskName(task: ProjectTask) {
  return `#${task.taskNumber} ${escapeHtml(task.title)}`;
}

function assigneeName(task: ProjectTask) {
  return escapeHtml(task.assignee?.name || task.assignee?.email || '미지정');
}

function table(headers: string[], rows: string[][], fallback: string) {
  if (rows.length === 0) return `<p>${escapeHtml(fallback)}</p>`;
  return `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function memberName(member: ProjectMember) {
  return member.user.name || member.user.email;
}

function participantTables(members: ProjectMember[]) {
  if (members.length === 0) return '<p>등록된 프로젝트 참여자가 없습니다.</p>';

  const roleOrder = { OWNER: 0, ADMIN: 1, MEMBER: 2 } as const;
  const sortedMembers = [...members].sort(
    (a, b) => roleOrder[a.role] - roleOrder[b.role],
  );
  const groups: ProjectMember[][] = [];
  for (let index = 0; index < sortedMembers.length; index += 6) {
    groups.push(sortedMembers.slice(index, index + 6));
  }

  return groups
    .map(
      (group) =>
        `<table><thead><tr>${group
          .map((member) => {
            const name = memberName(member);
            const image = member.user.image || '/default-avatar.jpg';
            return `<th><img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" width="72" height="72"></th>`;
          })
          .join('')}</tr></thead><tbody><tr>${group
          .map(
            (member) =>
              `<td><strong>${escapeHtml(memberName(member))}</strong></td>`,
          )
          .join('')}</tr></tbody></table>`,
    )
    .join('');
}

function buildWbsRows(project: ProjectDocumentationSource) {
  return project.task.map((task, index) => [
    String(index + 1),
    taskName(task),
    assigneeName(task),
    formatDate(task.startDate),
    formatDate(task.dueDate),
    STATUS_LABEL[task.status] ?? task.status,
    `${task.progress}%`,
  ]);
}

export interface GeneratedProjectDocumentation {
  title: string;
  content: string;
  sourceSummary: {
    generatedAt: string;
    taskCount: number;
    completedTaskCount: number;
    completionRate: number;
    epicCount: number;
    milestoneCount: number;
    troubleshootingCount: number;
  };
}

export function generateProjectDocumentation(
  project: ProjectDocumentationSource,
  now = new Date(),
): GeneratedProjectDocumentation {
  const tasks = project.task;
  const completedTasks = tasks.filter((task) => task.status === 'DONE');
  const openTasks = tasks.filter((task) => task.status !== 'DONE');
  const completionRate = tasks.length
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;
  const title = `${project.name} 프로젝트 결과 보고서`;
  const sourceSummary = {
    generatedAt: now.toISOString(),
    taskCount: tasks.length,
    completedTaskCount: completedTasks.length,
    completionRate,
    epicCount: project.epic.length,
    milestoneCount: project.milestone.length,
    troubleshootingCount: project.troubleshooting.length,
  };

  const milestoneRows = project.milestone.map((milestone) => {
    const epics = project.epic.filter(
      (epic) => epic.milestoneId === milestone.id,
    );
    const milestoneTasks = epics.flatMap((epic) =>
      tasks.filter((task) => task.epicId === epic.id),
    );
    const done = milestoneTasks.filter((task) => task.status === 'DONE').length;
    const progress = milestoneTasks.length
      ? Math.round((done / milestoneTasks.length) * 100)
      : milestone.completed
        ? 100
        : 0;
    return [
      `MILESTONE-${milestone.milestoneNumber}`,
      `<strong>${escapeHtml(milestone.title)}</strong><br>${textOrFallback(milestone.description)}`,
      formatDate(milestone.dueDate),
      String(epics.length),
      `${done}/${milestoneTasks.length}`,
      `${progress}%`,
      milestone.completed ? '완료' : '진행 중',
    ];
  });

  const epicRows = project.epic.map((epic) => {
    const milestone = project.milestone.find(
      (item) => item.id === epic.milestoneId,
    );
    return [
      `EPIC-${epic.epicNumber}`,
      `<strong>${escapeHtml(epic.title)}</strong><br>${textOrFallback(epic.description)}`,
      milestone
        ? `MILESTONE-${milestone.milestoneNumber} ${escapeHtml(milestone.title)}`
        : '미지정',
      formatDateRange(epic.startDate, epic.dueDate),
      `${epic.progress}%`,
    ];
  });

  const completedRows = completedTasks
    .filter((task) => plainText(task.description).length > 0)
    .map((task) => [
      taskName(task),
      assigneeName(task),
      formatDate(task.completedAt),
      textOrFallback(task.description),
    ]);

  const troubleshootingRows = project.troubleshooting.map((item) => [
    `<strong>${escapeHtml(item.title)}</strong>`,
    `#${item.task?.taskNumber ?? item.taskNumberSnapshot} ${escapeHtml(item.task?.title ?? item.taskTitleSnapshot)}${item.task ? '' : ' (삭제된 작업)'}`,
    textOrFallback(item.problem),
    textOrFallback(item.solution),
  ]);

  const openRows = openTasks.map((task) => [
    taskName(task),
    STATUS_LABEL[task.status] ?? task.status,
    PRIORITY_LABEL[task.priority] ?? task.priority,
    assigneeName(task),
    formatDate(task.dueDate),
  ]);

  const content = `
    <h2>프로젝트 참여자</h2>
    ${participantTables(project.projectMember)}
    <h2>1. 프로젝트 요약</h2>
    <p>${textOrFallback(project.description, '등록된 프로젝트 설명이 없습니다.')}</p>
    ${table(
      ['항목', '수치', '항목', '수치'],
      [
        [
          '전체 작업',
          String(tasks.length),
          '완료 작업',
          String(completedTasks.length),
        ],
        [
          '완료율',
          `${completionRate}%`,
          '미완료 작업',
          String(openTasks.length),
        ],
        [
          '에픽',
          String(project.epic.length),
          '마일스톤',
          String(project.milestone.length),
        ],
        [
          '트러블슈팅',
          String(project.troubleshooting.length),
          '최근 갱신일',
          formatDate(project.updatedAt),
        ],
      ],
      '',
    )}
    <h2>2. WBS 일정</h2>
    <p>프로젝트 작업의 담당자, 일정, 진행 상태를 한눈에 확인할 수 있습니다.</p>
    ${table(['WBS', '작업', '담당자', '시작일', '종료일', '상태', '진행률'], buildWbsRows(project), '등록된 작업이 없습니다.')}
    <h2>3. 마일스톤별 진행 결과</h2>
    ${table(['번호', '마일스톤 및 목표', '마감일', '에픽', '완료 작업', '진행률', '상태'], milestoneRows, '등록된 마일스톤이 없습니다.')}
    <h2>4. 에픽별 목표와 진행 결과</h2>
    ${table(['번호', '에픽 목표', '마일스톤', '기간', '진행률'], epicRows, '등록된 에픽이 없습니다.')}
    <h2>5. 주요 완료 결과</h2>
    ${table(['작업', '담당자', '완료일', '주요 산출 내용'], completedRows, '별도로 기록된 주요 산출 내용이 없습니다.')}
    <h2>6. 발생 문제와 해결 방법</h2>
    ${table(['트러블슈팅', '연결 작업', '발생 문제', '해결 방법'], troubleshootingRows, '등록된 트러블슈팅이 없습니다.')}
    <h2>7. 미완료 작업</h2>
    ${table(['작업', '상태', '우선순위', '담당자', '마감일'], openRows, '남아 있는 작업이 없습니다.')}
  `.replace(/\n\s+/g, '');

  return { title, content, sourceSummary };
}
