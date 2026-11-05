import { Badge, DataTable, Skeleton, TabItem, Tabs, type TabsVariant } from '@carandev/trazos-ui';
import { useState } from 'react';
import { Demo } from '../Demo';
import { BookIcon, UsersIcon } from '../icons';

const variants: TabsVariant[] = ['underline', 'pills', 'contained'];

export function TabsPage() {
  const [key, setKey] = useState('members');
  return (
    <>
      {variants.map((variant) => (
        <Demo key={variant} title={`Variant: ${variant}`} code={`<Tabs variant="${variant}">\n  <TabItem title="Overview">…</TabItem>\n</Tabs>`}>
          <Tabs variant={variant}>
            <TabItem title="Overview">Overview content.</TabItem>
            <TabItem title="Members" icon={<UsersIcon />} badge={12}>
              Members content.
            </TabItem>
            <TabItem title="Archived" disabled>
              Archived content.
            </TabItem>
          </Tabs>
        </Demo>
      ))}
      <Demo title="Controlled by key" description={`Active key: ${key}. Use arrow keys, Home and End on the tab list.`}>
        <Tabs activeKey={key} onActiveKeyChange={setKey}>
          <TabItem tabKey="library" title="Library" icon={<BookIcon />}>
            Library content.
          </TabItem>
          <TabItem tabKey="members" title="Members" icon={<UsersIcon />}>
            Members content.
          </TabItem>
        </Tabs>
      </Demo>
    </>
  );
}

export function SkeletonPage() {
  return (
    <Demo title="Variants" code={`<Skeleton variant="text" count={3} />`}>
      <div className="pg-stack">
        <Skeleton variant="text" count={3} />
        <Skeleton variant="circular" width="48px" height="48px" />
        <Skeleton variant="rounded" height="2.5rem" />
        <Skeleton variant="card" height="120px" />
      </div>
    </Demo>
  );
}

interface Contact {
  id: number;
  name: string;
  channel: string;
  status: 'active' | 'paused';
}

const contacts: Contact[] = [
  { id: 1, name: 'Ana Torres', channel: 'WhatsApp', status: 'active' },
  { id: 2, name: 'Luis Gómez', channel: 'Web chat', status: 'paused' },
  { id: 3, name: 'Marta Ruiz', channel: 'WhatsApp', status: 'active' },
];

export function DataTablePage() {
  const [loading, setLoading] = useState(false);
  const [clicked, setClicked] = useState<string>('none');
  return (
    <>
      <Demo title="Rows, click and loading" description={`Last clicked: ${clicked}`} code={`<DataTable items={contacts} tableHeader={…} rowTemplate={(c) => …} onRowClick={…} />`}>
        <label style={{ display: 'inline-flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            checked={loading}
            onChange={(e) => {
              setLoading(e.target.checked);
            }}
          />
          Loading
        </label>
        <DataTable
          items={contacts}
          loading={loading}
          getRowKey={(c) => c.id}
          onRowClick={(c) => {
            setClicked(c.name);
          }}
          tableHeader={
            <>
              <th>Name</th>
              <th>Channel</th>
              <th>Status</th>
            </>
          }
          rowTemplate={(c) => (
            <>
              <td>{c.name}</td>
              <td>{c.channel}</td>
              <td>
                <Badge variant={c.status === 'active' ? 'success' : 'neutral'}>{c.status}</Badge>
              </td>
            </>
          )}
        />
      </Demo>
      <Demo title="Empty">
        <DataTable<Contact> items={[]} tableHeader={<th>Name</th>} rowTemplate={(c) => <td>{c.name}</td>} />
      </Demo>
    </>
  );
}
