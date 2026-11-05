import { Checkbox, RadioCardGroup, SelectInput, TextArea, TextInput, type RadioCardOption } from '@carandev/trazos-ui';
import { useState } from 'react';
import { Demo } from '../Demo';
import { BookIcon, UsersIcon } from '../icons';

export function TextInputPage() {
  const [name, setName] = useState('');
  return (
    <>
      <Demo title="Controlled with helper text" description={`Value: "${name}"`} code={`<TextInput label="Name" value={name} onValueChange={setName} />`}>
        <div className="pg-stack">
          <TextInput label="Name" required value={name} onValueChange={setName} placeholder="Your name" helperText="As it should appear on messages." />
        </div>
      </Demo>
      <Demo title="Error, icon, disabled">
        <div className="pg-stack">
          <TextInput label="Email" type="email" defaultValue="not-an-email" error="Enter a valid email address." />
          <TextInput label="Search" leadingIcon={<BookIcon />} placeholder="Search books" />
          <TextInput label="Disabled" disabled defaultValue="Read only value" />
        </div>
      </Demo>
    </>
  );
}

export function TextAreaPage() {
  return (
    <Demo title="Default" code={`<TextArea label="Message" rows={4} />`}>
      <div className="pg-stack">
        <TextArea label="Message" helperText="Up to 500 characters." placeholder="Write something…" />
        <TextArea label="With error" error="This field is required." required />
      </div>
    </Demo>
  );
}

export function SelectInputPage() {
  const [channel, setChannel] = useState('');
  return (
    <Demo title="Controlled" description={`Selected: "${channel}"`} code={`<SelectInput label="Channel" value={channel} onValueChange={setChannel}>…</SelectInput>`}>
      <div className="pg-stack">
        <SelectInput label="Channel" placeholder="Choose a channel" value={channel} onValueChange={setChannel}>
          <option value="whatsapp">WhatsApp</option>
          <option value="web">Web chat</option>
          <option value="email">Email</option>
        </SelectInput>
      </div>
    </Demo>
  );
}

export function CheckboxPage() {
  const [checked, setChecked] = useState(true);
  return (
    <Demo title="Controlled and uncontrolled" code={`<Checkbox label="Send a copy" checked={checked} onCheckedChange={setChecked} />`}>
      <div className="pg-stack">
        <Checkbox label={`Send me a copy (${checked ? 'on' : 'off'})`} checked={checked} onCheckedChange={setChecked} />
        <Checkbox label="Remember this device" defaultChecked={false} />
        <Checkbox label="Disabled" disabled />
      </div>
    </Demo>
  );
}

type Plan = 'personal' | 'team';

const plans: RadioCardOption<Plan>[] = [
  { value: 'personal', title: 'Personal', description: 'One inbox, one number.', icon: <BookIcon /> },
  { value: 'team', title: 'Team', description: 'Shared inbox for your team.', icon: <UsersIcon /> },
];

export function RadioCardGroupPage() {
  const [plan, setPlan] = useState<Plan>('personal');
  return (
    <Demo title="Typed values" description={`Selected: ${plan}`} code={`<RadioCardGroup<Plan> label="Plan" options={plans} value={plan} onValueChange={setPlan} />`}>
      <RadioCardGroup<Plan> label="Plan" options={plans} value={plan} onValueChange={setPlan} />
    </Demo>
  );
}
