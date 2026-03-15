import SectionHeading from './SectionHeading';
import { useSelectedNote } from '../store';
import StatRow from './StatRow';
import { formatDateTime } from './util';

function Dates() {
  const note = useSelectedNote();

  if (!note) return null;

  return (
    <SectionHeading
      content={
        <>
          <StatRow label="Created" value={formatDateTime(note.createdAt)} />
          <StatRow label="Modified" value={formatDateTime(note.updatedAt)} />
        </>
      }
    >
      Dates
    </SectionHeading>
  );
}

export default Dates;
