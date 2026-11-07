import type { PageDocument } from '../../types/page';
import type { ValidationIssue } from '../validation';
import { allBlocks } from '../sitePages';
import { formsAddOnActive, readForms } from './storage';
import { closedReason, formIssues } from './logic';

/** Publish checks for Form blocks (D79): add-on installed, form exists, live and complete. */
export function formLinkIssues(doc: PageDocument, workspaceId: string): ValidationIssue[] {
  const blocks = allBlocks(doc).filter((b) => b.type === 'form' && !b.visibility.hidden);
  if (blocks.length === 0) return [];
  const active = formsAddOnActive(workspaceId);
  const data = readForms(workspaceId);
  const issues: ValidationIssue[] = [];
  blocks.forEach((b) => {
    if (b.type !== 'form') return;
    if (!active) issues.push({ id: `${b.id}:form:addon`, blockId: b.id, severity: 'error', message: 'Install the Forms add-on from Extensions to publish this block', field: 'formId' });
    if (!b.content.formId) return;
    const form = data.forms.find((f) => f.id === b.content.formId);
    if (!form) return issues.push({ id: `${b.id}:form:missing`, blockId: b.id, severity: 'error', message: 'This form was deleted — choose another', field: 'formId' });
    if (form.status === 'draft') issues.push({ id: `${b.id}:form:draft`, blockId: b.id, severity: 'error', message: `“${form.name}” is a draft — set it live in Forms`, field: 'formId' });
    const count = data.submissions.filter((s) => s.formId === form.id).length;
    const closed = form.status !== 'draft' ? closedReason(form, count) : null;
    if (closed) issues.push({ id: `${b.id}:form:closed`, blockId: b.id, severity: 'warning', message: `${closed} Visitors will see that message.`, field: 'formId' });
    const problems = formIssues(form);
    if (problems.length) issues.push({ id: `${b.id}:form:fields`, blockId: b.id, severity: 'error', message: `“${form.name}”: ${problems[0]}`, field: 'formId' });
  });
  return issues;
}
