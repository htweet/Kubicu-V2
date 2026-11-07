import React, { useState } from 'react';
import { PrinterIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { Course, Enrolment } from '../../types/courses';
import { buttonStyle, inputStyle } from '../blocks/pageStyle';
import { CertificateSheet } from '../certificates/CertificateSheet';
import { initials } from '../../utils/certificates';

interface Props {
  theme: PageTheme;
  course: Course;
  enrolment: Enrolment;
  business: string;
  onSaveName: (name: string) => void;
}

/** A printable completion certificate. Never called accredited (D197, look D213). */
export function CourseCertificate({ theme: t, course, enrolment, business, onSaveName }: Props) {
  const [name, setName] = useState(enrolment.name);
  const date = enrolment.completedAt ? new Date(enrolment.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const ready = !!enrolment.name.trim();

  return (
    <div className="flex flex-col gap-5">
      {!ready || name !== enrolment.name ? (
        <form
          className="flex flex-col gap-2 print:hidden sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onSaveName(name);
          }}
        >
          <label className="flex flex-1 flex-col gap-1.5 text-[13px] font-medium" style={{ color: t.text }}>
            Your name, as it should appear
            <input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} className="h-12 px-3.5 text-[15px] outline-none focus:ring-2" style={inputStyle(t)} />
          </label>
          <button type="submit" disabled={!name.trim()} className="flex h-12 items-center justify-center px-6 text-[15px] font-semibold disabled:opacity-50" style={buttonStyle(t, 'featured')}>
            Save name
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-2 print:hidden sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => window.print()} className="flex h-12 items-center justify-center gap-2 px-6 text-[15px] font-semibold" style={buttonStyle(t, 'featured')}>
            <PrinterIcon size={16} aria-hidden /> Print or save as PDF
          </button>
          <p className="text-[13px]" style={{ color: t.mutedText }}>
            Prints on one A4 page, landscape.
          </p>
        </div>
      )}

      <CertificateSheet
        label="Certificate of completion"
        kind="Completion"
        issuer={business}
        lead="This is to certify that"
        recipient={enrolment.name}
        statement="has completed every lesson of the course"
        subject={course.title}
        date={{ label: 'Date completed', value: date }}
        signature={{ name: course.instructor || business, role: course.instructor ? 'Instructor' : 'Issued by' }}
        seal={{ rim: 'Course completed · Certified ·', mark: initials(business) }}
        code={enrolment.certificateNo ? `No. ${enrolment.certificateNo}` : undefined}
        footnote={`Issued by ${business} through KUBICU. This confirms course completion only. It is not an accredited qualification.`}
        accent={t.accent}
      />
    </div>
  );
}
